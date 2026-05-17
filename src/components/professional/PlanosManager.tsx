"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Plus, CreditCard, Users, Pencil, Trash2 } from "lucide-react"
import { z } from "zod"

// Schema de formulário sem .default() para evitar mismatch de tipos com react-hook-form
const planFormSchema = z.object({
  name:                 z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  description:          z.string().optional(),
  priceInCents:         z.number().int().positive("Preço deve ser positivo"),
  appointmentsPerMonth: z.number().int().min(1, "Mínimo 1 agendamento por mês"),
})
type PlanFormInput = z.infer<typeof planFormSchema>
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type Plan = {
  id: string
  name: string
  description: string | null
  priceInCents: number
  appointmentsPerMonth: number
  isActive: boolean
  _count: { subscriptions: number }
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100)
}

interface PlanosManagerProps {
  initialPlanos: Plan[]
  professionalId: string
}

export function PlanosManager({ initialPlanos }: PlanosManagerProps) {
  const [planos, setPlanos] = useState(initialPlanos)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<PlanFormInput>({
    resolver: zodResolver(planFormSchema),
    defaultValues: { name: "", description: "", priceInCents: 0, appointmentsPerMonth: 1 },
  })

  async function onSubmit(data: PlanFormInput) {
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const json = await res.json()
        toast.error(json.message || "Erro ao criar plano")
        return
      }

      const { data: newPlan } = await res.json()
      setPlanos((prev) => [...prev, { ...newPlan, _count: { subscriptions: 0 } }])
      toast.success("Plano criado com sucesso!")
      form.reset()
      setDialogOpen(false)
    } catch {
      toast.error("Erro ao criar plano. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function deletePlan(id: string) {
    if (!confirm("Desativar este plano? As assinaturas existentes continuarão ativas.")) return
    try {
      const res = await fetch(`/api/plans/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setPlanos((prev) => prev.filter((p) => p.id !== id))
      toast.success("Plano desativado")
    } catch {
      toast.error("Erro ao desativar plano")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            className="inline-flex items-center gap-2 rounded-xl h-10 px-5 font-semibold text-white cursor-pointer transition-all duration-200 hover:-translate-y-0.5 text-sm"
            style={{
              background: "var(--brand-cta)",
              boxShadow: "0 4px 12px rgba(139,92,246,0.25)",
            }}
          >
            <Plus className="w-4 h-4" />
            Novo plano
          </DialogTrigger>
          <DialogContent className="max-w-md" style={{ borderRadius: "20px" }}>
            <DialogHeader>
              <DialogTitle className="font-heading text-xl">Criar novo plano</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do plano</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Plano Mensal Essencial" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="priceInCents"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço (em centavos)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="8900"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          {field.value ? formatPrice(field.value) : "R$ 0,00"}
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="appointmentsPerMonth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Agendamentos/mês</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={10}
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição (opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva os benefícios do plano..."
                          className="resize-none"
                          rows={3}
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 cursor-pointer"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 font-semibold text-white cursor-pointer"
                    style={{ background: "var(--brand-cta)" }}
                  >
                    {isSubmitting ? "Criando..." : "Criar plano"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {planos.length === 0 ? (
        <Card
          className="border-0"
          style={{ borderRadius: "16px", border: "1px solid #F1F5F9", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        >
          <CardContent className="p-12 text-center">
            <CreditCard className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="font-semibold text-slate-600">Nenhum plano ainda</p>
            <p className="text-sm text-muted-foreground mt-1">Crie seu primeiro plano de assinatura</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {planos.map((plano) => (
            <Card
              key={plano.id}
              className="border-0 transition-all duration-200 hover:-translate-y-0.5"
              style={{ borderRadius: "16px", border: "1px solid #F1F5F9", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-800">{plano.name}</p>
                    {plano.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{plano.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => deletePlan(plano.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer p-1"
                    aria-label="Desativar plano"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <p className="font-heading text-3xl font-bold text-brand-text">
                    {formatPrice(plano.priceInCents)}
                  </p>
                  <p className="text-sm text-muted-foreground">/mês</p>
                </div>

                <div className="flex items-center gap-3">
                  <Badge
                    className="rounded-full border-0 text-xs font-medium px-3"
                    style={{ background: "var(--brand-background)", color: "var(--brand-text)" }}
                  >
                    {plano.appointmentsPerMonth} agend./mês
                  </Badge>
                </div>

                <div className="flex items-center gap-1.5 text-sm text-muted-foreground pt-1 border-t"
                  style={{ borderColor: "#F1F5F9" }}>
                  <Users className="w-3.5 h-3.5" />
                  {plano._count.subscriptions} assinante{plano._count.subscriptions !== 1 ? "s" : ""} ativa{plano._count.subscriptions !== 1 ? "s" : ""}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
