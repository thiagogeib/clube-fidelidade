import { Users, CalendarCheck, CalendarDays, CreditCard } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface DashboardMetricsProps {
  metrics: {
    totalActiveClients: number
    appointmentsToday: number
    appointmentsThisMonth: number
    activeSubscriptions: number
  }
}

const cards = [
  {
    key: "activeSubscriptions" as const,
    label: "Assinaturas ativas",
    icon: CreditCard,
    color: "#8B5CF6",
    bg: "#F3EEFF",
  },
  {
    key: "appointmentsToday" as const,
    label: "Agendamentos hoje",
    icon: CalendarCheck,
    color: "#EC4899",
    bg: "#FDF2F8",
  },
  {
    key: "appointmentsThisMonth" as const,
    label: "Agendamentos no mês",
    icon: CalendarDays,
    color: "#3B82F6",
    bg: "#EFF6FF",
  },
  {
    key: "totalActiveClients" as const,
    label: "Clientes ativos",
    icon: Users,
    color: "#10B981",
    bg: "#ECFDF5",
  },
]

export function DashboardMetrics({ metrics }: DashboardMetricsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card
          key={card.key}
          className="border-0"
          style={{
            borderRadius: "16px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            border: "1px solid #F1F5F9",
          }}
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">{card.label}</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">
                  {metrics[card.key]}
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: card.bg }}
              >
                <card.icon className="w-5 h-5" style={{ color: card.color }} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
