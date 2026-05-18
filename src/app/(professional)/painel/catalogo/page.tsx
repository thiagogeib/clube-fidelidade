import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { CatalogManager } from "@/components/professional/CatalogManager"

export const metadata: Metadata = { title: "Catálogo" }

export default async function CatalogoPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "PROFESSIONAL") redirect("/login")

  const products = await db.product.findMany({
    where: { professionalId: session.user.id },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  })

  return (
    <div className="p-4 sm:p-8 pt-6 space-y-6">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-slate-800">Catálogo</h1>
        <p className="text-muted-foreground mt-1">Exiba seus serviços, produtos e portfólio para as clientes</p>
      </div>
      <CatalogManager initialProducts={products} />
    </div>
  )
}
