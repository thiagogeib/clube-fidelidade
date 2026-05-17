import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { BookOpen, Sparkles, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

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
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-24">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: "var(--brand-background)" }}
        >
          <Sparkles className="w-5 h-5" style={{ color: "var(--brand-primary)" }} />
        </div>
        <div>
          <h1 className="font-heading text-xl font-bold" style={{ color: "var(--brand-text)" }}>
            Dicas de Beleza
          </h1>
          <p className="text-muted-foreground text-xs mt-0.5">
            Conteúdo exclusivo da sua profissional
          </p>
        </div>
      </div>

      {!subscription ? (
        <Card className="border-0" style={{ borderRadius: "20px", border: "2px dashed var(--brand-border)", background: "white" }}>
          <CardContent className="p-10 text-center space-y-3">
            <BookOpen className="w-12 h-12 mx-auto opacity-40" style={{ color: "var(--brand-primary)" }} />
            <p className="font-heading font-semibold text-lg" style={{ color: "var(--brand-text)" }}>
              Conteúdo exclusivo para assinantes
            </p>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Assine um plano para ter acesso às dicas e tutoriais exclusivos da sua profissional.
            </p>
          </CardContent>
        </Card>
      ) : posts.length === 0 ? (
        <Card className="border-0" style={{ borderRadius: "16px", border: "1px solid var(--brand-border)", background: "white" }}>
          <CardContent className="p-10 text-center space-y-3">
            <Sparkles className="w-12 h-12 mx-auto opacity-40" style={{ color: "var(--brand-primary)" }} />
            <p className="font-semibold text-slate-600">Nenhuma dica publicada ainda</p>
            <p className="text-sm text-muted-foreground">Sua profissional ainda não publicou dicas. Volte em breve!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-white overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
              style={{
                borderRadius: "20px",
                border: "1px solid var(--brand-border)",
                boxShadow: "0 4px 16px rgba(236,72,153,0.07)",
              }}
            >
              {post.imageUrl && (
                <div className="w-full overflow-hidden" style={{ maxHeight: "280px" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full object-cover"
                    style={{ maxHeight: "280px" }}
                  />
                </div>
              )}

              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-heading text-lg font-bold leading-snug" style={{ color: "var(--brand-text)" }}>
                    {post.title}
                  </h2>
                  <Badge
                    className="text-xs rounded-full border-0 shrink-0 mt-0.5"
                    style={{ background: "var(--brand-background)", color: "var(--brand-primary)" }}
                  >
                    Exclusivo
                  </Badge>
                </div>

                <div
                  className="prose prose-sm max-w-none text-slate-600"
                  style={{ lineHeight: "1.75" }}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => (
                        <h1 className="font-heading text-lg font-bold mt-4 mb-2" style={{ color: "var(--brand-text)" }}>{children}</h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="font-heading text-base font-bold mt-3 mb-2" style={{ color: "var(--brand-text)" }}>{children}</h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="font-semibold mt-3 mb-1" style={{ color: "var(--brand-text)" }}>{children}</h3>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold" style={{ color: "var(--brand-text)" }}>{children}</strong>
                      ),
                      ul: ({ children }) => (
                        <ul className="space-y-1 my-2 pl-4">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="space-y-1 my-2 pl-4 list-decimal">{children}</ol>
                      ),
                      li: ({ children }) => (
                        <li className="flex gap-2 text-sm text-slate-600 list-none">
                          <span style={{ color: "var(--brand-primary)" }} className="mt-0.5 shrink-0">✦</span>
                          <span>{children}</span>
                        </li>
                      ),
                      p: ({ children }) => (
                        <p className="text-sm text-slate-600 leading-relaxed mb-2">{children}</p>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote
                          className="border-l-4 pl-4 py-1 my-3 italic text-sm text-slate-500"
                          style={{ borderColor: "var(--brand-primary)" }}
                        >
                          {children}
                        </blockquote>
                      ),
                      hr: () => (
                        <hr className="my-4" style={{ borderColor: "var(--brand-border)" }} />
                      ),
                    }}
                  >
                    {post.content}
                  </ReactMarkdown>
                </div>

                <div
                  className="flex items-center gap-2 pt-3 border-t text-xs text-muted-foreground"
                  style={{ borderColor: "var(--brand-border)" }}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <time>
                    {format(
                      new Date(post.publishedAt ?? post.createdAt),
                      "dd 'de' MMMM 'de' yyyy",
                      { locale: ptBR }
                    )}
                  </time>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
