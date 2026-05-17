import Link from "next/link"
import { Star, Calendar, Sparkles, Heart, CheckCircle, ArrowRight } from "lucide-react"
import { theme } from "@/lib/theme"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

// Dados mockados da landing — em produção viriam de /api/plans (público)
const beneficios = [
  {
    icon: Calendar,
    title: "Agendamentos garantidos",
    desc: "Reserve seus horários com antecedência sem precisar ficar ligando. Sua vaga está reservada todo mês.",
  },
  {
    icon: Star,
    title: "Preço fixo mensal",
    desc: "Sem surpresas na conta. Pague um valor mensal e aproveite todos os benefícios do clube.",
  },
  {
    icon: Sparkles,
    title: "Dicas exclusivas",
    desc: "Receba dicas de cuidados, tendências e tutoriais diretamente da profissional para você.",
  },
]

const depoimentos = [
  {
    nome: "Ana Carolina",
    texto: "Desde que entrei no clube, nunca mais fiquei sem horário. O agendamento online é super fácil e prático!",
    nota: 5,
  },
  {
    nome: "Juliana Ferreira",
    texto: "Adorei a comodidade. Pago um valor fixo todo mês e já sei que meu horário está garantido. Recomendo demais!",
    nota: 5,
  },
  {
    nome: "Beatriz Santos",
    texto: "As dicas que ela posta no aplicativo me ajudaram muito a cuidar do cabelo em casa. Vale muito a pena!",
    nota: 5,
  },
]

