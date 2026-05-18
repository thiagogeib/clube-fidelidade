"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameDay, isBefore, startOfDay, addMonths, subMonths } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"
import { Calendar, ChevronLeft, ChevronRight, Clock, AlertCircle, CheckCircle2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

type Subscription = {
  id: string
  appointmentsUsed: number
  plan: { appointmentsPerMonth: number; name: string }
}

type Service = {
  id: string
  name: string
  description: string | null
  durationMinutes: number
  priceInCents: number | null
  flexibleTime: boolean
}

type AvailabilitySlot = {
  dayOfWeek: number
  startTime: string
  endTime: string
  slotMinutes: number
}

type Appointment = {
  id: string
  scheduledAt: Date
  status: string
  serviceType: string | null
}

interface AgendarFormProps {
  subscription: Subscription | null
  upcomingAppointments: Appointment[]
  services: Service[]
  availability: AvailabilitySlot[]
}

function generateTimeSlots(start: string, end: string, slotMinutes: number): string[] {
  const slots: string[] = []
  const [sh, sm] = start.split(":").map(Number)
  const [eh, em] = end.split(":").map(Number)
  let current = sh * 60 + sm
  const endMins = eh * 60 + em
  while (current + slotMinutes <= endMins) {
    const h = Math.floor(current / 60).toString().padStart(2, "0")
    const m = (current % 60).toString().padStart(2, "0")
    slots.push(`${h}:${m}`)
    current += slotMinutes
  }
  return slots
}

function formatPrice(cents: number | null) {
  if (!cents) return null
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100)
}

