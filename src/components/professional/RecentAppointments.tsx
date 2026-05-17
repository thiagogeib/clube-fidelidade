import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type Appointment = {
  id: string
  scheduledAt: Date
  durationMinutes: number
  serviceType: string | null
  status: string
  client: {
    name: string | null
    email: string
    phone: string | null
    image: string | null
  }
}

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING:   { label: "Pendente",   color: "bg-amber-100 text-amber-700" },
  CONFIRMED: { label: "Confirmado", color: "bg-green-100 text-green-700" },
  COMPLETED: { label: "Concluído",  color: "bg-slate-100 text-slate-600" },
  CANCELLED: { label: "Cancelado",  color: "bg-red-100 text-red-600"    },
  NO_SHOW:   { label: "Não compareceu", color: "bg-orange-100 text-orange-700" },
}

interface RecentAppointmentsProps {
  appointments: Appointment[]
}

export function RecentAppointments({ appointments }: RecentAppointmentsProps) {
  if (appointments.length === 0) {
    return (
      <Card
        className="border-0"
        style={{ borderRadius: "16px", border: "1px solid #F1F5F9", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
      >
        <CardContent className="p-8 text-center">
          <Calendar className="w-10 h-10 mx-auto text-slate-300 mb-3" />
          <p className="text-muted-foreground text-sm">Nenhum agendamento próximo</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {appointments.map((appt) => {
        const status = statusConfig[appt.status] ?? { label: appt.status, color: "bg-slate-100 text-slate-600" }
        const initials = appt.client.name
          ? appt.client.name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()
          : appt.client.email[0].toUpperCase()

        return (
          <Card
            key={appt.id}
            className="border-0"
            style={{ borderRadius: "12px", border: "1px solid #F1F5F9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <Avatar className="w-10 h-10 shrink-0">
                <AvatarImage src={appt.client.image ?? undefined} alt={appt.client.name ?? ""} />
                <AvatarFallback className="text-sm font-semibold text-brand-primary bg-brand-background">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm truncate">
                  {appt.client.name ?? appt.client.email}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(appt.scheduledAt), "dd MMM", { locale: ptBR })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(new Date(appt.scheduledAt), "HH:mm")}
                  </span>
                  {appt.serviceType && (
                    <span className="truncate">{appt.serviceType}</span>
                  )}
                </div>
              </div>

              <Badge
                className={`text-xs font-medium rounded-full border-0 shrink-0 ${status.color}`}
              >
                {status.label}
              </Badge>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
