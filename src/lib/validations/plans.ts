import { z } from "zod"

export const createPlanSchema = z.object({
  name:                 z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  description:          z.string().optional(),
  priceInCents:         z.number().int().positive("Preço deve ser positivo"),
  appointmentsPerMonth: z.number().int().min(1, "Mínimo 1 agendamento por mês"),
  durationDays:         z.number().int().default(30),
})

export const updatePlanSchema = createPlanSchema.partial().extend({
  isActive: z.boolean().optional(),
})

export type CreatePlanInput = z.infer<typeof createPlanSchema>
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>
