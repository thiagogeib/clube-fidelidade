import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { createPlanSchema } from "@/lib/validations/plans"

// GET /api/plans
// Público: retorna planos ativos do profissional.
// Query params: professionalId (obrigatório para listagem pública)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const professionalId = searchParams.get("professionalId")

  // Listagem pública — filtra pelo profissional do tenant
  if (!professionalId) {
    return NextResponse.json(
      { error: "BadRequest", message: "professionalId obrigatório" },
      { status: 400 },
    )
  }

  const plans = await db.plan.findMany({
    where:   { professionalId, isActive: true },
    orderBy: { priceInCents: "asc" },
  })

  return NextResponse.json({ data: plans })
}

// POST /api/plans
// Apenas PROFESSIONAL. Cria novo plano de fidelidade.

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized", message: "Não autenticado" }, { status: 401 })
  }
  if (session.user.role !== "PROFESSIONAL") {
    return NextResponse.json({ error: "Forbidden", message: "Acesso negado" }, { status: 403 })
  }

  try {
    const body   = await req.json()
    const parsed = createPlanSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:   "ValidationError",
          message: "Dados inválidos",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      )
    }

    const plan = await db.plan.create({
      data: { ...parsed.data, professionalId: session.user.id },
    })

    return NextResponse.json({ data: plan }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "InternalServerError", message: "Erro interno" }, { status: 500 })
  }
}
