import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { DashboardMetrics } from "@/components/professional/DashboardMetrics"
import { RecentAppointments } from "@/components/professional/RecentAppointments"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Visão geral do seu negócio",
}

export default async function PainelPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "PROFESSIONAL") redirect("/login")

  const professionalId = session.user.id

  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const endOfDay = new Date(startOfDay.getTime() + 86400000)

  const [
    totalActiveClients,
    appointmentsToday,
    appointmentsThisMonth,
    activeSubscriptions,
    upcomingAppointments,
  ] = await Promise.all([
    db.subscription.count({
      where: { plan: { professionalId }, status: "ACTIVE" },
    }),
    db.appointment.count({
      where: {
        professionalId,
        scheduledAt: { gte: startOfDay, lt: endOfDay },
        status: { not: "CANCELLED" },
      },
    }),
    db.appointment.count({
      where: {
        professionalId,
        scheduledAt: { gte: startOfMonth },
        status: { not: "CANCELLED" },
      },
    }),
    db.subscription.count({
      where: { plan: { professionalId }, status: "ACTIVE" },
    }),
    db.appointment.findMany({
      where: {
        professionalId,
        scheduledAt: { gte: startOfDay },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      include: {
        client: { select: { name: true, email: true, phone: true, image: true } },
      },
      orderBy: { scheduledAt: "asc" },
      take: 8,
    }),
  ])

  const metrics = {
    totalActiveClients,
    appointmentsToday,
    appointmentsThisMonth,
    activeSubscriptions,
  }

  return (
    <div className="p-4 sm:p-8 pt-6 space-y-8">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-slate-800">
          Olá, {session.user.name?.split(" ")[0]}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Aqui está um resumo do seu negócio hoje.
        </p>
      </div>

      <DashboardMetrics metrics={metrics} />

      <div>
        <h2 className="font-heading text-lg font-semibold text-slate-800 mb-4">
          Próximos agendamentos
        </h2>
        <RecentAppointments appointments={upcomingAppointments} />
      </div>
    </div>
  )
}
