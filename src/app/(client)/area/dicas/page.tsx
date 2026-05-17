import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { BookOpen, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = { title: "Dicas de Beleza" }

export default async function DicasPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "CLIENT") redirect("/login")

  const subscription = await db.subscription.findFirst({
    where: { clientId: session.user.id, status: "ACTIVE" },
    include: { plan: { select: { professionalId: true } } },
  })

  const posts = subscription
    ? await db.post.findMany({
        where: {
          professionalId: subscription.plan.professionalId,
          isPublished: true,
        },
        orderBy: { publishedAt: "desc" },
        take: 50,
      })
    : []

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold" style={{ color: "var(--brand-text)" }}>
          Dicas de Beleza
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Conteúdo exclusivo da sua profissional
        </p>
      </div>

      {!subscription ? (
        <Card
          className="border-0"
          style={{
            borderRadius: "20px",
            border: "2px dashed var(--brand-border)",
            background: "white",
          }}
        >
          <CardContent className="p-10 text-center space-y-3">
            <BookOpen className="w-12 h-12 mx-auto opacity-40 text-brand-primary" />
            <p className="font-heading font-semibold text-lg" style={{ color: "var(--brand-text)" }}>
              Conteúdo exclusivo para assinantes
            </p>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Assine um plano para ter acesso às dicas e tutoriais exclusivos da sua profissional.
            </p>
          </CardContent>
        </Card>
      ) : posts.length === 0 ? (
        <Card
          className="border-0"
          style={{ borderRadius: "16px", border: "1px solid var(--brand-border)", background: "white" }}
        >
          <CardContent className="p-10 text-center space-y-3">
            <Sparkles className="w-12 h-12 mx-auto opacity-40 text-brand-primary" />
            <p className="font-semibold text-slate-600">Nenhuma dica publicada ainda</p>
            <p className="text-sm text-muted-foreground">
              Sua profissional ainda não publicou dicas. Volte em breve!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card
              key={post.id}
              className="border-0 transition-all duration-200 hover:-translate-y-0.5 cursor-default"
              style={{
                borderRadius: "16px",
                border: "1px solid var(--brand-border)",
                background: "white",
                boxShadow: "0 4px 12px rgba(236,72,153,0.06)",
              }}
            >
              {post.imageUrl && (
                <div className="overflow-hidden" style={{ borderRadius: "16px 16px 0 0" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h2
                    className="font-heading text-lg font-semibold leading-snug"
                    style={{ color: "var(--brand-text)" }}
                  >
                    {post.title}
                  </h2>
                  <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-brand-primary opacity-60" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {post.content}
                </p>
                <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "var(--brand-border)" }}>
                  <time className="text-xs text-muted-foreground">
                    {format(
                      new Date(post.publishedAt ?? post.createdAt),
                      "dd 'de' MMMM 'de' yyyy",
                      { locale: ptBR }
                    )}
                  </time>
                  <Badge
                    className="text-xs rounded-full border-0"
                    style={{ background: "var(--brand-background)", color: "var(--brand-text)" }}
                  >
                    Dica exclusiva
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
