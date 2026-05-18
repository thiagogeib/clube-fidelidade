import { z } from "zod"

export const createAppointmentSchema = z.object({
  scheduledAt: z
    .string()
    .min(1, "Selecione uma data e horário")
    .transform((val) => {
      // Converte datetime-local (sem tz) para ISO 8601 completo
      if (val.length === 16) return new Date(val).toISOString()
      return new Date(val).toISOString()
    })
    .pipe(z.string().datetime("Data/hora inválida")),
  durationMinutes: z.number().int().min(15).max(480).default(60),
  serviceType:     z.string().optional(),
  serviceId:       z.string().optional().nullable(),
  notes:           z.string().optional(),
})

export const updateAppointmentSchema = z.object({
  scheduledAt:     z.string().datetime().optional(),
  durationMinutes: z.number().int().min(15).max(480).optional(),
  serviceType:     z.string().optional(),
  notes:           z.string().optional(),
  status:          z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
})

export const cancelAppointmentSchema = z.object({
  cancelReason: z.string().optional(),
})

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>
export type CancelAppointmentInput = z.infer<typeof cancelAppointmentSchema>
