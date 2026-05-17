import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { updatePostSchema } from "@/lib/validations/posts"

// GET /api/posts/:id
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

// PATCH /api/posts/:id
// Apenas o profissional autor.
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

  const data = {
    ...parsed.data,
    // Se publicando pela primeira vez, registra a data
    ...(parsed.data.isPublished && !post.isPublished ? { publishedAt: new Date() } : {}),
  }

  const updated = await db.post.update({ where: { id }, data })
  return NextResponse.json({ data: updated })
}

// DELETE /api/posts/:id
// Soft delete não aplicável a posts — hard delete permitido só ao autor.
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
