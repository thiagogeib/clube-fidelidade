import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { updateAppointmentSchema, cancelAppointmentSchema } from "@/lib/validations/appointments"

// GET /api/appointments/:id
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized", message: "Não autenticado" }, { status: 401 })
  }

  const { id } = await params
  const appointment = await db.appointment.findUnique({
    where:   { id },
    include: { client: { select: { id: true, name: true, email: true, image: true, phone: true } } },
  })

  if (!appointment) {
    return NextResponse.json({ error: "NotFound", message: "Agendamento não encontrado" }, { status: 404 })
  }

  const canAccess =
    appointment.clientId       === session.user.id ||
    appointment.professionalId === session.user.id

  if (!canAccess) {
    return NextResponse.json({ error: "Forbidden", message: "Acesso negado" }, { status: 403 })
  }

  return NextResponse.json({ data: appointment })
}

// PATCH /api/appointments/:id
// Profissional: pode confirmar, completar, marcar no_show.
// Cliente: pode apenas cancelar (via campo status = CANCELLED) até X horas antes.
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized", message: "Não autenticado" }, { status: 401 })
  }

  const { id } = await params
  const appointment = await db.appointment.findUnique({ where: { id } })

  if (!appointment) {
    return NextResponse.json({ error: "NotFound", message: "Agendamento não encontrado" }, { status: 404 })
  }

  const canAccess =
    appointment.clientId       === session.user.id ||
    appointment.professionalId === session.user.id

  if (!canAccess) {
    return NextResponse.json({ error: "Forbidden", message: "Acesso negado" }, { status: 403 })
  }

  const body   = await req.json()
  const parsed = updateAppointmentSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "ValidationError", message: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const { status, cancelReason, ...rest } = parsed.data as typeof parsed.data & { cancelReason?: string }

  const data: Record<string, unknown> = { ...rest }
  if (status) data.status = status
  if (status === "CANCELLED") {
    data.cancelledAt  = new Date()
    data.cancelReason = cancelReason ?? null
  }

  const updated = await db.appointment.update({ where: { id }, data })
  return NextResponse.json({ data: updated })
}

// DELETE /api/appointments/:id
// Alias para cancelamento — equivale a PATCH com status=CANCELLED.
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized", message: "Não autenticado" }, { status: 401 })
  }

  const { id } = await params
  const appointment = await db.appointment.findUnique({ where: { id } })

  if (!appointment) {
    return NextResponse.json({ error: "NotFound", message: "Agendamento não encontrado" }, { status: 404 })
  }

  const canAccess =
    appointment.clientId       === session.user.id ||
    appointment.professionalId === session.user.id

  if (!canAccess) {
    return NextResponse.json({ error: "Forbidden", message: "Acesso negado" }, { status: 403 })
  }

  const body   = await req.json().catch(() => ({}))
  const parsed = cancelAppointmentSchema.safeParse(body)

  const updated = await db.appointment.update({
    where: { id },
    data: {
      status:       "CANCELLED",
      cancelledAt:  new Date(),
      cancelReason: parsed.success ? parsed.data.cancelReason : null,
    },
  })

  return NextResponse.json({ data: updated })
}
