"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type AvailabilitySlot = {
  dayOfWeek: number
  startTime: string
  endTime: string
  slotMinutes: number
  isActive: boolean
}

const DAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]
const SLOT_OPTIONS = [
  { label: "30min", value: 30 },
  { label: "45min", value: 45 },
  { label: "1h",    value: 60 },
  { label: "1h30",  value: 90 },
  { label: "2h",    value: 120 },
  { label: "3h",    value: 180 },
  { label: "Dia livre", value: 480 },
]

function defaultSlot(dayOfWeek: number): AvailabilitySlot {
  return { dayOfWeek, startTime: "09:00", endTime: "18:00", slotMinutes: 60, isActive: false }
}

export function AvailabilityManager({
  initialAvailability,
}: {
  initialAvailability: AvailabilitySlot[]
}) {
  const [slots, setSlots] = useState<AvailabilitySlot[]>(() =>
    DAYS.map((_, i) => initialAvailability.find((a) => a.dayOfWeek === i) ?? defaultSlot(i))
  )
  const [isSaving, setIsSaving] = useState(false)

  function update(dayOfWeek: number, patch: Partial<AvailabilitySlot>) {
    setSlots((prev) => prev.map((s) => (s.dayOfWeek === dayOfWeek ? { ...s, ...patch } : s)))
  }

  async function save() {
    setIsSaving(true)
    try {
      const res = await fetch("/api/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots }),
      })
      if (!res.ok) throw new Error()
      toast.success("Horários salvos!")
    } catch {
      toast.error("Erro ao salvar horários")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      {slots.map((slot) => (
        <Card
          key={slot.dayOfWeek}
          className="border-0 overflow-hidden"
          style={{
            borderRadius: "16px",
            border: slot.isActive ? "1px solid var(--brand-border)" : "1px solid #F1F5F9",
            background: slot.isActive ? "white" : "#FAFAFA",
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Toggle dia */}
              <div className="flex items-center gap-2 w-28 shrink-0">
                <button
                  type="button"
                  onClick={() => update(slot.dayOfWeek, { isActive: !slot.isActive })}
                  className="relative w-10 h-6 rounded-full transition-colors duration-200 cursor-pointer shrink-0"
                  style={{ background: slot.isActive ? "var(--brand-primary)" : "#D1D5DB" }}
                  aria-label={`${slot.isActive ? "Desativar" : "Ativar"} ${DAYS[slot.dayOfWeek]}`}
                >
                  <span
                    className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
                    style={{ transform: slot.isActive ? "translateX(16px)" : "translateX(0)" }}
                  />
                </button>
                <span
                  className="text-sm font-medium"
                  style={{ color: slot.isActive ? "var(--brand-text)" : "#94A3B8" }}
                >
                  {DAYS[slot.dayOfWeek]}
                </span>
              </div>

              {/* Horários */}
              {slot.isActive && (
                <>
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => update(slot.dayOfWeek, { startTime: e.target.value })}
                      className="h-9 rounded-lg border px-2 text-sm cursor-pointer"
                      style={{ borderColor: "var(--brand-border)" }}
                    />
                    <span className="text-muted-foreground text-sm">até</span>
                    <input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => update(slot.dayOfWeek, { endTime: e.target.value })}
                      className="h-9 rounded-lg border px-2 text-sm cursor-pointer"
                      style={{ borderColor: "var(--brand-border)" }}
                    />
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs text-muted-foreground shrink-0">Intervalo:</span>
                    {SLOT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => update(slot.dayOfWeek, { slotMinutes: opt.value })}
                        className="px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border"
                        style={
                          slot.slotMinutes === opt.value
                            ? { background: "var(--brand-primary)", color: "white", borderColor: "var(--brand-primary)" }
                            : { background: "transparent", color: "var(--brand-text)", borderColor: "var(--brand-border)" }
                        }
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {!slot.isActive && (
                <span className="text-sm text-muted-foreground">Fechado</span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end pt-2">
        <Button
          onClick={save}
          disabled={isSaving}
          className="font-semibold text-white cursor-pointer px-8"
          style={{ background: "var(--brand-cta)", boxShadow: "0 4px 12px rgba(139,92,246,0.25)" }}
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Salvando..." : "Salvar horários"}
        </Button>
      </div>
    </div>
  )
}
