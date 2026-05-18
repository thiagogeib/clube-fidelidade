import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const updateSchema = z.object({
  name:            z.string().min(2).optional(),
  description:     z.string().optional(),
  durationMinutes: z.number().int().min(15).max(720).optional(),
  priceInCents:    z.number().int().min(0).optional().nullable(),
  flexibleTime:    z.boolean().optional(),
  isActive:        z.boolean().optional(),
})

async function getProfessionalService(id: string, professionalId: string) {
  return db.service.findFirst({ where: { id, professionalId } })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== "PROFESSIONAL") {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const existing = await getProfessionalService(id, session.user.id)
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 })

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: "Validation", details: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const updated = await db.service.update({ where: { id }, data: parsed.data })
  return Response.json({ data: updated })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== "PROFESSIONAL") {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const existing = await getProfessionalService(id, session.user.id)
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 })

  await db.service.update({ where: { id }, data: { isActive: false } })
  return new Response(null, { status: 204 })
}
