import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"
import { CreditCard, CheckCircle, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = { title: "Meu Plano" }

export default async function MeuPlanoPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "CLIENT") redirect("/login")

  const subscription = await db.subscription.findFirst({
    where: { clientId: session.user.id },
    include: { plan: { include: { professional: { select: { name: true } } } } },
    orderBy: { createdAt: "desc" },
  })

  const availablePlans = subscription
    ? await db.plan.findMany({
        where: { professionalId: subscription.plan.professionalId, isActive: true },
        orderBy: { priceInCents: "asc" },
      })
    : []

  const isActive = subscription?.status === "ACTIVE"
  const quotaUsed = subscription?.appointmentsUsed ?? 0
  const quotaTotal = subscription?.plan.appointmentsPerMonth ?? 0
  const quotaPct = quotaTotal > 0 ? Math.min(100, Math.round((quotaUsed / quotaTotal) * 100)) : 0

  function formatPrice(cents: number) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100)
  }

  const statusColors: Record<string, string> = {
    ACTIVE:    "bg-green-100 text-green-700",
    PENDING:   "bg-amber-100 text-amber-700",
    PAUSED:    "bg-blue-100 text-blue-700",
    CANCELLED: "bg-red-100 text-red-600",
    EXPIRED:   "bg-slate-100 text-slate-600",
  }

  const statusLabels: Record<string, string> = {
    ACTIVE:    "Ativa",
    PENDING:   "Aguardando pagamento",
    PAUSED:    "Pausada",
    CANCELLED: "Cancelada",
    EXPIRED:   "Expirada",
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold" style={{ color: "var(--brand-text)" }}>
          Meu Plano
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Gerencie sua assinatura</p>
      </div>

      {subscription ? (
        <>
          {/* Card principal */}
          <Card
            className="border-0 overflow-hidden"
            style={{
              borderRadius: "20px",
              background: isActive
                ? `linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-cta) 100%)`
                : "#F8FAFC",
              boxShadow: isActive
                ? "0 8px 24px rgba(139,92,246,0.25)"
                : "0 4px 12px rgba(0,0,0,0.06)",
              border: isActive ? "none" : "1px solid #E2E8F0",
            }}
          >
            <CardContent className={`p-6 space-y-5 ${isActive ? "text-white" : ""}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className={`text-xs font-medium uppercase tracking-wider ${isActive ? "text-white/70" : "text-muted-foreground"}`}>
                    Assinatura
                  </p>
                  <h2 className={`font-heading text-2xl font-bold mt-0.5 ${isActive ? "" : "text-slate-800"}`}>
                    {subscription.plan.name}
                  </h2>
                  <p className={`text-sm mt-0.5 ${isActive ? "text-white/70" : "text-muted-foreground"}`}>
                    com {subscription.plan.professional.name ?? "sua profissional"}
                  </p>
                </div>
                <Badge
                  className={`text-xs font-medium rounded-full border-0 ${
                    isActive
                      ? "bg-white/20 text-white"
                      : statusColors[subscription.status] ?? "bg-slate-100 text-slate-600"
                  }`}
                >
                  {statusLabels[subscription.status] ?? subscription.status}
                </Badge>
              </div>

              <div className={`text-3xl font-bold font-heading ${isActive ? "" : "text-slate-800"}`}>
                {formatPrice(subscription.plan.priceInCents)}
                <span className={`text-base font-normal ml-1 ${isActive ? "text-white/70" : "text-muted-foreground"}`}>/mês</span>
              </div>

              {isActive && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/80">Agendamentos usados este mês</span>
                    <span className="font-semibold">{quotaUsed}/{quotaTotal}</span>
                  </div>
                  <div className="bg-white/20 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-white transition-all"
                      style={{ width: `${quotaPct}%` }}
                    />
                  </div>
                </div>
              )}

              {subscription.nextBillingDate && isActive && (
                <p className="text-xs text-white/60">
                  Próxima cobrança: {format(new Date(subscription.nextBillingDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Benefícios do plano */}
          <Card
            className="border-0"
            style={{ borderRadius: "16px", border: "1px solid var(--brand-border)", background: "white" }}
          >
            <CardContent className="p-6 space-y-4">
              <h3 className="font-heading font-semibold" style={{ color: "var(--brand-text)" }}>
                Benefícios do seu plano
              </h3>
              <div className="space-y-3">
                {[
                  `${quotaTotal} agendamento${quotaTotal !== 1 ? "s" : ""} por mês`,
                  "Acesso ao feed de dicas exclusivas",
                  "Agendamento online 24h",
                  "Cancelamento a qualquer hora",
                ].map((benefit) => (
                  <div key={benefit} className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-brand-primary shrink-0" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card
          className="border-0"
          style={{
            borderRadius: "20px",
            border: "2px dashed var(--brand-border)",
            background: "white",
          }}
        >
          <CardContent className="p-8 text-center space-y-4">
            <CreditCard className="w-12 h-12 mx-auto opacity-40 text-brand-primary" />
            <div>
              <p className="font-heading font-semibold text-lg" style={{ color: "var(--brand-text)" }}>
                Você ainda não tem uma assinatura
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Escolha um plano abaixo para começar
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Planos disponíveis (quando não tem assinatura ativa) */}
      {(!subscription || !isActive) && availablePlans.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-heading text-lg font-semibold" style={{ color: "var(--brand-text)" }}>
            Planos disponíveis
          </h2>
          <div className="space-y-3">
            {availablePlans.map((plan, index) => (
              <Card
                key={plan.id}
                className="border-0 cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  borderRadius: "16px",
                  border: index === 1 ? "2px solid var(--brand-primary)" : "1px solid var(--brand-border)",
                  background: "white",
                  boxShadow: index === 1 ? "0 8px 24px rgba(236,72,153,0.15)" : "0 4px 12px rgba(0,0,0,0.04)",
                }}
              >
                <CardContent className="p-5 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-800">{plan.name}</p>
                      {index === 1 && (
                        <Badge
                          className="text-xs rounded-full border-0 font-medium"
                          style={{ background: "var(--brand-background)", color: "var(--brand-primary)" }}
                        >
                          Popular
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {plan.appointmentsPerMonth} agendamento{plan.appointmentsPerMonth !== 1 ? "s" : ""}/mês
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-heading text-xl font-bold text-brand-text">
                      {formatPrice(plan.priceInCents)}
                    </p>
                    <p className="text-xs text-muted-foreground">/mês</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-xs text-center text-muted-foreground">
            Para assinar um plano, entre em contato com sua profissional.
          </p>
        </div>
      )}
    </div>
  )
}
