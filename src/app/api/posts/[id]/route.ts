import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { updatePostSchema } from "@/lib/validations/posts"
import { sendNewPost } from "@/lib/email"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const post = await db.post.findUnique({ where: { id } })

  if (!post || !post.isPublished) {
    return NextResponse.json({ error: "NotFound", message: "Post não encontrado" }, { status: 404 })
  }

  return NextResponse.json({ data: post })
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized", message: "Não autenticado" }, { status: 401 })
  }

  const { id } = await params
  const post = await db.post.findUnique({ where: { id } })

  if (!post) {
    return NextResponse.json({ error: "NotFound", message: "Post não encontrado" }, { status: 404 })
  }

  if (post.professionalId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden", message: "Acesso negado" }, { status: 403 })
  }

  const body   = await req.json()
  const parsed = updatePostSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "ValidationError", message: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const isPublishingNow = parsed.data.isPublished && !post.isPublished

  const updated = await db.post.update({
    where: { id },
    data: {
      ...parsed.data,
      ...(isPublishingNow ? { publishedAt: new Date() } : {}),
    },
  })

  // Notifica todos os clientes ativos ao publicar pela primeira vez
  if (isPublishingNow) {
    const activeClients = await db.subscription.findMany({
      where: {
        status: "ACTIVE",
        plan: { professionalId: session.user.id },
      },
      include: { client: { select: { name: true, email: true } } },
    })
    for (const sub of activeClients) {
      if (sub.client?.email) {
        sendNewPost({
          to:         sub.client.email,
          clientName: sub.client.name ?? "Cliente",
          postTitle:  updated.title,
          postId:     updated.id,
        })
      }
    }
  }

  return NextResponse.json({ data: updated })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized", message: "Não autenticado" }, { status: 401 })
  }

  const { id } = await params
  const post = await db.post.findUnique({ where: { id } })

  if (!post) {
    return NextResponse.json({ error: "NotFound", message: "Post não encontrado" }, { status: 404 })
  }

  if (post.professionalId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden", message: "Acesso negado" }, { status: 403 })
  }

  await db.post.delete({ where: { id } })
  return new Response(null, { status: 204 })
}
