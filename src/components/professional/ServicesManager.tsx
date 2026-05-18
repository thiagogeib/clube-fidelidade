"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Plus, Scissors, Trash2, Clock, Timer, Pencil } from "lucide-react"
import { z } from "zod"

const serviceSchema = z.object({
  name:            z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  description:     z.string().optional(),
  durationMinutes: z.number().int().min(15, "Mínimo 15 min").max(720),
  priceInCents:    z.number().int().min(0).optional(),
  flexibleTime:    z.boolean(),
})
type ServiceInput = z.infer<typeof serviceSchema>

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

type Service = {
  id: string
  name: string
  description: string | null
  durationMinutes: number
  priceInCents: number | null
  flexibleTime: boolean
  isActive: boolean
}

const DURATION_OPTIONS = [30, 45, 60, 90, 120, 180, 240, 300, 360, 480]

function formatDuration(min: number) {
  if (min < 60) return `${min}min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m === 0 ? `${h}h` : `${h}h${m}min`
}

function formatPrice(cents: number | null) {
  if (!cents) return null
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100)
}

function ServiceForm({
  onSave,
  onCancel,
  defaultValues,
}: {
  onSave: (data: ServiceInput) => Promise<void>
  onCancel: () => void
  defaultValues?: Partial<ServiceInput>
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ServiceInput>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      description: "",
      durationMinutes: 60,
      priceInCents: undefined,
      flexibleTime: false,
      ...defaultValues,
    },
  })

  const flexibleTime = form.watch("flexibleTime")

  async function onSubmit(data: ServiceInput) {
    setIsSubmitting(true)
    try {
      await onSave(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do serviço</FormLabel>
              <FormControl>
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Ex: Trança box, Corte, Hidratação"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição <span className="text-muted-foreground font-normal">(opcional)</span></FormLabel>
              <FormControl>
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Ex: Tranças box com acabamento em fio"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="flexibleTime"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--brand-background)" }}>
                <input
                  type="checkbox"
                  id="flexibleTime"
                  checked={field.value}
                  onChange={field.onChange}
                  className="w-4 h-4 rounded cursor-pointer"
                  style={{ accentColor: "var(--brand-cta)" }}
                />
                <div>
                  <FormLabel htmlFor="flexibleTime" className="cursor-pointer font-medium m-0 text-sm">
                    Serviço sem horário fixo
                  </FormLabel>
                  <p className="text-xs text-muted-foreground mt-0.5">Cliente escolhe só o dia (ideal para tranças longas)</p>
                </div>
              </div>
            </FormItem>
          )}
        />

        {!flexibleTime && (
          <FormField
            control={form.control}
            name="durationMinutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Duração média
                </FormLabel>
                <FormControl>
                  <div className="flex flex-wrap gap-2">
                    {DURATION_OPTIONS.map((min) => (
                      <button
                        key={min}
                        type="button"
                        onClick={() => field.onChange(min)}
                        className="px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border"
                        style={
                          field.value === min
                            ? { background: "var(--brand-primary)", color: "white", borderColor: "var(--brand-primary)" }
                            : { background: "transparent", color: "var(--brand-text)", borderColor: "var(--brand-border)" }
                        }
                      >
                        {formatDuration(min)}
                      </button>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="priceInCents"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preço <span className="text-muted-foreground font-normal">(opcional)</span></FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0,00"
                    className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={field.value != null ? field.value / 100 : ""}
                    onChange={(e) => {
                      const val = e.target.value
                      field.onChange(val === "" ? undefined : Math.round(parseFloat(val) * 100))
                    }}
                  />
                </div>
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="flex-1 cursor-pointer" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 font-semibold text-white cursor-pointer"
            style={{ background: "var(--brand-cta)" }}
          >
            {isSubmitting ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export function ServicesManager({ initialServices }: { initialServices: Service[] }) {
  const [services, setServices] = useState(initialServices)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  async function handleCreate(data: ServiceInput) {
    const res = await fetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) { toast.error("Erro ao criar serviço"); return }
    const { data: created } = await res.json()
    setServices((prev) => [...prev, created])
    toast.success("Serviço criado!")
    setDialogOpen(false)
  }

  async function handleDelete(id: string) {
    if (!confirm("Desativar este serviço?")) return
    const res = await fetch(`/api/services/${id}`, { method: "DELETE" })
    if (!res.ok) { toast.error("Erro ao remover serviço"); return }
    setServices((prev) => prev.filter((s) => s.id !== id))
    toast.success("Serviço removido")
  }

  async function handleEdit(id: string, data: ServiceInput) {
    const res = await fetch(`/api/services/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) { toast.error("Erro ao atualizar serviço"); return }
    const { data: updated } = await res.json()
    setServices((prev) => prev.map((s) => (s.id === id ? updated : s)))
    toast.success("Serviço atualizado!")
    setEditingId(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            className="inline-flex items-center gap-2 rounded-xl h-10 px-5 font-semibold text-white cursor-pointer transition-all duration-200 hover:-translate-y-0.5 text-sm"
            style={{ background: "var(--brand-cta)", boxShadow: "0 4px 12px rgba(139,92,246,0.25)" }}
          >
            <Plus className="w-4 h-4" />
            Novo serviço
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" style={{ borderRadius: "20px" }}>
            <DialogHeader>
              <DialogTitle className="font-heading text-xl">Novo serviço</DialogTitle>
            </DialogHeader>
            <ServiceForm onSave={handleCreate} onCancel={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {services.length === 0 ? (
        <Card className="border-0" style={{ borderRadius: "16px", border: "1px solid #F1F5F9" }}>
          <CardContent className="p-12 text-center">
            <Scissors className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="font-semibold text-slate-600">Nenhum serviço cadastrado</p>
            <p className="text-sm text-muted-foreground mt-1">Adicione os serviços que você oferece</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {services.map((service) => (
            <div key={service.id}>
              {editingId === service.id ? (
                <Card className="border-0" style={{ borderRadius: "16px", border: "1px solid var(--brand-border)" }}>
                  <CardContent className="p-5">
                    <p className="font-semibold text-sm mb-3" style={{ color: "var(--brand-text)" }}>Editando: {service.name}</p>
                    <ServiceForm
                      defaultValues={{
                        name: service.name,
                        description: service.description ?? "",
                        durationMinutes: service.durationMinutes,
                        priceInCents: service.priceInCents ?? undefined,
                        flexibleTime: service.flexibleTime,
                      }}
                      onSave={(data) => handleEdit(service.id, data)}
                      onCancel={() => setEditingId(null)}
                    />
                  </CardContent>
                </Card>
              ) : (
                <Card
                  className="border-0"
                  style={{ borderRadius: "16px", border: "1px solid #F1F5F9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-slate-800 text-sm">{service.name}</p>
                          {service.flexibleTime && (
                            <Badge className="text-xs rounded-full border-0 bg-purple-100 text-purple-700">
                              Dia livre
                            </Badge>
                          )}
                        </div>
                        {service.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{service.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          {!service.flexibleTime && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Timer className="w-3 h-3" />
                              {formatDuration(service.durationMinutes)}
                            </span>
                          )}
                          {service.priceInCents && (
                            <span className="text-xs font-semibold" style={{ color: "var(--brand-primary)" }}>
                              {formatPrice(service.priceInCents)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setEditingId(service.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          aria-label="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                          aria-label="Remover"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
