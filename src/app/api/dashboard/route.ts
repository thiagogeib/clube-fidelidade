import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns"

// GET /api/dashboard
// Apenas PROFESSIONAL: retorna métricas agregadas para o dashboard.

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized", message: "Não autenticado" }, { status: 401 })
  }
  if (session.user.role !== "PROFESSIONAL") {
    return NextResponse.json({ error: "Forbidden", message: "Acesso negado" }, { status: 403 })
  }

  const now   = new Date()
  const today = { gte: startOfDay(now), lte: endOfDay(now) }
  const month = { gte: startOfMonth(now), lte: endOfMonth(now) }

  const [
    appointmentsToday,
    pendingAppointments,
    activeSubscriptions,
  ] = await Promise.all([
    db.appointment.count({
      where: {
        professionalId: session.user.id,
        scheduledAt:    today,
        status:         { not: "CANCELLED" },
      },
    }),
    db.appointment.count({
      where: {
        professionalId: session.user.id,
        status:         "PENDING",
      },
    }),
    db.subscription.findMany({
      where: {
        plan:   { professionalId: session.user.id },
        status: "ACTIVE",
      },
      select: { id: true, plan: { select: { priceInCents: true } } },
    }),
  ])

  const activeClients    = activeSubscriptions.length
  const monthlyRevenue   = activeSubscriptions.reduce(
    (sum: number, sub: { plan: { priceInCents: number } }) => sum + sub.plan.priceInCents,
    0,
  )

  return NextResponse.json({
    data: {
      appointmentsToday,
      pendingAppointments,
      activeClients,
      monthlyRevenue,
    },
  })
}
