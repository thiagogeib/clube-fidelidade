@AGENTS.md

# Clube Fidelidade — Guia do Projeto

## Visao Geral

Sistema de agendamento + clube de fidelidade para profissionais de beleza (cabeleireiras, trancistas).
Dual branding: um unico repositorio serve dois temas via variaveis de ambiente.

**Personas:**
- **Profissional** (role: PROFESSIONAL) — gerencia agenda, planos, clientes e publica dicas
- **Cliente** (role: CLIENT) — assina plano mensal, agenda horarios dentro da cota, le feed de dicas

---

## Stack

| Camada         | Tecnologia                          | Versao     |
|----------------|-------------------------------------|------------|
| Framework      | Next.js (App Router)                | 16.x       |
| Linguagem      | TypeScript (strict)                 | 5.x        |
| Estilos        | Tailwind CSS v4                     | 4.x        |
| Componentes    | shadcn/ui                           | latest     |
| ORM            | Prisma                              | 7.x        |
| Banco          | PostgreSQL                          | 15+        |
| Autenticacao   | next-auth v5 (beta) + PrismaAdapter | 5.0.0-beta |
| Pagamentos     | Mercado Pago SDK                    | 2.x        |
| Validacao      | Zod                                 | 4.x        |
| Formularios    | react-hook-form + @hookform/resolvers| 7.x       |
| Datas          | date-fns                            | 4.x        |
| Icones         | lucide-react                        | 1.x        |
| Toasts         | sonner                              | 2.x        |
| Fontes         | Lora (heading) + Raleway (body)     | Google     |

---

## Estrutura de Pastas

```
src/
├── app/
│   ├── (auth)/                     # Grupo: autenticacao
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   └── cadastro/page.tsx
│   │
│   ├── (professional)/             # Grupo: painel profissional
│   │   └── painel/
│   │       ├── layout.tsx          # Sidebar de navegacao
│   │       ├── page.tsx            # Dashboard
│   │       ├── agenda/page.tsx
│   │       ├── clientes/page.tsx
│   │       ├── planos/page.tsx
│   │       └── posts/page.tsx
│   │
│   ├── (client)/                   # Grupo: area do cliente
│   │   └── area/
│   │       ├── layout.tsx          # Header + bottom nav mobile
│   │       ├── page.tsx            # Home
│   │       ├── agendar/page.tsx
│   │       ├── meu-plano/page.tsx
│   │       └── dicas/page.tsx
│   │
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── auth/register/route.ts
│   │   ├── plans/route.ts
│   │   ├── plans/[id]/route.ts
│   │   ├── subscriptions/route.ts
│   │   ├── subscriptions/[id]/route.ts
│   │   ├── appointments/route.ts
│   │   ├── appointments/[id]/route.ts
│   │   ├── posts/route.ts
│   │   ├── posts/[id]/route.ts
│   │   ├── dashboard/route.ts
│   │   └── webhooks/mercadopago/route.ts
│   │
│   ├── layout.tsx                  # Root: fontes, CSS vars, Toaster
│   ├── page.tsx                    # Landing page publica
│   └── globals.css                 # Tailwind + shadcn + tokens de branding
│
├── components/
│   ├── ui/                         # shadcn/ui — NAO editar
│   ├── auth/
│   ├── professional/
│   ├── client/
│   └── shared/
│
├── lib/
│   ├── auth.ts                     # NextAuth config
│   ├── db.ts                       # Prisma singleton
│   ├── mercadopago.ts              # MP client
│   ├── theme.ts                    # Tokens de tema
│   ├── utils.ts                    # cn() (shadcn)
│   └── validations/
│       ├── auth.ts
│       ├── plans.ts
│       ├── appointments.ts
│       └── posts.ts
│
├── hooks/
├── types/index.ts
└── middleware.ts                   # Protecao de rotas
```

---

## Roles e Regras de Acesso

| Rota                             | PROFESSIONAL | CLIENT | Publico |
|----------------------------------|:------------:|:------:|:-------:|
| `/`                              |      v       |   v    |    v    |
| `/login`                         |      v       |   v    |    v    |
| `/cadastro`                      |      v       |   v    |    v    |
| `/painel/*`                      |      v       |   x    |    x    |
| `/area/*`                        |      x       |   v    |    x    |
| `GET /api/plans?professionalId=` |      v       |   v    |    v    |
| `POST /api/plans`                |      v       |   x    |    x    |
| `POST /api/appointments`         |      x       |   v    |    x    |
| `GET /api/dashboard`             |      v       |   x    |    x    |
| `POST /api/webhooks/mercadopago` |      -       |   -    |    v    |

