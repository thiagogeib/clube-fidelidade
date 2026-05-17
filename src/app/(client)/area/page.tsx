import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"
import { Calendar, CreditCard, BookOpen, ArrowRight, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export const metadata: Metadata = {
  title: "Início",
  description: "Sua área exclusiva",
}

export default async function AreaClientePage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "CLIENT") redirect("/login")

  const firstName = session.user.name?.split(" ")[0] ?? "Olá"

  const subscription = await db.subscription.findFirst({
    where: { clientId: session.user.id, status: "ACTIVE" },
    include: { plan: true },
  })

  const nextAppointment = await db.appointment.findFirst({
    where: {
      clientId: session.user.id,
      scheduledAt: { gte: new Date() },
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    orderBy: { scheduledAt: "asc" },
  })

  const quotaUsed = subscription?.appointmentsUsed ?? 0
  const quotaTotal = subscription?.plan.appointmentsPerMonth ?? 0
  const quotaPct = quotaTotal > 0 ? Math.min(100, Math.round((quotaUsed / quotaTotal) * 100)) : 0

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Saudação */}
      <div>
        <h1 className="font-heading text-2xl font-bold" style={{ color: "var(--brand-text)" }}>
          Olá, {firstName}!
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
        </p>
      </div>

      {/* Card de assinatura */}
      {subscription ? (
        <Card
          className="border-0 text-white overflow-hidden"
          style={{
            borderRadius: "20px",
            background: `linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-cta) 100%)`,
            boxShadow: "0 8px 24px rgba(139,92,246,0.25)",
          }}
        >
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Plano ativo</p>
                <p className="font-heading text-xl font-bold mt-0.5">{subscription.plan.name}</p>
              </div>
              <Badge className="bg-white/20 text-white border-0 text-xs font-medium">
                Ativa
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Agendamentos usados</span>
                <span className="font-semibold">{quotaUsed}/{quotaTotal}</span>
              </div>
              <div className="bg-white/20 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-white transition-all"
                  style={{ width: `${quotaPct}%` }}
                />
              </div>
            </div>

            {subscription.nextBillingDate && (
              <p className="text-xs text-white/60">
                Próxima cobrança: {format(new Date(subscription.nextBillingDate), "dd 'de' MMM", { locale: ptBR })}
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card
          className="border-0"
          style={{
            borderRadius: "20px",
            border: "2px dashed var(--brand-border)",
            boxShadow: "0 4px 12px rgba(236,72,153,0.08)",
          }}
        >
          <CardContent className="p-6 text-center space-y-3">
            <CreditCard className="w-10 h-10 mx-auto text-brand-primary opacity-60" />
            <div>
              <p className="font-heading font-semibold" style={{ color: "var(--brand-text)" }}>
                Sem assinatura ativa
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Assine um plano para começar a agendar
              </p>
            </div>
            <Link href="/area/meu-plano">
              <Button
                className="rounded-xl font-semibold text-white cursor-pointer"
                style={{ background: "var(--brand-cta)" }}
              >
                Ver planos disponíveis
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Próximo agendamento */}
      {nextAppointment && (
        <Card
          className="border-0"
          style={{
            borderRadius: "16px",
            border: "1px solid var(--brand-border)",
            boxShadow: "0 4px 12px rgba(236,72,153,0.08)",
            background: "white",
          }}
        >
          <CardContent className="p-5 flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: "var(--brand-background)" }}
            >
              <Calendar className="w-6 h-6 text-brand-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Próximo agendamento</p>
              <p className="font-heading font-semibold mt-0.5" style={{ color: "var(--brand-text)" }}>
                {format(new Date(nextAppointment.scheduledAt), "EEEE, dd MMM", { locale: ptBR })}
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                <Clock className="w-3.5 h-3.5" />
                {format(new Date(nextAppointment.scheduledAt), "HH:mm")}
                {nextAppointment.serviceType && ` · ${nextAppointment.serviceType}`}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Atalhos */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { href: "/area/agendar",   label: "Agendar",   icon: Calendar,   color: "var(--brand-primary)" },
          { href: "/area/meu-plano", label: "Meu Plano", icon: CreditCard,  color: "var(--brand-cta)"    },
          { href: "/area/dicas",     label: "Dicas",     icon: BookOpen,    color: "#10B981"              },
        ].map((item) => (
          <Link key={item.href} href={item.href}>
            <Card
              className="border-0 cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
              style={{
                borderRadius: "16px",
                border: "1px solid var(--brand-border)",
                boxShadow: "0 4px 12px rgba(236,72,153,0.06)",
                background: "white",
              }}
            >
              <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "var(--brand-background)" }}
                >
                  <item.icon className="w-5 h-5" style={{ color: item.color }} />
                </div>
                <span className="text-xs font-semibold" style={{ color: "var(--brand-text)" }}>
                  {item.label}
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
