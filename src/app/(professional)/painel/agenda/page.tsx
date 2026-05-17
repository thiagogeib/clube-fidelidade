import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { AgendaView } from "@/components/professional/AgendaView"

export const metadata: Metadata = { title: "Agenda" }

export default async function AgendaPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "PROFESSIONAL") redirect("/login")

  const today = new Date()
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const endPeriod = new Date(startOfDay.getTime() + 30 * 86400000)

  const appointments = await db.appointment.findMany({
    where: {
      professionalId: session.user.id,
      scheduledAt: { gte: startOfDay, lt: endPeriod },
    },
    include: {
      client: { select: { id: true, name: true, email: true, phone: true, image: true } },
    },
    orderBy: { scheduledAt: "asc" },
  })

  return (
    <div className="p-4 sm:p-8 pt-6 space-y-6">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-slate-800">Agenda</h1>
        <p className="text-muted-foreground mt-1">Próximos 30 dias de agendamentos</p>
      </div>
      <AgendaView appointments={appointments} />
    </div>
  )
}
