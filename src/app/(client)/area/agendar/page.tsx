import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { AgendarForm } from "@/components/client/AgendarForm"

export const metadata: Metadata = { title: "Agendar Horário" }

export default async function AgendarPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "CLIENT") redirect("/login")

  const subscription = await db.subscription.findFirst({
    where: { clientId: session.user.id, status: "ACTIVE" },
    include: { plan: true },
  })

  const myAppointments = subscription
    ? await db.appointment.findMany({
        where: {
          clientId: session.user.id,
          scheduledAt: { gte: new Date() },
          status: { in: ["PENDING", "CONFIRMED"] },
        },
        orderBy: { scheduledAt: "asc" },
      })
    : []

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold" style={{ color: "var(--brand-text)" }}>
          Agendar Horário
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Escolha a data e horário para o seu atendimento
        </p>
      </div>

      <AgendarForm
        subscription={subscription ? {
          id: subscription.id,
          appointmentsUsed: subscription.appointmentsUsed,
          plan: {
            appointmentsPerMonth: subscription.plan.appointmentsPerMonth,
            name: subscription.plan.name,
          },
        } : null}
        upcomingAppointments={myAppointments}
      />
    </div>
  )
}