Redirecionamentos (middleware):
- Profissional acessando `/area` vai para `/painel`
- Cliente acessando `/painel` vai para `/area`
- Nao autenticado vai para `/login?callbackUrl=<rota>`

---

## Dual Branding

Tema controlado por variaveis `NEXT_PUBLIC_*` injetadas como CSS vars no `<html>` pelo layout raiz.

**Tema A — cabeleireira:** primary `#EC4899`, cta `#8B5CF6`, bg `#FDF2F8`
**Tema B — trancista:** primary `#C2410C`, cta `#7C3AED`, bg `#FFF7ED`

Classes utilitarias: `bg-brand-primary`, `text-brand-text`, `border-brand`, `text-brand-gold`.

---

## Contratos de API

```
Response item:  { data: T }
Response lista: { data: T[], pagination: { page, pageSize, total, totalPages } }
Response erro:  { error: string, message: string, details?: Record<string, string[]> }

HTTP: 200 OK | 201 Created | 204 No Content | 400 Validation
      401 Unauthorized | 403 Forbidden | 404 NotFound | 409 Conflict | 500 Error
```

```
POST   /api/auth/register
GET    /api/plans?professionalId=        publico
POST   /api/plans                        PROFESSIONAL
GET|PATCH|DELETE /api/plans/:id

GET    /api/subscriptions
POST   /api/subscriptions                CLIENT
GET|PATCH /api/subscriptions/:id

GET    /api/appointments
POST   /api/appointments                 CLIENT (consome cota)
GET|PATCH|DELETE /api/appointments/:id

GET    /api/posts?professionalId=
POST   /api/posts                        PROFESSIONAL
GET|PATCH|DELETE /api/posts/:id

GET    /api/dashboard                    PROFESSIONAL
POST   /api/webhooks/mercadopago         publico (HMAC)
```

---

## Padroes de Codigo

**Imports:** externos > internos (@/) > relativos (./)
**Nomes:** componentes PascalCase, utilitarios camelCase, rotas kebab-case em portugues
**Server/Client:** Server Component por padrao; `"use client"` so em formularios e hooks de estado
**Precos:** sempre em centavos (Int). Ex: R$ 99,00 = `9900`
**Prisma Client:** importar de `@/generated/prisma`, nao de `@prisma/client`

---

## Rodar Localmente

```bash
npm install
cp .env.example .env.local   # editar com credenciais reais
npx prisma generate
npx prisma db push
npm run dev                  # http://localhost:3000
```

---

## Variaveis de Ambiente

| Variavel                    | Obrigatoria |
|-----------------------------|:-----------:|
| `DATABASE_URL`              | sim         |
| `AUTH_SECRET`               | sim         |
| `MP_ACCESS_TOKEN`           | sim         |
| `MP_WEBHOOK_SECRET`         | recomendado |
| `MP_NOTIFICATION_URL`       | recomendado |
| `NEXT_PUBLIC_BRAND_NAME`    | sim         |
| `NEXT_PUBLIC_BRAND_THEME`   | sim         |
| `NEXT_PUBLIC_COLOR_PRIMARY` | sim         |
| `NEXT_PUBLIC_COLOR_*`       | sim         |

---

## ADRs

**ADR-001 — Dual branding via env vars:** Aceito. Cores lidas de NEXT_PUBLIC_* e injetadas como CSS vars. Um deploy por cliente, sem condicionais no codigo.

**ADR-002 — Precos em centavos:** Aceito. Evita erros de ponto flutuante.

**ADR-003 — next-auth v5 JWT strategy:** Aceito. JWT evita query de sessao a cada request. `role` embutido no token. Reavaliacao se precisar de revogacao imediata.

**ADR-004 — Soft delete apenas em planos:** Aceito. `isActive=false` em planos pois assinaturas os referenciam. Posts e appointments: hard delete.

**ADR-005 — Transacao Prisma para agendamento:** Aceito. `db.$transaction()` garante consistencia entre criacao do appointment e incremento de `appointmentsUsed`.

**ADR-006 — Prisma Client v7 com output customizado:** Aceito. Gerador usa `output = "../src/generated/prisma"`. Importar sempre de `@/generated/prisma`.