function formatDuration(min: number) {
  if (min < 60) return `${min}min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m === 0 ? `${h}h` : `${h}h${m}min`
}

// ─── Mini Calendar ───────────────────────────────────────────
function MiniCalendar({
  availableDays,
  bookedDates,
  selectedDate,
  onSelect,
}: {
  availableDays: number[]
  bookedDates: Date[]
  selectedDate: Date | null
  onSelect: (d: Date) => void
}) {
  const [viewMonth, setViewMonth] = useState(() => new Date())
  const today = startOfDay(new Date())

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(viewMonth), { weekStartsOn: 0 })
    const end = endOfWeek(endOfMonth(viewMonth), { weekStartsOn: 0 })
    return eachDayOfInterval({ start, end })
  }, [viewMonth])

  function isAvailable(d: Date) {
    if (isBefore(d, today)) return false
    return availableDays.includes(d.getDay())
  }

  return (
    <div className="select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setViewMonth((m) => subMonths(m, 1))}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 text-slate-500" />
        </button>
        <span className="font-heading font-semibold text-sm capitalize" style={{ color: "var(--brand-text)" }}>
          {format(viewMonth, "MMMM yyyy", { locale: ptBR })}
        </span>
        <button
          type="button"
          onClick={() => setViewMonth((m) => addMonths(m, 1))}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
          <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-y-1">
        {days.map((day) => {
          const available = isAvailable(day)
          const isCurrentMonth = day.getMonth() === viewMonth.getMonth()
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
          const isToday = isSameDay(day, today)

          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={!available || !isCurrentMonth}
              onClick={() => onSelect(day)}
              className="relative flex items-center justify-center h-9 w-full rounded-lg text-sm transition-all duration-150"
              style={
                isSelected
                  ? { background: "var(--brand-primary)", color: "white", fontWeight: 600 }
                  : available && isCurrentMonth
                  ? { color: "var(--brand-text)", cursor: "pointer" }
                  : { color: "#CBD5E1", cursor: "default" }
              }
              onMouseEnter={(e) => {
                if (available && isCurrentMonth && !isSelected) {
                  e.currentTarget.style.background = "var(--brand-background)"
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.background = "transparent"
              }}
            >
              {isToday && !isSelected && (
                <span
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{ background: "var(--brand-primary)" }}
                />
              )}
              {day.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Form ───────────────────────────────────────────────
export function AgendarForm({ subscription, upcomingAppointments, services, availability }: AgendarFormProps) {
  const router = useRouter()
  const [step, setStep] = useState<"service" | "date" | "time" | "confirm">(
    services.length > 0 ? "service" : "date"
  )
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const quotaRemaining = subscription
    ? subscription.plan.appointmentsPerMonth - subscription.appointmentsUsed
    : 0
  const hasQuota = quotaRemaining > 0

  const availableDays = availability.map((a) => a.dayOfWeek)

  const timeSlots = useMemo(() => {
    if (!selectedDate) return []
    const avail = availability.find((a) => a.dayOfWeek === selectedDate.getDay())
    if (!avail) return []
    const slotMin = selectedService?.flexibleTime ? avail.slotMinutes : (selectedService?.durationMinutes ?? avail.slotMinutes)
    return generateTimeSlots(avail.startTime, avail.endTime, slotMin)
  }, [selectedDate, availability, selectedService])

  function handleDateSelect(date: Date) {
    setSelectedDate(date)
    setSelectedTime(null)
    const service = selectedService
    if (service?.flexibleTime) {
      setStep("confirm")
    } else {
      setStep("time")
    }
  }

  async function handleSubmit() {
    if (!subscription || !selectedDate) return
    setIsLoading(true)

    try {
      let scheduledAt: Date
      if (selectedService?.flexibleTime) {
        scheduledAt = new Date(selectedDate)
        scheduledAt.setHours(0, 0, 0, 0)
      } else {
        if (!selectedTime) return
        const [h, m] = selectedTime.split(":").map(Number)
        scheduledAt = new Date(selectedDate)
        scheduledAt.setHours(h, m, 0, 0)
      }

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduledAt: scheduledAt.toISOString(),
          durationMinutes: selectedService?.durationMinutes ?? 60,
          serviceType: selectedService?.name ?? null,
          serviceId: selectedService?.id ?? null,
          notes: notes || null,
        }),
      })

      if (!res.ok) {
        const json = await res.json()
        toast.error(json.message || "Erro ao agendar.")
        return
      }

      toast.success("Agendamento realizado! Aguarde a confirmação.")
      router.refresh()
      setStep(services.length > 0 ? "service" : "date")
      setSelectedService(null)
      setSelectedDate(null)
      setSelectedTime(null)
      setNotes("")
    } catch {
      toast.error("Erro ao agendar. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!subscription) {
    return (
      <Card className="border-0" style={{ borderRadius: "20px", border: "2px dashed var(--brand-border)", background: "white" }}>
        <CardContent className="p-8 text-center space-y-3">
          <Calendar className="w-12 h-12 mx-auto opacity-40" style={{ color: "var(--brand-primary)" }} />
          <p className="font-heading font-semibold text-lg" style={{ color: "var(--brand-text)" }}>
            Você não tem uma assinatura ativa
          </p>
          <p className="text-sm text-muted-foreground">Assine um plano para poder agendar seus horários</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-5">
      {/* Cota */}
      <Card className="border-0" style={{ borderRadius: "16px", border: "1px solid var(--brand-border)", background: "white" }}>
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Cota disponível — {subscription.plan.name}</p>
            <p className="font-heading text-2xl font-bold mt-0.5" style={{ color: hasQuota ? "var(--brand-text)" : "#EF4444" }}>
              {quotaRemaining} agendamento{quotaRemaining !== 1 ? "s" : ""}
            </p>
          </div>
          <Badge className="text-sm px-4 py-1.5 rounded-full border-0 font-semibold"
            style={{ background: hasQuota ? "var(--brand-background)" : "#FEF2F2", color: hasQuota ? "var(--brand-text)" : "#DC2626" }}>
            {subscription.appointmentsUsed}/{subscription.plan.appointmentsPerMonth}
          </Badge>
        </CardContent>
      </Card>

      {!hasQuota && (
        <Alert style={{ borderRadius: "12px", borderColor: "#FECACA", background: "#FEF2F2" }}>
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700 text-sm">
            Você já usou todos os agendamentos deste mês.
          </AlertDescription>
        </Alert>
      )}

      {hasQuota && (
        <Card className="border-0" style={{ borderRadius: "20px", border: "1px solid var(--brand-border)", background: "white" }}>
          <CardContent className="p-6 space-y-6">

            {/* Step progress */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {services.length > 0 && (
                <>
                  <span className={step === "service" ? "font-semibold" : ""} style={{ color: step === "service" ? "var(--brand-primary)" : undefined }}>
                    1. Serviço
                  </span>
                  <span>→</span>
                </>
              )}
              <span className={step === "date" ? "font-semibold" : ""} style={{ color: step === "date" ? "var(--brand-primary)" : undefined }}>
                {services.length > 0 ? "2." : "1."} Data
              </span>
              {(!selectedService?.flexibleTime) && (
                <>
                  <span>→</span>
                  <span className={step === "time" ? "font-semibold" : ""} style={{ color: step === "time" ? "var(--brand-primary)" : undefined }}>
                    {services.length > 0 ? "3." : "2."} Horário
                  </span>
                </>
              )}
              <span>→</span>
              <span className={step === "confirm" ? "font-semibold" : ""} style={{ color: step === "confirm" ? "var(--brand-primary)" : undefined }}>
                Confirmar
              </span>
            </div>

            {/* Step 1: Serviço */}
            {step === "service" && services.length > 0 && (
              <div className="space-y-3">
                <p className="font-heading font-semibold" style={{ color: "var(--brand-text)" }}>
                  Qual serviço você quer agendar?
                </p>
                <div className="space-y-2">
                  {services.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => { setSelectedService(s); setStep("date") }}
                      className="w-full text-left p-4 rounded-xl border transition-all duration-150 cursor-pointer hover:-translate-y-0.5"
                      style={{ borderColor: "var(--brand-border)", background: "white" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--brand-primary)"; e.currentTarget.style.background = "var(--brand-background)" }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--brand-border)"; e.currentTarget.style.background = "white" }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-sm" style={{ color: "var(--brand-text)" }}>{s.name}</p>
                          {s.description && <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>}
                          <div className="flex items-center gap-3 mt-1.5">
                            {s.flexibleTime ? (
                              <span className="text-xs text-purple-600 font-medium">Agendamento por dia</span>
                            ) : (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" /> {formatDuration(s.durationMinutes)}
                              </span>
                            )}
                            {s.priceInCents && (
                              <span className="text-xs font-semibold" style={{ color: "var(--brand-primary)" }}>
                                {formatPrice(s.priceInCents)}
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Data */}
            {step === "date" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-heading font-semibold" style={{ color: "var(--brand-text)" }}>
                    Escolha a data
                  </p>
                  {selectedService && (
                    <button type="button" onClick={() => setStep("service")} className="text-xs text-muted-foreground hover:underline cursor-pointer">
                      ← Serviço: {selectedService.name}
                    </button>
                  )}
                </div>
                {availableDays.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    A profissional ainda não configurou os horários disponíveis.
                  </p>
                ) : (
                  <MiniCalendar
                    availableDays={availableDays}
                    bookedDates={upcomingAppointments.map((a) => new Date(a.scheduledAt))}
                    selectedDate={selectedDate}
                    onSelect={handleDateSelect}
                  />
                )}
              </div>
            )}

            {/* Step 3: Horário */}
            {step === "time" && selectedDate && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-heading font-semibold" style={{ color: "var(--brand-text)" }}>
                    Escolha o horário
                  </p>
                  <button type="button" onClick={() => setStep("date")} className="text-xs text-muted-foreground hover:underline cursor-pointer">
                    ← {format(selectedDate, "dd 'de' MMM", { locale: ptBR })}
                  </button>
                </div>
                {timeSlots.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum horário disponível neste dia.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => { setSelectedTime(time); setStep("confirm") }}
                        className="py-2.5 rounded-xl text-sm font-medium border transition-all cursor-pointer"
                        style={
                          selectedTime === time
                            ? { background: "var(--brand-primary)", color: "white", borderColor: "var(--brand-primary)" }
                            : { background: "transparent", color: "var(--brand-text)", borderColor: "var(--brand-border)" }
                        }
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Confirmar */}
            {step === "confirm" && selectedDate && (
              <div className="space-y-4">
                <p className="font-heading font-semibold" style={{ color: "var(--brand-text)" }}>
                  Confirmar agendamento
                </p>

                {/* Resumo */}
                <div className="rounded-xl p-4 space-y-2" style={{ background: "var(--brand-background)", border: "1px solid var(--brand-border)" }}>
                  {selectedService && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Serviço</span>
                      <span className="font-medium" style={{ color: "var(--brand-text)" }}>{selectedService.name}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Data</span>
                    <span className="font-medium" style={{ color: "var(--brand-text)" }}>
                      {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                    </span>
                  </div>
                  {selectedTime && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Horário</span>
                      <span className="font-medium" style={{ color: "var(--brand-text)" }}>{selectedTime}</span>
                    </div>
                  )}
                  {selectedService?.flexibleTime && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Horário</span>
                      <span className="font-medium text-purple-600">A combinar no dia</span>
                    </div>
                  )}
                  {selectedService?.durationMinutes && !selectedService.flexibleTime && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Duração</span>
                      <span className="font-medium" style={{ color: "var(--brand-text)" }}>
                        ~{formatDuration(selectedService.durationMinutes)}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block" style={{ color: "var(--brand-text)" }}>
                    Observações <span className="text-muted-foreground font-normal">(opcional)</span>
                  </label>
                  <Textarea
                    placeholder="Ex: Quero box braids compridas, referência no Instagram..."
                    rows={3}
                    className="resize-none rounded-[10px]"
                    style={{ borderColor: "var(--brand-border)" }}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 cursor-pointer"
                    onClick={() => setStep(selectedService?.flexibleTime ? "date" : "time")}
                  >
                    Voltar
                  </Button>
                  <Button
                    type="button"
                    disabled={isLoading}
                    onClick={handleSubmit}
                    className="flex-1 font-semibold text-white cursor-pointer"
                    style={{ background: "var(--brand-cta)", boxShadow: "0 4px 12px rgba(139,92,246,0.3)" }}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Agendando...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Confirmar
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Próximos agendamentos */}
      {upcomingAppointments.length > 0 && (
        <div>
          <h2 className="font-heading text-base font-semibold mb-3" style={{ color: "var(--brand-text)" }}>
            Seus próximos horários
          </h2>
          <div className="space-y-2">
            {upcomingAppointments.map((appt) => (
              <Card key={appt.id} className="border-0" style={{ borderRadius: "12px", border: "1px solid var(--brand-border)", background: "white" }}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--brand-background)" }}>
                    <Calendar className="w-5 h-5" style={{ color: "var(--brand-primary)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm" style={{ color: "var(--brand-text)" }}>
                      {format(new Date(appt.scheduledAt), "EEEE, dd 'de' MMM · HH:mm", { locale: ptBR })}
                    </p>
                    {appt.serviceType && <p className="text-xs text-muted-foreground">{appt.serviceType}</p>}
                  </div>
                  <Badge className={`text-xs rounded-full border-0 shrink-0 ${appt.status === "CONFIRMED" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                    {appt.status === "CONFIRMED" ? "Confirmado" : "Pendente"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
