import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { createPostSchema } from "@/lib/validations/posts"

// GET /api/posts
// Público para clientes autenticados: retorna posts publicados.
// Query params: professionalId, page, pageSize

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const page           = Math.max(1, Number(searchParams.get("page") ?? 1))
  const pageSize       = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? 10)))
  const skip           = (page - 1) * pageSize
  const professionalId = searchParams.get("professionalId") ?? undefined

  const where = {
    isPublished:  true,
    publishedAt:  { not: null },
    ...(professionalId ? { professionalId } : {}),
  }

  const [posts, total] = await Promise.all([
    db.post.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip,
      take: pageSize,
      select: {
        id:          true,
        title:       true,
        content:     true,
        imageUrl:    true,
        publishedAt: true,
        createdAt:   true,
      },
    }),
    db.post.count({ where }),
  ])

  return NextResponse.json({
    data: posts,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  })
}

// POST /api/posts
// Apenas PROFESSIONAL: cria novo post.
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized", message: "Não autenticado" }, { status: 401 })
  }
  if (session.user.role !== "PROFESSIONAL") {
    return NextResponse.json({ error: "Forbidden", message: "Acesso negado" }, { status: 403 })
  }

  const body   = await req.json()
  const parsed = createPostSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "ValidationError", message: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const { title, content, imageUrl, isPublished } = parsed.data

  const post = await db.post.create({
    data: {
      professionalId: session.user.id,
      title,
      content,
      imageUrl,
      isPublished,
      publishedAt: isPublished ? new Date() : null,
    },
  })

  return NextResponse.json({ data: post }, { status: 201 })
}
