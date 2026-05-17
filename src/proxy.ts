import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

// Rotas protegidas por perfil
const PROFESSIONAL_ROUTES = ["/painel"]
const CLIENT_ROUTES       = ["/area"]

// Rotas de API que exigem autenticação (qualquer role)
const PROTECTED_API_ROUTES = [
  "/api/plans",
  "/api/appointments",
  "/api/posts",
  "/api/subscriptions",
]

// Rotas de API públicas (não exigem autenticação)
// O webhook valida assinatura HMAC internamente
const PUBLIC_API_ROUTES = [
  "/api/webhooks/mercadopago",
  "/api/auth",
]

export default auth(function proxy(req) {
  const { nextUrl } = req
  const session = req.auth
  const pathname = nextUrl.pathname

  // Rotas de webhook e auth são sempre públicas
  if (PUBLIC_API_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Verificar rotas de API protegidas
  if (PROTECTED_API_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Autenticação necessária" },
        { status: 401 },
      )
    }
    return NextResponse.next()
  }

  // Verificar rotas do painel profissional
  if (PROFESSIONAL_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!session?.user) {
      const loginUrl = new URL("/login", nextUrl)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }

    if (session.user.role !== "PROFESSIONAL") {
      return NextResponse.redirect(new URL("/area", nextUrl))
    }

    return NextResponse.next()
  }

  // Verificar rotas da área do cliente
  if (CLIENT_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!session?.user) {
      const loginUrl = new URL("/login", nextUrl)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }

    if (session.user.role !== "CLIENT") {
      return NextResponse.redirect(new URL("/painel", nextUrl))
    }

    return NextResponse.next()
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Aplicar em todas as rotas exceto arquivos estáticos e internos do Next
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}
