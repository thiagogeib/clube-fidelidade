import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const slotSchema = z.object({
  dayOfWeek:   z.number().int().min(0).max(6),
  startTime:   z.string().regex(/^\d{2}:\d{2}$/),
  endTime:     z.string().regex(/^\d{2}:\d{2}$/),
  slotMinutes: z.number().int().min(15).max(480),
  isActive:    z.boolean(),
})

const upsertSchema = z.object({
  slots: z.array(slotSchema),
})

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const professionalId = searchParams.get("professionalId")

  if (!professionalId) {
    const session = await auth()
    if (!session?.user || session.user.role !== "PROFESSIONAL") {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }
    const availability = await db.availability.findMany({
      where: { professionalId: session.user.id },
      orderBy: { dayOfWeek: "asc" },
    })
    return Response.json({ data: availability })
  }

  const availability = await db.availability.findMany({
    where: { professionalId, isActive: true },
    orderBy: { dayOfWeek: "asc" },
  })
  return Response.json({ data: availability })
}

export async function PUT(req: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "PROFESSIONAL") {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = upsertSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: "Validation", details: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const professionalId = session.user.id
  const ops = parsed.data.slots.map((slot) =>
    db.availability.upsert({
      where: { professionalId_dayOfWeek: { professionalId, dayOfWeek: slot.dayOfWeek } },
      update: { ...slot },
      create: { professionalId, ...slot },
    })
  )

  const results = await db.$transaction(ops)
  return Response.json({ data: results })
}
