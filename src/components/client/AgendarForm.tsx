"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"
import { Calendar, Clock, AlertCircle } from "lucide-react"
import { z } from "zod"

// Schema de formulário sem transform — conversão é feita no onSubmit
const appointmentFormSchema = z.object({
  scheduledAt:     z.string().min(1, "Selecione uma data e horário"),
  durationMinutes: z.number().int().min(15).max(480),
  serviceType:     z.string().optional(),
  notes:           z.string().optional(),
})
type AppointmentFormInput = z.infer<typeof appointmentFormSchema>
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

type Subscription = {
  id: string
  appointmentsUsed: number
  plan: {
    appointmentsPerMonth: number
    name: string
  }
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
}

const serviceTypes = [
  "Corte",
  "Escova",
  "Coloração",
  "Hidratação",
  "Tranças",
  "Progressiva",
  "Mechas",
  "Outro",
]

export function AgendarForm({ subscription, upcomingAppointments }: AgendarFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const quotaRemaining = subscription
    ? subscription.plan.appointmentsPerMonth - subscription.appointmentsUsed
    : 0
  const hasQuota = quotaRemaining > 0

  const form = useForm<AppointmentFormInput>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      scheduledAt: "",
      durationMinutes: 60,
      serviceType: "",
      notes: "",
    },
  })

  async function onSubmit(data: AppointmentFormInput) {
    setIsLoading(true)
    try {
      // Converter datetime-local para ISO 8601
      const scheduledAtISO = new Date(data.scheduledAt).toISOString()
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, scheduledAt: scheduledAtISO }),
      })

      if (!res.ok) {
        const json = await res.json()
        toast.error(json.message || "Erro ao agendar. Tente novamente.")
        return
      }

      toast.success("Horário agendado com sucesso! Aguarde a confirmação.")
      form.reset()
      router.refresh()
    } catch {
      toast.error("Erro ao agendar. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!subscription) {
    return (
      <Card
        className="border-0"
        style={{
          borderRadius: "20px",
          border: "2px dashed var(--brand-border)",
          background: "white",
        }}
      >
        <CardContent className="p-8 text-center space-y-3">
          <Calendar className="w-12 h-12 mx-auto opacity-40 text-brand-primary" />
          <p className="font-heading font-semibold text-lg" style={{ color: "var(--brand-text)" }}>
            Você não tem uma assinatura ativa
          </p>
          <p className="text-sm text-muted-foreground">
            Assine um plano para poder agendar seus horários
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cota restante */}
      <Card
        className="border-0"
        style={{
          borderRadius: "16px",
          border: "1px solid var(--brand-border)",
          background: "white",
        }}
      >
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Cota disponível — {subscription.plan.name}</p>
            <p
              className="font-heading text-2xl font-bold mt-0.5"
              style={{ color: hasQuota ? "var(--brand-text)" : "#EF4444" }}
            >
              {quotaRemaining} agendamento{quotaRemaining !== 1 ? "s" : ""}
            </p>
          </div>
          <Badge
            className="text-sm px-4 py-1.5 rounded-full border-0 font-semibold"
            style={{
              background: hasQuota ? "var(--brand-background)" : "#FEF2F2",
              color: hasQuota ? "var(--brand-text)" : "#DC2626",
            }}
          >
            {subscription.appointmentsUsed}/{subscription.plan.appointmentsPerMonth}
          </Badge>
        </CardContent>
      </Card>

      {!hasQuota && (
        <Alert style={{ borderRadius: "12px", borderColor: "#FECACA", background: "#FEF2F2" }}>
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700 text-sm">
            Você já usou todos os agendamentos deste mês. Sua cota renova na próxima cobrança.
          </AlertDescription>
        </Alert>
      )}

      {/* Formulário */}
      {hasQuota && (
        <Card
          className="border-0"
          style={{ borderRadius: "20px", border: "1px solid var(--brand-border)", background: "white" }}
        >
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="scheduledAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-brand-text font-medium">Data e horário</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          className="h-11 rounded-[10px]"
                          style={{ borderColor: "var(--brand-border)" }}
                          min={new Date().toISOString().slice(0, 16)}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="serviceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-brand-text font-medium">Tipo de serviço</FormLabel>
                      <FormControl>
                        <div className="flex flex-wrap gap-2">
                          {serviceTypes.map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => field.onChange(type)}
                              className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 cursor-pointer border"
                              style={
                                field.value === type
                                  ? {
                                      background: "var(--brand-primary)",
                                      color: "white",
                                      borderColor: "var(--brand-primary)",
                                    }
                                  : {
                                      background: "transparent",
                                      color: "var(--brand-text)",
                                      borderColor: "var(--brand-border)",
                                    }
                              }
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="durationMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-brand-text font-medium flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Duração estimada
                      </FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          {[30, 60, 90, 120].map((min) => (
                            <button
                              key={min}
                              type="button"
                              onClick={() => field.onChange(min)}
                              className="flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer border"
                              style={
                                field.value === min
                                  ? { background: "var(--brand-primary)", color: "white", borderColor: "var(--brand-primary)" }
                                  : { background: "transparent", color: "var(--brand-text)", borderColor: "var(--brand-border)" }
                              }
                            >
                              {min}min
                            </button>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-brand-text font-medium">
                        Observações <span className="text-muted-foreground font-normal">(opcional)</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ex: Cabelo fino, alergia a amônia..."
                          rows={3}
                          className="resize-none rounded-[10px]"
                          style={{ borderColor: "var(--brand-border)" }}
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-[12px] font-semibold text-base text-white cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    background: "var(--brand-cta)",
                    boxShadow: "0 4px 12px rgba(139,92,246,0.3)",
                  }}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Agendando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Confirmar agendamento
                    </span>
                  )}
                </Button>
              </form>
            </Form>
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
              <Card
                key={appt.id}
                className="border-0"
                style={{
                  borderRadius: "12px",
                  border: "1px solid var(--brand-border)",
                  background: "white",
                }}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "var(--brand-background)" }}
                  >
                    <Calendar className="w-5 h-5 text-brand-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm" style={{ color: "var(--brand-text)" }}>
                      {format(new Date(appt.scheduledAt), "EEEE, dd 'de' MMM · HH:mm", { locale: ptBR })}
                    </p>
                    {appt.serviceType && (
                      <p className="text-xs text-muted-foreground">{appt.serviceType}</p>
                    )}
                  </div>
                  <Badge
                    className={`text-xs rounded-full border-0 shrink-0 ${
                      appt.status === "CONFIRMED" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                    }`}
                  >
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
