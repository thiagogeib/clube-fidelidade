import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { updateAppointmentSchema, cancelAppointmentSchema } from "@/lib/validations/appointments"
import { sendAppointmentConfirmed, sendAppointmentCancelled } from "@/lib/email"

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
    include: {
      client:  { select: { id: true, name: true, email: true, image: true, phone: true } },
      service: { select: { id: true, name: true } },
    },
  })

  if (!appointment) {
    return NextResponse.json({ error: "NotFound", message: "Agendamento não encontrado" }, { status: 404 })
  }

  const canAccess = appointment.clientId === session.user.id || appointment.professionalId === session.user.id
  if (!canAccess) {
    return NextResponse.json({ error: "Forbidden", message: "Acesso negado" }, { status: 403 })
  }

  return NextResponse.json({ data: appointment })
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized", message: "Não autenticado" }, { status: 401 })
  }

  const { id } = await params
  const appointment = await db.appointment.findUnique({
    where:   { id },
    include: { client: { select: { name: true, email: true } } },
  })

  if (!appointment) {
    return NextResponse.json({ error: "NotFound", message: "Agendamento não encontrado" }, { status: 404 })
  }

  const canAccess = appointment.clientId === session.user.id || appointment.professionalId === session.user.id
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

  // Emails assíncronos
  const clientEmail = appointment.client?.email
  const clientName  = appointment.client?.name ?? "Cliente"
  if (clientEmail && status && status !== appointment.status) {
    if (status === "CONFIRMED") {
      sendAppointmentConfirmed({
        to:          clientEmail,
        clientName,
        scheduledAt: appointment.scheduledAt,
        serviceType: appointment.serviceType,
      })
    } else if (status === "CANCELLED") {
      sendAppointmentCancelled({
        to:          clientEmail,
        clientName,
        scheduledAt: appointment.scheduledAt,
        serviceType: appointment.serviceType,
        cancelReason: cancelReason ?? null,
        cancelledBy: session.user.role === "PROFESSIONAL" ? "professional" : "client",
      })
    }
  }

  return NextResponse.json({ data: updated })
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized", message: "Não autenticado" }, { status: 401 })
  }

  const { id } = await params
  const appointment = await db.appointment.findUnique({
    where:   { id },
    include: { client: { select: { name: true, email: true } } },
  })

  if (!appointment) {
    return NextResponse.json({ error: "NotFound", message: "Agendamento não encontrado" }, { status: 404 })
  }

  const canAccess = appointment.clientId === session.user.id || appointment.professionalId === session.user.id
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

  // Email assíncrono
  if (appointment.client?.email) {
    sendAppointmentCancelled({
      to:          appointment.client.email,
      clientName:  appointment.client.name ?? "Cliente",
      scheduledAt: appointment.scheduledAt,
      serviceType: appointment.serviceType,
      cancelReason: parsed.success ? parsed.data.cancelReason : null,
      cancelledBy: session.user.role === "PROFESSIONAL" ? "professional" : "client",
    })
  }

  return NextResponse.json({ data: updated })
}
