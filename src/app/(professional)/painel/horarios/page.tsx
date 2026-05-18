import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { Clock } from "lucide-react"
import { AvailabilityManager } from "@/components/professional/AvailabilityManager"

export const metadata: Metadata = { title: "Horários" }

export default async function HorariosPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "PROFESSIONAL") redirect("/login")

  const availability = await db.availability.findMany({
    where: { professionalId: session.user.id },
    orderBy: { dayOfWeek: "asc" },
  })

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: "var(--brand-background)" }}
        >
          <Clock className="w-5 h-5" style={{ color: "var(--brand-primary)" }} />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold" style={{ color: "var(--brand-text)" }}>
            Horários disponíveis
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Configure seus dias e horários de atendimento
          </p>
        </div>
      </div>

      <AvailabilityManager initialAvailability={availability} />
    </div>
  )
}
