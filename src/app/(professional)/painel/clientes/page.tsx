import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Users, Phone, Mail } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export const metadata: Metadata = { title: "Clientes" }

export default async function ClientesPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "PROFESSIONAL") redirect("/login")

  const subscriptions = await db.subscription.findMany({
    where: { plan: { professionalId: session.user.id } },
    include: {
      client: { select: { id: true, name: true, email: true, phone: true, image: true, createdAt: true } },
      plan: { select: { name: true, appointmentsPerMonth: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const statusColors: Record<string, string> = {
    ACTIVE:    "bg-green-100 text-green-700",
    PENDING:   "bg-amber-100 text-amber-700",
    PAUSED:    "bg-blue-100 text-blue-700",
    CANCELLED: "bg-red-100 text-red-600",
    EXPIRED:   "bg-slate-100 text-slate-600",
  }

  const statusLabels: Record<string, string> = {
    ACTIVE:    "Ativa",
    PENDING:   "Pendente",
    PAUSED:    "Pausada",
    CANCELLED: "Cancelada",
    EXPIRED:   "Expirada",
  }

  return (
    <div className="p-4 sm:p-8 pt-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-slate-800">Clientes</h1>
          <p className="text-muted-foreground mt-1">{subscriptions.length} assinatura{subscriptions.length !== 1 ? "s" : ""} encontrada{subscriptions.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {subscriptions.length === 0 ? (
        <Card
          className="border-0"
          style={{ borderRadius: "16px", border: "1px solid #F1F5F9", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        >
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="font-semibold text-slate-600">Nenhuma cliente ainda</p>
            <p className="text-sm text-muted-foreground mt-1">As clientes que assinarem seus planos aparecerão aqui</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {subscriptions.map((sub) => {
            const initials = sub.client.name
              ? sub.client.name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()
              : sub.client.email[0].toUpperCase()
            const quotaUsed = sub.appointmentsUsed
            const quotaTotal = sub.plan.appointmentsPerMonth
            const quotaPct = Math.min(100, Math.round((quotaUsed / quotaTotal) * 100))

            return (
              <Card
                key={sub.id}
                className="border-0"
                style={{ borderRadius: "12px", border: "1px solid #F1F5F9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-11 h-11 shrink-0">
                      <AvatarImage src={sub.client.image ?? undefined} />
                      <AvatarFallback className="text-sm font-semibold text-brand-primary" style={{ backgroundColor: "var(--brand-background)" }}>
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <p className="font-semibold text-slate-800">{sub.client.name ?? "—"}</p>
                          <p className="text-sm text-muted-foreground">{sub.plan.name}</p>
                        </div>
                        <Badge className={`text-xs font-medium rounded-full border-0 shrink-0 ${statusColors[sub.status] ?? "bg-slate-100 text-slate-600"}`}>
                          {statusLabels[sub.status] ?? sub.status}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        {sub.client.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {sub.client.email}
                          </span>
                        )}
                        {sub.client.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {sub.client.phone}
                          </span>
                        )}
                        <span>
                          Desde {format(new Date(sub.client.createdAt), "MMM yyyy", { locale: ptBR })}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full transition-all"
                            style={{
                              width: `${quotaPct}%`,
                              background: quotaPct >= 100 ? "#EF4444" : "var(--brand-primary)",
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {quotaUsed}/{quotaTotal} agend.
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
