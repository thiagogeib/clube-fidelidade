import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const createSchema = z.object({
  name:            z.string().min(2),
  description:     z.string().optional(),
  durationMinutes: z.number().int().min(15).max(720),
  priceInCents:    z.number().int().min(0).optional(),
  flexibleTime:    z.boolean().default(false),
})

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const professionalId = searchParams.get("professionalId")

  const where = professionalId
    ? { professionalId, isActive: true }
    : undefined

  if (!where) {
    const session = await auth()
    if (!session?.user || session.user.role !== "PROFESSIONAL") {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }
    const services = await db.service.findMany({
      where: { professionalId: session.user.id },
      orderBy: { createdAt: "asc" },
    })
    return Response.json({ data: services })
  }

  const services = await db.service.findMany({
    where,
    orderBy: { createdAt: "asc" },
  })
  return Response.json({ data: services })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "PROFESSIONAL") {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: "Validation", details: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const service = await db.service.create({
    data: { ...parsed.data, professionalId: session.user.id },
  })
  return Response.json({ data: service }, { status: 201 })
}
