import Link from "next/link"
import { Star, Calendar, Sparkles, Heart, CheckCircle, ArrowRight, Clock, ShoppingBag, Scissors, Tag } from "lucide-react"
import { theme } from "@/lib/theme"
import { db } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

const depoimentos = [
  { nome: "Ana Carolina", texto: "Desde que entrei no clube, nunca mais fiquei sem horário. O agendamento online é super fácil e prático!", nota: 5 },
  { nome: "Juliana Ferreira", texto: "Adorei a comodidade. Pago um valor fixo todo mês e já sei que meu horário está garantido. Recomendo demais!", nota: 5 },
  { nome: "Beatriz Santos", texto: "As dicas que ela posta no aplicativo me ajudaram muito a cuidar do cabelo em casa. Vale muito a pena!", nota: 5 },
]

function formatPrice(cents: number | null) {
  if (!cents) return null
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100)
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes}min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h${m}min` : `${h}h`
}

export default async function LandingPage() {
  // Busca o primeiro profissional cadastrado (deploy single-tenant)
  const professional = await db.user.findFirst({ where: { role: "PROFESSIONAL" } })

  const [services, products, availability, plans] = professional
    ? await Promise.all([
        db.service.findMany({ where: { professionalId: professional.id, isActive: true }, orderBy: { createdAt: "asc" } }),
        db.product.findMany({ where: { professionalId: professional.id, isActive: true }, orderBy: [{ order: "asc" }, { createdAt: "asc" }] }),
        db.availability.findMany({ where: { professionalId: professional.id, isActive: true }, orderBy: { dayOfWeek: "asc" } }),
        db.plan.findMany({ where: { professionalId: professional.id, isActive: true }, orderBy: { priceInCents: "asc" } }),
      ])
    : [[], [], [], []]

  const byCategory = products.reduce<Record<string, typeof products>>((acc, p) => {
    const cat = p.category ?? "Produtos"
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(p)
    return acc
  }, {})

  return (
    <div className="min-h-svh flex flex-col" style={{ backgroundColor: "var(--brand-background)" }}>
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b" style={{ borderColor: "var(--brand-border)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <span className="font-heading text-xl font-bold text-brand-primary">{theme.brandName}</span>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="font-medium cursor-pointer text-brand-text hover:text-brand-primary">Entrar</Button>
            </Link>
            <Link href="/cadastro">
              <Button className="rounded-full px-5 font-semibold cursor-pointer text-white transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: "var(--brand-cta)", boxShadow: "0 4px 12px rgba(139,92,246,0.3)" }}>
                Entrar no clube
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-20 sm:py-28 px-4"
          style={{ background: `linear-gradient(135deg, var(--brand-background) 0%, white 60%, var(--brand-background) 100%)` }}>
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge className="inline-flex gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border-0"
              style={{ background: "linear-gradient(135deg, var(--brand-secondary), var(--brand-primary))", color: "white" }}>
              <Heart className="w-3.5 h-3.5" />
              Clube de Fidelidade Exclusivo
            </Badge>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight" style={{ color: "var(--brand-text)" }}>
              Cuide do seu cabelo com{" "}
              <span className="text-brand-primary">exclusividade</span>{" "}e conveniência
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Assine um plano mensal, garanta seus horários e receba dicas exclusivas. Sem filas, sem preocupações.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Link href="/cadastro">
                <Button size="lg" className="w-full sm:w-auto h-14 px-10 rounded-full font-semibold text-base cursor-pointer text-white transition-all duration-200 hover:-translate-y-1"
                  style={{ background: "var(--brand-cta)", boxShadow: "0 6px 20px rgba(139,92,246,0.35)" }}>
                  Quero fazer parte <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-10 rounded-full font-semibold text-base cursor-pointer transition-all duration-200 hover:bg-white"
                  style={{ borderColor: "var(--brand-border)", color: "var(--brand-text)" }}>
                  Já sou membro
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500" />Cancele quando quiser</div>
              <div className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500" />Agendamento online 24h</div>
              <div className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500" />Pagamento seguro</div>
            </div>
          </div>
        </section>

        {/* Serviços */}
        {services.length > 0 && (
          <section className="py-20 px-4 bg-white">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 mb-4">
                  <Scissors className="w-5 h-5" style={{ color: "var(--brand-primary)" }} />
                  <h2 className="font-heading text-3xl sm:text-4xl font-semibold" style={{ color: "var(--brand-text)" }}>Nossos serviços</h2>
                </div>
                <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                  Agende online e garanta seu horário sem precisar ligar.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {services.map((s) => (
                  <Card key={s.id} className="border-0 transition-all duration-200 hover:-translate-y-0.5"
                    style={{ borderRadius: "16px", border: "1px solid var(--brand-border)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                    <CardContent className="p-5 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800">{s.name}</p>
                        {s.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{s.description}</p>}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {s.flexibleTime ? "Tempo variável" : formatDuration(s.durationMinutes)}
                          </span>
                          {s.priceInCents && (
                            <span className="text-xs font-semibold" style={{ color: "var(--brand-primary)" }}>
                              {formatPrice(s.priceInCents)}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Horários de atendimento */}
              {availability.length > 0 && (
                <div className="max-w-2xl mx-auto">
                  <p className="text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                    <Calendar className="w-4 h-4 inline mr-1.5" />
                    Horários de atendimento
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {availability.map((a) => (
                      <div key={a.id} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                        style={{ background: "var(--brand-background)", border: "1px solid var(--brand-border)", color: "var(--brand-text)" }}>
                        <span className="font-bold" style={{ color: "var(--brand-primary)" }}>{DAYS[a.dayOfWeek]}</span>
                        <span className="text-muted-foreground">{a.startTime}–{a.endTime}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-center mt-8">
                <Link href="/cadastro">
                  <Button className="h-12 px-8 rounded-full font-semibold cursor-pointer text-white transition-all duration-200 hover:-translate-y-0.5"
                    style={{ background: "var(--brand-cta)", boxShadow: "0 4px 12px rgba(139,92,246,0.25)" }}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Agendar horário
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Produtos à venda */}
        {products.length > 0 && (
          <section className="py-20 px-4" style={{ backgroundColor: "var(--brand-background)" }}>
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 mb-4">
                  <ShoppingBag className="w-5 h-5" style={{ color: "var(--brand-primary)" }} />
                  <h2 className="font-heading text-3xl sm:text-4xl font-semibold" style={{ color: "var(--brand-text)" }}>Produtos à venda</h2>
                </div>
                <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                  Produtos selecionados pela profissional para você levar para casa.
                </p>
              </div>

              <div className="space-y-8">
                {Object.entries(byCategory).map(([category, items]) => (
                  <div key={category}>
                    <div className="flex items-center gap-2 mb-4">
                      <Tag className="w-3.5 h-3.5" style={{ color: "var(--brand-primary)" }} />
                      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--brand-primary)" }}>{category}</p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {items.map((product) => (
                        <Card key={product.id} className="border-0 overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
                          style={{ borderRadius: "16px", border: "1px solid var(--brand-border)", background: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                          {product.imageUrl && (
                            <div className="w-full overflow-hidden" style={{ maxHeight: "180px" }}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={product.imageUrl} alt={product.name} className="w-full object-cover" style={{ maxHeight: "180px" }} />
                            </div>
                          )}
                          <CardContent className="p-4">
                            <p className="font-semibold text-slate-800">{product.name}</p>
                            {product.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{product.description}</p>}
                            <div className="flex items-center justify-between mt-3">
                              {product.priceInCents ? (
                                <p className="text-base font-bold" style={{ color: "var(--brand-primary)" }}>{formatPrice(product.priceInCents)}</p>
                              ) : (
                                <span />
                              )}
                              <Link href="/cadastro">
                                <button className="text-xs font-semibold px-3 py-1.5 rounded-full cursor-pointer transition-all duration-200 hover:-translate-y-0.5 text-white"
                                  style={{ background: "var(--brand-cta)" }}>
                                  Comprar
                                </button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-10">
                <p className="text-sm text-muted-foreground mb-4">Cadastre-se para ver todo o catálogo e fazer pedidos</p>
                <Link href="/cadastro">
                  <Button variant="outline" className="h-12 px-8 rounded-full font-semibold cursor-pointer transition-all duration-200"
                    style={{ borderColor: "var(--brand-primary)", color: "var(--brand-primary)" }}>
                    Ver catálogo completo
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Planos */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl sm:text-4xl font-semibold mb-4" style={{ color: "var(--brand-text)" }}>Escolha seu plano</h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">Planos flexíveis para todos os momentos.</p>
            </div>

            {plans.length > 0 ? (
              <div className={`grid grid-cols-1 gap-6 max-w-4xl mx-auto ${plans.length === 1 ? "md:grid-cols-1 max-w-sm" : plans.length === 2 ? "md:grid-cols-2 max-w-2xl" : "md:grid-cols-3"}`}>
                {plans.map((plan, i) => {
                  const isHighlight = i === Math.floor(plans.length / 2)
                  return (
                    <Card key={plan.id} className="border-0 relative transition-all duration-200 hover:-translate-y-1"
                      style={isHighlight
                        ? { borderRadius: "16px", background: `linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-cta) 100%)`, boxShadow: "0 8px 24px rgba(139,92,246,0.3)" }
                        : { borderRadius: "16px", border: "1px solid var(--brand-border)", boxShadow: "0 4px 12px rgba(236,72,153,0.08)" }}>
                      {isHighlight && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-amber-900"
                          style={{ background: "linear-gradient(135deg, #D4AF37, #F5E6A3)" }}>
                          Mais popular
                        </div>
                      )}
                      <CardContent className="p-8 space-y-5">
                        <div>
                          <p className={`text-sm font-semibold uppercase tracking-wider mb-1 ${isHighlight ? "text-white/70" : "text-muted-foreground"}`}>{plan.name}</p>
                          <div className="flex items-end gap-1">
                            <span className={`font-heading text-4xl font-bold ${isHighlight ? "text-white" : "text-brand-text"}`}>
                              {formatPrice(plan.priceInCents)}
                            </span>
                            <span className={`mb-1 ${isHighlight ? "text-white/70" : "text-muted-foreground"}`}>/mês</span>
                          </div>
                        </div>
                        <Separator className={isHighlight ? "bg-white/20" : undefined} style={!isHighlight ? { backgroundColor: "var(--brand-border)" } : undefined} />
                        <ul className="space-y-3 text-sm">
                          {[
                            `${plan.appointmentsPerMonth} agendamento${plan.appointmentsPerMonth > 1 ? "s" : ""} por mês`,
                            "Acesso ao feed de dicas",
                            "Acesso ao catálogo",
                            "Cancelamento a qualquer hora",
                          ].map((item) => (
                            <li key={item} className={`flex items-center gap-2 ${isHighlight ? "text-white" : "text-muted-foreground"}`}>
                              <CheckCircle className={`w-4 h-4 shrink-0 ${isHighlight ? "text-white/80" : "text-brand-primary"}`} />
                              {item}
                            </li>
                          ))}
                        </ul>
                        <Link href="/cadastro" className="block">
                          <Button className={`w-full rounded-xl h-11 font-semibold cursor-pointer transition-all duration-200 ${isHighlight ? "bg-white hover:bg-white/90" : "hover:opacity-90"}`}
                            variant={isHighlight ? "default" : "outline"}
                            style={isHighlight
                              ? { color: "var(--brand-primary)" }
                              : { borderColor: "var(--brand-primary)", color: "var(--brand-primary)" }}>
                            Assinar plano
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              /* Planos mockados enquanto não há cadastro */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {[
                  { label: "Essencial", price: "R$ 89", features: ["1 agendamento por mês", "Acesso ao feed de dicas", "Cancelamento a qualquer hora"] },
                  { label: "Completo", price: "R$ 159", features: ["2 agendamentos por mês", "Prioridade na agenda", "Feed de dicas exclusivas", "Atendimento preferencial"], highlight: true },
                  { label: "VIP", price: "R$ 249", features: ["4 agendamentos por mês", "Horários exclusivos", "Feed VIP com tutoriais", "Suporte por WhatsApp"] },
                ].map((p) => (
                  <Card key={p.label} className="border-0 relative transition-all duration-200 hover:-translate-y-1"
                    style={p.highlight
                      ? { borderRadius: "16px", background: `linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-cta) 100%)`, boxShadow: "0 8px 24px rgba(139,92,246,0.3)" }
                      : { borderRadius: "16px", border: "1px solid var(--brand-border)", boxShadow: "0 4px 12px rgba(236,72,153,0.08)" }}>
                    {p.highlight && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-amber-900"
                        style={{ background: "linear-gradient(135deg, #D4AF37, #F5E6A3)" }}>Mais popular</div>
                    )}
                    <CardContent className="p-8 space-y-5">
                      <div>
                        <p className={`text-sm font-semibold uppercase tracking-wider mb-1 ${p.highlight ? "text-white/70" : "text-muted-foreground"}`}>{p.label}</p>
                        <div className="flex items-end gap-1">
                          <span className={`font-heading text-4xl font-bold ${p.highlight ? "text-white" : "text-brand-text"}`}>{p.price}</span>
                          <span className={`mb-1 ${p.highlight ? "text-white/70" : "text-muted-foreground"}`}>/mês</span>
                        </div>
                      </div>
                      <Separator className={p.highlight ? "bg-white/20" : undefined} style={!p.highlight ? { backgroundColor: "var(--brand-border)" } : undefined} />
                      <ul className="space-y-3 text-sm">
                        {p.features.map((f) => (
                          <li key={f} className={`flex items-center gap-2 ${p.highlight ? "text-white" : "text-muted-foreground"}`}>
                            <CheckCircle className={`w-4 h-4 shrink-0 ${p.highlight ? "text-white/80" : "text-brand-primary"}`} />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <Link href="/cadastro" className="block">
                        <Button className={`w-full rounded-xl h-11 font-semibold cursor-pointer transition-all duration-200 ${p.highlight ? "bg-white hover:bg-white/90" : ""}`}
                          variant={p.highlight ? "default" : "outline"}
                          style={p.highlight ? { color: "var(--brand-primary)" } : { borderColor: "var(--brand-primary)", color: "var(--brand-primary)" }}>
                          Assinar plano
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Depoimentos */}
        <section className="py-20 px-4" style={{ backgroundColor: "var(--brand-background)" }}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl sm:text-4xl font-semibold mb-4" style={{ color: "var(--brand-text)" }}>O que dizem nossas clientes</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {depoimentos.map((d) => (
                <Card key={d.nome} className="border transition-all duration-200 hover:-translate-y-1"
                  style={{ borderRadius: "16px", borderColor: "var(--brand-border)", background: "white", boxShadow: "0 4px 12px rgba(236,72,153,0.08)" }}>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex gap-0.5">
                      {Array.from({ length: d.nota }).map((_, i) => (<Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />))}
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed italic">&ldquo;{d.texto}&rdquo;</p>
                    <div className="flex items-center gap-3 pt-2">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                        style={{ background: "var(--brand-primary)" }}>{d.nome[0]}</div>
                      <span className="font-semibold text-sm" style={{ color: "var(--brand-text)" }}>{d.nome}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold" style={{ color: "var(--brand-text)" }}>Pronta para entrar no clube?</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Junte-se a dezenas de clientes que já descobriram a facilidade de ter seu horário garantido todo mês.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Link href="/cadastro">
                <Button size="lg" className="w-full sm:w-auto h-14 px-10 rounded-full font-semibold text-base cursor-pointer text-white transition-all duration-200 hover:-translate-y-1"
                  style={{ background: "var(--brand-cta)", boxShadow: "0 6px 20px rgba(139,92,246,0.35)" }}>
                  Começar agora <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 px-4" style={{ borderColor: "var(--brand-border)", backgroundColor: "white" }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-heading text-lg font-bold text-brand-primary">{theme.brandName}</span>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-brand-primary transition-colors">Entrar</Link>
            <Link href="/cadastro" className="hover:text-brand-primary transition-colors">Cadastrar</Link>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} {theme.brandName}. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
