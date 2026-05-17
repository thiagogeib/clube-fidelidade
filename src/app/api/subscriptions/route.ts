import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

// GET /api/subscriptions
// CLIENT: retorna a assinatura ativa do cliente autenticado.
// PROFESSIONAL: retorna todas as assinaturas dos seus planos.

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized", message: "Não autenticado" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const page     = Math.max(1, Number(searchParams.get("page") ?? 1))
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? 20)))
  const skip     = (page - 1) * pageSize

  if (session.user.role === "CLIENT") {
    const subscription = await db.subscription.findFirst({
      where:   { clientId: session.user.id, status: "ACTIVE" },
      include: { plan: true },
    })
    return NextResponse.json({ data: subscription })
  }

  // PROFESSIONAL: lista assinaturas dos seus planos
  const [subscriptions, total] = await Promise.all([
    db.subscription.findMany({
      where:   { plan: { professionalId: session.user.id } },
      include: { client: { select: { id: true, name: true, email: true, image: true, phone: true } }, plan: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    db.subscription.count({
      where: { plan: { professionalId: session.user.id } },
    }),
  ])

  return NextResponse.json({
    data: subscriptions,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  })
}

// POST /api/subscriptions
// CLIENT: inicia o fluxo de assinatura de um plano (cria no MP e retorna init_point).
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized", message: "Não autenticado" }, { status: 401 })
  }
  if (session.user.role !== "CLIENT") {
    return NextResponse.json({ error: "Forbidden", message: "Apenas clientes podem assinar planos" }, { status: 403 })
  }

  const body = await req.json()
  const { planId } = body as { planId?: string }

  if (!planId) {
    return NextResponse.json({ error: "BadRequest", message: "planId obrigatório" }, { status: 400 })
  }

  const plan = await db.plan.findUnique({ where: { id: planId, isActive: true } })
  if (!plan) {
    return NextResponse.json({ error: "NotFound", message: "Plano não encontrado" }, { status: 404 })
  }

  // Verificar se já tem assinatura ativa neste plano
  const existing = await db.subscription.findFirst({
    where: { clientId: session.user.id, planId, status: { in: ["ACTIVE", "PENDING"] } },
  })
  if (existing) {
    return NextResponse.json(
      { error: "Conflict", message: "Você já possui uma assinatura ativa ou pendente neste plano" },
      { status: 409 },
    )
  }

  // Criação da assinatura no Mercado Pago — implementação: payments-agent
  // Por ora retorna a assinatura pendente criada localmente
  const subscription = await db.subscription.create({
    data: { clientId: session.user.id, planId, status: "PENDING" },
  })

  return NextResponse.json({ data: subscription }, { status: 201 })
}
