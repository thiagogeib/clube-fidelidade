"use client"

import { useState } from "react"
import { format, isToday, isTomorrow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar, Clock, Phone, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

type Appointment = {
  id: string
  scheduledAt: Date
  durationMinutes: number
  serviceType: string | null
  status: string
  notes: string | null
  client: {
    id: string
    name: string | null
    email: string
    phone: string | null
    image: string | null
  }
}

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING:   { label: "Pendente",   color: "bg-amber-100 text-amber-700"  },
  CONFIRMED: { label: "Confirmado", color: "bg-green-100 text-green-700"  },
  COMPLETED: { label: "Concluído",  color: "bg-slate-100 text-slate-600"  },
  CANCELLED: { label: "Cancelado",  color: "bg-red-100 text-red-600"      },
  NO_SHOW:   { label: "Não compareceu", color: "bg-orange-100 text-orange-700" },
}

function groupByDate(appointments: Appointment[]) {
  const groups: Record<string, Appointment[]> = {}
  for (const a of appointments) {
    const key = format(new Date(a.scheduledAt), "yyyy-MM-dd")
    if (!groups[key]) groups[key] = []
    groups[key].push(a)
  }
  return groups
}

function getDayLabel(dateStr: string) {
  const date = new Date(dateStr + "T00:00:00")
  if (isToday(date)) return "Hoje"
  if (isTomorrow(date)) return "Amanhã"
  return format(date, "EEEE, dd 'de' MMMM", { locale: ptBR })
}

interface AgendaViewProps {
  appointments: Appointment[]
}

export function AgendaView({ appointments: initial }: AgendaViewProps) {
  const [appointments, setAppointments] = useState(initial)

  async function updateStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()

      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      )
      toast.success(`Status atualizado para ${statusConfig[status]?.label ?? status}`)
    } catch {
      toast.error("Erro ao atualizar status")
    }
  }

  if (appointments.length === 0) {
    return (
      <Card
        className="border-0"
        style={{ borderRadius: "16px", border: "1px solid #F1F5F9", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
      >
        <CardContent className="p-12 text-center">
          <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <p className="font-semibold text-slate-600">Nenhum agendamento nos próximos 30 dias</p>
          <p className="text-sm text-muted-foreground mt-1">Os agendamentos das suas clientes aparecerão aqui</p>
        </CardContent>
      </Card>
    )
  }

  const groups = groupByDate(appointments)

  return (
    <div className="space-y-8">
      {Object.entries(groups).map(([dateStr, dayAppointments]) => (
        <div key={dateStr}>
          <h2 className="font-heading text-base font-semibold text-slate-700 mb-3 capitalize">
            {getDayLabel(dateStr)}
          </h2>
          <div className="space-y-3">
            {dayAppointments.map((appt) => {
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
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-11 h-11 shrink-0">
                        <AvatarImage src={appt.client.image ?? undefined} />
                        <AvatarFallback className="text-sm font-semibold text-brand-primary" style={{ backgroundColor: "var(--brand-background)" }}>
                          {initials}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <p className="font-semibold text-slate-800">
                            {appt.client.name ?? appt.client.email}
                          </p>
                          <Badge className={`text-xs font-medium rounded-full border-0 ${status.color}`}>
                            {status.label}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {format(new Date(appt.scheduledAt), "HH:mm")} · {appt.durationMinutes}min
                          </span>
                          {appt.client.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5" />
                              {appt.client.phone}
                            </span>
                          )}
                          {appt.serviceType && (
                            <span className="capitalize">{appt.serviceType}</span>
                          )}
                        </div>

                        {appt.notes && (
                          <p className="text-xs text-muted-foreground bg-slate-50 px-3 py-2 rounded-lg mt-2">
                            {appt.notes}
                          </p>
                        )}

                        {(appt.status === "PENDING" || appt.status === "CONFIRMED") && (
                          <div className="flex gap-2 mt-3 flex-wrap">
                            {appt.status === "PENDING" && (
                              <Button
                                size="sm"
                                className="h-8 px-4 rounded-lg text-xs font-semibold bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                                onClick={() => updateStatus(appt.id, "CONFIRMED")}
                              >
                                <CheckCircle className="w-3.5 h-3.5 mr-1" />
                                Confirmar
                              </Button>
                            )}
                            {appt.status === "CONFIRMED" && (
                              <Button
                                size="sm"
                                className="h-8 px-4 rounded-lg text-xs font-semibold cursor-pointer"
                                style={{ background: "var(--brand-cta)", color: "white" }}
                                onClick={() => updateStatus(appt.id, "COMPLETED")}
                              >
                                Concluir
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-4 rounded-lg text-xs font-semibold border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
                              onClick={() => updateStatus(appt.id, "CANCELLED")}
                            >
                              <XCircle className="w-3.5 h-3.5 mr-1" />
                              Cancelar
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
