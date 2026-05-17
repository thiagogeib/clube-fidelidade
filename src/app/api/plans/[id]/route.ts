import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { updatePlanSchema } from "@/lib/validations/plans"

// GET /api/plans/:id
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const plan = await db.plan.findUnique({ where: { id } })

  if (!plan) {
    return NextResponse.json({ error: "NotFound", message: "Plano não encontrado" }, { status: 404 })
  }

  return NextResponse.json({ data: plan })
}

// PATCH /api/plans/:id
// Apenas o profissional dono do plano.
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized", message: "Não autenticado" }, { status: 401 })
  }

  const { id } = await params
  const plan = await db.plan.findUnique({ where: { id } })

  if (!plan) {
    return NextResponse.json({ error: "NotFound", message: "Plano não encontrado" }, { status: 404 })
  }

  if (plan.professionalId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden", message: "Acesso negado" }, { status: 403 })
  }

  const body   = await req.json()
  const parsed = updatePlanSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "ValidationError", message: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const updated = await db.plan.update({ where: { id }, data: parsed.data })
  return NextResponse.json({ data: updated })
}

// DELETE /api/plans/:id
// Soft delete: marca isActive = false.
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized", message: "Não autenticado" }, { status: 401 })
  }

  const { id } = await params
  const plan = await db.plan.findUnique({ where: { id } })

  if (!plan) {
    return NextResponse.json({ error: "NotFound", message: "Plano não encontrado" }, { status: 404 })
  }

  if (plan.professionalId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden", message: "Acesso negado" }, { status: 403 })
  }

  const updated = await db.plan.update({ where: { id }, data: { isActive: false } })
  return NextResponse.json({ data: updated })
}
