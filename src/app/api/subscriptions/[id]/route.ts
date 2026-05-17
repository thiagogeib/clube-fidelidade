import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

// GET /api/subscriptions/:id
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized", message: "Não autenticado" }, { status: 401 })
  }

  const { id } = await params
  const subscription = await db.subscription.findUnique({
    where:   { id },
    include: { plan: true, client: { select: { id: true, name: true, email: true, image: true, phone: true } } },
  })

  if (!subscription) {
    return NextResponse.json({ error: "NotFound", message: "Assinatura não encontrada" }, { status: 404 })
  }

  // Cliente só pode ver a própria assinatura; profissional vê de qualquer cliente
  if (session.user.role === "CLIENT" && subscription.clientId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden", message: "Acesso negado" }, { status: 403 })
  }

  return NextResponse.json({ data: subscription })
}

// PATCH /api/subscriptions/:id
// Profissional pode cancelar/pausar assinaturas; cliente pode cancelar a própria.
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized", message: "Não autenticado" }, { status: 401 })
  }

  const { id } = await params
  const subscription = await db.subscription.findUnique({
    where:   { id },
    include: { plan: true },
  })

  if (!subscription) {
    return NextResponse.json({ error: "NotFound", message: "Assinatura não encontrada" }, { status: 404 })
  }

  const isOwner = subscription.clientId === session.user.id
  const isProfessional =
    session.user.role === "PROFESSIONAL" &&
    subscription.plan.professionalId === session.user.id

  if (!isOwner && !isProfessional) {
    return NextResponse.json({ error: "Forbidden", message: "Acesso negado" }, { status: 403 })
  }

  const body = await req.json()
  const { status } = body as { status?: string }

  const updated = await db.subscription.update({ where: { id }, data: { status: status as never } })
  return NextResponse.json({ data: updated })
}
