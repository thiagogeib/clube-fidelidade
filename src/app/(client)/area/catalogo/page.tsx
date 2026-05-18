import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { ShoppingBag, Tag } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = { title: "Catálogo" }

function formatPrice(cents: number | null) {
  if (!cents) return null
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100)
}

export default async function CatalogoClientPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "CLIENT") redirect("/login")

  const subscription = await db.subscription.findFirst({
    where: { clientId: session.user.id, status: "ACTIVE" },
    include: { plan: { select: { professionalId: true } } },
  })

  const products = subscription
    ? await db.product.findMany({
        where: { professionalId: subscription.plan.professionalId, isActive: true },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      })
    : []

  const byCategory = products.reduce<Record<string, typeof products>>((acc, p) => {
    const cat = p.category ?? "Outros"
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(p)
    return acc
  }, {})

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-24">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: "var(--brand-background)" }}
        >
          <ShoppingBag className="w-5 h-5" style={{ color: "var(--brand-primary)" }} />
        </div>
        <div>
          <h1 className="font-heading text-xl font-bold" style={{ color: "var(--brand-text)" }}>
            Catálogo
          </h1>
          <p className="text-muted-foreground text-xs mt-0.5">
            Serviços, produtos e portfólio disponíveis
          </p>
        </div>
      </div>

      {!subscription ? (
        <Card className="border-0" style={{ borderRadius: "20px", border: "2px dashed var(--brand-border)", background: "white" }}>
          <CardContent className="p-10 text-center space-y-3">
            <ShoppingBag className="w-12 h-12 mx-auto opacity-40" style={{ color: "var(--brand-primary)" }} />
            <p className="font-heading font-semibold text-lg" style={{ color: "var(--brand-text)" }}>
              Catálogo exclusivo para assinantes
            </p>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Assine um plano para ver os serviços e produtos disponíveis.
            </p>
          </CardContent>
        </Card>
      ) : products.length === 0 ? (
        <Card className="border-0" style={{ borderRadius: "16px", border: "1px solid var(--brand-border)", background: "white" }}>
          <CardContent className="p-10 text-center space-y-3">
            <ShoppingBag className="w-12 h-12 mx-auto opacity-40" style={{ color: "var(--brand-primary)" }} />
            <p className="font-semibold text-slate-600">Catálogo vazio</p>
            <p className="text-sm text-muted-foreground">Nenhum item disponível no momento.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(byCategory).map(([category, items]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-3.5 h-3.5" style={{ color: "var(--brand-primary)" }} />
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--brand-primary)" }}>
                  {category}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {items.map((product) => (
                  <Card
                    key={product.id}
                    className="border-0 overflow-hidden"
                    style={{
                      borderRadius: "16px",
                      border: "1px solid var(--brand-border)",
                      background: "white",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    }}
                  >
                    {product.imageUrl && (
                      <div className="w-full overflow-hidden" style={{ maxHeight: "180px" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full object-cover"
                          style={{ maxHeight: "180px" }}
                        />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 text-sm">{product.name}</p>
                          {product.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{product.description}</p>
                          )}
                          {product.priceInCents && (
                            <p className="text-sm font-bold mt-2" style={{ color: "var(--brand-primary)" }}>
                              {formatPrice(product.priceInCents)}
                            </p>
                          )}
                        </div>
                        {product.category && (
                          <Badge
                            className="text-[10px] rounded-full border-0 shrink-0 mt-0.5"
                            style={{ background: "var(--brand-background)", color: "var(--brand-primary)" }}
                          >
                            {product.category}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
