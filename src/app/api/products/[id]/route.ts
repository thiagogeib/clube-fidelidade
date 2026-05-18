import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const updateSchema = z.object({
  name:         z.string().min(2).optional(),
  description:  z.string().optional(),
  imageUrl:     z.string().optional().nullable(),
  priceInCents: z.number().int().min(0).optional().nullable(),
  category:     z.string().optional().nullable(),
  order:        z.number().int().optional(),
  isActive:     z.boolean().optional(),
})

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== "PROFESSIONAL") {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = await params
  const existing = await db.product.findFirst({ where: { id, professionalId: session.user.id } })
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 })

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: "Validation", details: parsed.error.flatten().fieldErrors }, { status: 400 })
  }
  const updated = await db.product.update({ where: { id }, data: parsed.data })
  return Response.json({ data: updated })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== "PROFESSIONAL") {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = await params
  const existing = await db.product.findFirst({ where: { id, professionalId: session.user.id } })
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 })

  await db.product.update({ where: { id }, data: { isActive: false } })
  return new Response(null, { status: 204 })
}
