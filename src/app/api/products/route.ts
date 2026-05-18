import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const createSchema = z.object({
  name:         z.string().min(2),
  description:  z.string().optional(),
  imageUrl:     z.string().optional(),
  priceInCents: z.number().int().min(0).optional(),
  category:     z.string().optional(),
  order:        z.number().int().default(0),
})

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const professionalId = searchParams.get("professionalId")

  if (professionalId) {
    const products = await db.product.findMany({
      where: { professionalId, isActive: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    })
    return Response.json({ data: products })
  }

  const session = await auth()
  if (!session?.user || session.user.role !== "PROFESSIONAL") {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  const products = await db.product.findMany({
    where: { professionalId: session.user.id },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  })
  return Response.json({ data: products })
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
  const product = await db.product.create({
    data: { ...parsed.data, professionalId: session.user.id },
  })
  return Response.json({ data: product }, { status: 201 })
}
