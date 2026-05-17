import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { cadastroClienteSchema } from "@/lib/validations/auth"

// POST /api/auth/register
// Cria uma nova conta de cliente.
// O cadastro de profissional é feito via convite/setup separado.

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = cadastroClienteSchema.safeParse(body)

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

    const { name, email, phone, password } = parsed.data

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: "Conflict", message: "Email já cadastrado" },
        { status: 409 },
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await db.user.create({
      data: { name, email, phone, passwordHash, role: "CLIENT" },
      select: { id: true, name: true, email: true, role: true },
    })

    return NextResponse.json({ data: user }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "InternalServerError", message: "Erro interno" },
      { status: 500 },
    )
  }
}