export default function LandingPage() {
  return (
    <div
      className="min-h-svh flex flex-col"
      style={{ backgroundColor: "var(--brand-background)" }}
    >
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b"
        style={{ borderColor: "var(--brand-border)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <span className="font-heading text-xl font-bold text-brand-primary">
            {theme.brandName}
          </span>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="font-medium cursor-pointer text-brand-text hover:text-brand-primary">
                Entrar
              </Button>
            </Link>
            <Link href="/cadastro">
              <Button
                className="rounded-full px-5 font-semibold cursor-pointer text-white transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: "var(--brand-cta)",
                  boxShadow: "0 4px 12px rgba(139,92,246,0.3)",
                }}
              >
                Entrar no clube
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section
          className="relative py-20 sm:py-28 px-4"
          style={{
            background: `linear-gradient(135deg, var(--brand-background) 0%, white 60%, var(--brand-background) 100%)`,
          }}
        >
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge
              className="inline-flex gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border-0"
              style={{
                background: "linear-gradient(135deg, var(--brand-secondary), var(--brand-primary))",
                color: "white",
              }}
            >
              <Heart className="w-3.5 h-3.5" />
              Clube de Fidelidade Exclusivo
            </Badge>

            <h1
              className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight"
              style={{ color: "var(--brand-text)" }}
            >
              Cuide do seu cabelo com{" "}
              <span className="text-brand-primary">exclusividade</span>{" "}
              e conveniência
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Assine um plano mensal, garanta seus horários e receba dicas exclusivas.
              Sem filas, sem preocupações — só você e o melhor cuidado.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Link href="/cadastro">
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-14 px-10 rounded-full font-semibold text-base cursor-pointer text-white transition-all duration-200 hover:-translate-y-1"
                  style={{
                    background: "var(--brand-cta)",
                    boxShadow: "0 6px 20px rgba(139,92,246,0.35)",
                  }}
                >
                  Quero fazer parte
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto h-14 px-10 rounded-full font-semibold text-base cursor-pointer transition-all duration-200 hover:bg-white"
                  style={{ borderColor: "var(--brand-border)", color: "var(--brand-text)" }}
                >
                  Já sou membro
                </Button>
              </Link>
            </div>

            {/* Social proof badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Cancele quando quiser
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Agendamento online 24h
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Pagamento seguro
              </div>
            </div>
          </div>
        </section>

        {/* Benefícios */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2
                className="font-heading text-3xl sm:text-4xl font-semibold mb-4"
                style={{ color: "var(--brand-text)" }}
              >
                Por que entrar no clube?
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Muito mais do que agendamento — é uma experiência completa de cuidado.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {beneficios.map((b) => (
                <Card
                  key={b.title}
                  className="border-0 cursor-default transition-all duration-200 hover:-translate-y-1"
                  style={{
                    borderRadius: "16px",
                    boxShadow: "0 4px 12px rgba(236,72,153,0.08)",
                    border: "1px solid var(--brand-border)",
                  }}
                >
                  <CardContent className="p-8 text-center space-y-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
                      style={{ background: "var(--brand-background)" }}
                    >
                      <b.icon className="w-7 h-7 text-brand-primary" />
                    </div>
                    <h3
                      className="font-heading text-xl font-semibold"
                      style={{ color: "var(--brand-text)" }}
                    >
                      {b.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{b.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Planos */}
        <section
          className="py-20 px-4"
          style={{ backgroundColor: "var(--brand-background)" }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2
                className="font-heading text-3xl sm:text-4xl font-semibold mb-4"
                style={{ color: "var(--brand-text)" }}
              >
                Escolha seu plano
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Planos flexíveis para todos os momentos. Assine e aproveite.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {/* Plano Essencial */}
              <Card
                className="border transition-all duration-200 hover:-translate-y-1"
                style={{
                  borderRadius: "16px",
                  borderColor: "var(--brand-border)",
                  boxShadow: "0 4px 12px rgba(236,72,153,0.08)",
                }}
              >
                <CardContent className="p-8 space-y-5">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">Essencial</p>
                    <div className="flex items-end gap-1">
                      <span className="font-heading text-4xl font-bold text-brand-text">R$ 89</span>
                      <span className="text-muted-foreground mb-1">/mês</span>
                    </div>
                  </div>
                  <Separator style={{ backgroundColor: "var(--brand-border)" }} />
                  <ul className="space-y-3 text-sm">
                    {["1 agendamento por mês", "Acesso ao feed de dicas", "Cancelamento a qualquer hora"].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-brand-primary shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link href="/cadastro" className="block">
                    <Button
                      variant="outline"
                      className="w-full rounded-xl h-11 font-semibold cursor-pointer transition-all duration-200 hover:bg-brand-primary hover:text-white"
                      style={{ borderColor: "var(--brand-primary)", color: "var(--brand-primary)" }}
                    >
                      Assinar plano
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Plano Completo (destaque) */}
              <Card
                className="border-0 relative transition-all duration-200 hover:-translate-y-1"
                style={{
                  borderRadius: "16px",
                  background: `linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-cta) 100%)`,
                  boxShadow: "0 8px 24px rgba(139,92,246,0.3)",
                }}
              >
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-amber-900"
                  style={{
                    background: "linear-gradient(135deg, #D4AF37, #F5E6A3)",
                  }}
                >
                  Mais popular
                </div>
                <CardContent className="p-8 space-y-5">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-white/70 mb-1">Completo</p>
                    <div className="flex items-end gap-1">
                      <span className="font-heading text-4xl font-bold text-white">R$ 159</span>
                      <span className="text-white/70 mb-1">/mês</span>
                    </div>
                  </div>
                  <Separator className="bg-white/20" />
                  <ul className="space-y-3 text-sm">
                    {["2 agendamentos por mês", "Prioridade na agenda", "Feed de dicas exclusivas", "Atendimento preferencial"].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-white">
                        <CheckCircle className="w-4 h-4 text-white/80 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link href="/cadastro" className="block">
                    <Button
                      className="w-full rounded-xl h-11 font-semibold cursor-pointer bg-white hover:bg-white/90 transition-all duration-200"
                      style={{ color: "var(--brand-primary)" }}
                    >
                      Assinar plano
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Plano VIP */}
              <Card
                className="border transition-all duration-200 hover:-translate-y-1"
                style={{
                  borderRadius: "16px",
                  borderColor: "var(--brand-border)",
                  boxShadow: "0 4px 12px rgba(236,72,153,0.08)",
                }}
              >
                <CardContent className="p-8 space-y-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">VIP</p>
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full text-amber-900"
                        style={{ background: "linear-gradient(135deg, #D4AF37, #F5E6A3)" }}
                      >
                        Premium
                      </span>
                    </div>
                    <div className="flex items-end gap-1">
                      <span className="font-heading text-4xl font-bold text-brand-text">R$ 249</span>
                      <span className="text-muted-foreground mb-1">/mês</span>
                    </div>
                  </div>
                  <Separator style={{ backgroundColor: "var(--brand-border)" }} />
                  <ul className="space-y-3 text-sm">
                    {["4 agendamentos por mês", "Horários exclusivos", "Feed VIP com tutoriais", "Suporte por WhatsApp"].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-brand-primary shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link href="/cadastro" className="block">
                    <Button
                      variant="outline"
                      className="w-full rounded-xl h-11 font-semibold cursor-pointer transition-all duration-200 hover:bg-brand-primary hover:text-white"
                      style={{ borderColor: "var(--brand-primary)", color: "var(--brand-primary)" }}
                    >
                      Assinar plano
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Depoimentos */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2
                className="font-heading text-3xl sm:text-4xl font-semibold mb-4"
                style={{ color: "var(--brand-text)" }}
              >
                O que dizem nossas clientes
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {depoimentos.map((d) => (
                <Card
                  key={d.nome}
                  className="border transition-all duration-200 hover:-translate-y-1"
                  style={{
                    borderRadius: "16px",
                    borderColor: "var(--brand-border)",
                    boxShadow: "0 4px 12px rgba(236,72,153,0.08)",
                  }}
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex gap-0.5">
                      {Array.from({ length: d.nota }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed italic">
                      &ldquo;{d.texto}&rdquo;
                    </p>
                    <div className="flex items-center gap-3 pt-2">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                        style={{ background: "var(--brand-primary)" }}
                      >
                        {d.nome[0]}
                      </div>
                      <span className="font-semibold text-sm" style={{ color: "var(--brand-text)" }}>
                        {d.nome}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section
          className="py-20 px-4"
          style={{ backgroundColor: "var(--brand-background)" }}
        >
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2
              className="font-heading text-3xl sm:text-4xl font-bold"
              style={{ color: "var(--brand-text)" }}
            >
              Pronta para entrar no clube?
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Junte-se a dezenas de clientes que já descobriram a facilidade de ter seu horário garantido todo mês.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Link href="/cadastro">
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-14 px-10 rounded-full font-semibold text-base cursor-pointer text-white transition-all duration-200 hover:-translate-y-1"
                  style={{
                    background: "var(--brand-cta)",
                    boxShadow: "0 6px 20px rgba(139,92,246,0.35)",
                  }}
                >
                  Começar agora
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        className="border-t py-8 px-4"
        style={{ borderColor: "var(--brand-border)", backgroundColor: "white" }}
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-heading text-lg font-bold text-brand-primary">
            {theme.brandName}
          </span>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-brand-primary transition-colors">Entrar</Link>
            <Link href="/cadastro" className="hover:text-brand-primary transition-colors">Cadastrar</Link>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {theme.brandName}. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
