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

  const professionalId = subscription?.plan.professionalId

  const [myAppointments, services, availability] = await Promise.all([
    subscription
      ? db.appointment.findMany({
          where: {
            clientId: session.user.id,
            scheduledAt: { gte: new Date() },
            status: { in: ["PENDING", "CONFIRMED"] },
          },
          orderBy: { scheduledAt: "asc" },
        })
      : Promise.resolve([]),
    professionalId
      ? db.service.findMany({
          where: { professionalId, isActive: true },
          orderBy: { createdAt: "asc" },
        })
      : Promise.resolve([]),
    professionalId
      ? db.availability.findMany({
          where: { professionalId, isActive: true },
          orderBy: { dayOfWeek: "asc" },
        })
      : Promise.resolve([]),
  ])

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold" style={{ color: "var(--brand-text)" }}>
          Agendar Horário
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Escolha o serviço, a data e o horário para o seu atendimento
        </p>
      </div>

      <AgendarForm
        subscription={
          subscription
            ? {
                id: subscription.id,
                appointmentsUsed: subscription.appointmentsUsed,
                plan: {
                  appointmentsPerMonth: subscription.plan.appointmentsPerMonth,
                  name: subscription.plan.name,
                },
              }
            : null
        }
        upcomingAppointments={myAppointments}
        services={services}
        availability={availability}
      />
    </div>
  )
}
