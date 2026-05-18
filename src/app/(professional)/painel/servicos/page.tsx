import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { Scissors } from "lucide-react"
import { ServicesManager } from "@/components/professional/ServicesManager"

export const metadata: Metadata = { title: "Serviços" }

export default async function ServicosPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "PROFESSIONAL") redirect("/login")

  const services = await db.service.findMany({
    where: { professionalId: session.user.id, isActive: true },
    orderBy: { createdAt: "asc" },
  })

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: "var(--brand-background)" }}
        >
          <Scissors className="w-5 h-5" style={{ color: "var(--brand-primary)" }} />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold" style={{ color: "var(--brand-text)" }}>
            Serviços
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Gerencie os serviços que você oferece e suas durações
          </p>
        </div>
      </div>

      <ServicesManager initialServices={services} />
    </div>
  )
}
