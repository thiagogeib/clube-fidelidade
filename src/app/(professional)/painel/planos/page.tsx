import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { PlanosManager } from "@/components/professional/PlanosManager"

export const metadata: Metadata = { title: "Planos do Clube" }

export default async function PlanosPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "PROFESSIONAL") redirect("/login")

  const planos = await db.plan.findMany({
    where: { professionalId: session.user.id, isActive: true },
    include: {
      _count: { select: { subscriptions: { where: { status: "ACTIVE" } } } },
    },
    orderBy: { priceInCents: "asc" },
  })

  return (
    <div className="p-4 sm:p-8 pt-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-slate-800">Planos do Clube</h1>
          <p className="text-muted-foreground mt-1">Gerencie os planos de assinatura das suas clientes</p>
        </div>
      </div>
      <PlanosManager initialPlanos={planos} professionalId={session.user.id} />
    </div>
  )
}
