import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { createAppointmentSchema } from "@/lib/validations/appointments"

// GET /api/appointments
// CLIENT: lista seus próprios agendamentos.
// PROFESSIONAL: lista todos os agendamentos da sua agenda.
// Query params: status, from (ISO date), to (ISO date), page, pageSize

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized", message: "Não autenticado" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const page     = Math.max(1, Number(searchParams.get("page") ?? 1))
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? 20)))
  const skip     = (page - 1) * pageSize
  const status   = searchParams.get("status") ?? undefined
  const from     = searchParams.get("from") ? new Date(searchParams.get("from")!) : undefined
  const to       = searchParams.get("to")   ? new Date(searchParams.get("to")!)   : undefined

  const where = {
    ...(session.user.role === "CLIENT"
      ? { clientId: session.user.id }
      : { professionalId: session.user.id }),
    ...(status ? { status: status as never } : {}),
    ...(from || to
      ? {
          scheduledAt: {
            ...(from ? { gte: from } : {}),
            ...(to   ? { lte: to   } : {}),
          },
        }
      : {}),
  }

  const [appointments, total] = await Promise.all([
    db.appointment.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, email: true, image: true, phone: true } },
      },
      orderBy: { scheduledAt: "asc" },
      skip,
      take: pageSize,
    }),
    db.appointment.count({ where }),
  ])

  return NextResponse.json({
    data: appointments,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  })
}

// POST /api/appointments
// CLIENT: cria um agendamento consumindo cota da assinatura ativa.

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized", message: "Não autenticado" }, { status: 401 })
  }
  if (session.user.role !== "CLIENT") {
    return NextResponse.json({ error: "Forbidden", message: "Apenas clientes podem agendar" }, { status: 403 })
  }

  const body   = await req.json()
  const parsed = createAppointmentSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "ValidationError", message: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  // Verificar assinatura ativa
  const subscription = await db.subscription.findFirst({
    where:   { clientId: session.user.id, status: "ACTIVE" },
    include: { plan: true },
  })

  if (!subscription) {
    return NextResponse.json(
      { error: "Forbidden", message: "Você não possui uma assinatura ativa" },
      { status: 403 },
    )
  }

  // Verificar cota mensal
  if (subscription.appointmentsUsed >= subscription.plan.appointmentsPerMonth) {
    return NextResponse.json(
      { error: "Forbidden", message: "Cota de agendamentos do mês esgotada" },
      { status: 403 },
    )
  }

  const { scheduledAt, durationMinutes, serviceType, notes } = parsed.data

  // Transação: cria agendamento e incrementa counter na assinatura
  const appointment = await db.$transaction(async (tx) => {
    const appt = await tx.appointment.create({
      data: {
        clientId:       session.user.id,
        professionalId: subscription.plan.professionalId,
        subscriptionId: subscription.id,
        scheduledAt:    new Date(scheduledAt),
        durationMinutes,
        serviceType,
        notes,
        status: "PENDING",
      },
    })

    await tx.subscription.update({
      where: { id: subscription.id },
      data:  { appointmentsUsed: { increment: 1 } },
    })

    return appt
  })

  return NextResponse.json({ data: appointment }, { status: 201 })
}
