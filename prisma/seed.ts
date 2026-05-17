import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"
import { addDays, addHours, subDays, setHours, setMinutes, startOfDay } from "date-fns"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const db = new PrismaClient({ adapter })

async function main() {
  console.log("🌱 Limpando banco...")
  await db.appointment.deleteMany()
  await db.post.deleteMany()
  await db.subscription.deleteMany()
  await db.plan.deleteMany()
  await db.session.deleteMany()
  await db.account.deleteMany()
  await db.user.deleteMany()

  console.log("👩‍💼 Criando profissional...")
  const hash = await bcrypt.hash("demo123", 10)

  const profissional = await db.user.create({
    data: {
      name: "Ana Silva",
      email: "ana@studiosilva.com",
      passwordHash: hash,
      role: "PROFESSIONAL",
      phone: "(11) 98765-4321",
    },
  })

  console.log("👩 Criando clientes...")
  const [maria, joana, camila, beatriz] = await Promise.all([
    db.user.create({
      data: {
        name: "Maria Santos",
        email: "maria@email.com",
        passwordHash: hash,
        role: "CLIENT",
        phone: "(11) 91234-5678",
      },
    }),
    db.user.create({
      data: {
        name: "Joana Costa",
        email: "joana@email.com",
        passwordHash: hash,
        role: "CLIENT",
        phone: "(11) 92345-6789",
      },
    }),
    db.user.create({
      data: {
        name: "Camila Lima",
        email: "camila@email.com",
        passwordHash: hash,
        role: "CLIENT",
        phone: "(11) 93456-7890",
      },
    }),
    db.user.create({
      data: {
        name: "Beatriz Souza",
        email: "beatriz@email.com",
        passwordHash: hash,
        role: "CLIENT",
        phone: "(11) 94567-8901",
      },
    }),
  ])

  console.log("📋 Criando planos...")
  const [planBasico, planPremium, planVip] = await Promise.all([
    db.plan.create({
      data: {
        professionalId: profissional.id,
        name: "Básico",
        description: "Ideal para manutenção mensal. Inclui escova e hidratação.",
        priceInCents: 8900,
        appointmentsPerMonth: 2,
        durationDays: 30,
        isActive: true,
      },
    }),
    db.plan.create({
      data: {
        professionalId: profissional.id,
        name: "Premium",
        description: "Mais visitas, mais cuidado. Escova, corte e tratamentos especiais.",
        priceInCents: 14900,
        appointmentsPerMonth: 4,
        durationDays: 30,
        isActive: true,
      },
    }),
    db.plan.create({
      data: {
        professionalId: profissional.id,
        name: "VIP",
        description: "Acesso ilimitado ao studio. Todos os serviços incluídos.",
        priceInCents: 22900,
        appointmentsPerMonth: 8,
        durationDays: 30,
        isActive: true,
      },
    }),
  ])

  console.log("💳 Criando assinaturas...")
  const hoje = new Date()

  const [subMaria, subJoana, subCamila] = await Promise.all([
    db.subscription.create({
      data: {
        clientId: maria.id,
        planId: planPremium.id,
        status: "ACTIVE",
        startDate: subDays(hoje, 15),
        endDate: addDays(hoje, 15),
        nextBillingDate: addDays(hoje, 15),
        appointmentsUsed: 2,
      },
    }),
    db.subscription.create({
      data: {
        clientId: joana.id,
        planId: planBasico.id,
        status: "ACTIVE",
        startDate: subDays(hoje, 5),
        endDate: addDays(hoje, 25),
        nextBillingDate: addDays(hoje, 25),
        appointmentsUsed: 1,
      },
    }),
    db.subscription.create({
      data: {
        clientId: camila.id,
        planId: planVip.id,
        status: "ACTIVE",
        startDate: subDays(hoje, 20),
        endDate: addDays(hoje, 10),
        nextBillingDate: addDays(hoje, 10),
        appointmentsUsed: 5,
      },
    }),
  ])

  // Beatriz com assinatura pendente (ainda não pagou)
  await db.subscription.create({
    data: {
      clientId: beatriz.id,
      planId: planBasico.id,
      status: "PENDING",
      appointmentsUsed: 0,
    },
  })

  console.log("📅 Criando agendamentos...")

  function slot(daysFromNow: number, hour: number, minute = 0) {
    const d = startOfDay(addDays(hoje, daysFromNow))
    return setMinutes(setHours(d, hour), minute)
  }

  await Promise.all([
    // Agendamentos passados — concluídos
    db.appointment.create({
      data: {
        clientId: maria.id,
        professionalId: profissional.id,
        subscriptionId: subMaria.id,
        scheduledAt: slot(-14, 10),
        durationMinutes: 90,
        status: "COMPLETED",
        serviceType: "Escova progressiva",
      },
    }),
    db.appointment.create({
      data: {
        clientId: joana.id,
        professionalId: profissional.id,
        subscriptionId: subJoana.id,
        scheduledAt: slot(-7, 14),
        durationMinutes: 60,
        status: "COMPLETED",
        serviceType: "Corte + escova",
      },
    }),
    db.appointment.create({
      data: {
        clientId: camila.id,
        professionalId: profissional.id,
        subscriptionId: subCamila.id,
        scheduledAt: slot(-10, 9),
        durationMinutes: 120,
        status: "COMPLETED",
        serviceType: "Coloração",
      },
    }),
    db.appointment.create({
      data: {
        clientId: maria.id,
        professionalId: profissional.id,
        subscriptionId: subMaria.id,
        scheduledAt: slot(-3, 11),
        durationMinutes: 60,
        status: "COMPLETED",
        serviceType: "Hidratação",
      },
    }),

    // Hoje
    db.appointment.create({
      data: {
        clientId: camila.id,
        professionalId: profissional.id,
        subscriptionId: subCamila.id,
        scheduledAt: slot(0, 10, 30),
        durationMinutes: 90,
        status: "CONFIRMED",
        serviceType: "Escova + brilho",
        notes: "Cliente prefere produto sem amônia",
      },
    }),
    db.appointment.create({
      data: {
        clientId: joana.id,
        professionalId: profissional.id,
        subscriptionId: subJoana.id,
        scheduledAt: slot(0, 15),
        durationMinutes: 60,
        status: "CONFIRMED",
        serviceType: "Corte",
      },
    }),

    // Próximos dias
    db.appointment.create({
      data: {
        clientId: maria.id,
        professionalId: profissional.id,
        subscriptionId: subMaria.id,
        scheduledAt: slot(2, 9),
        durationMinutes: 90,
        status: "PENDING",
        serviceType: "Escova progressiva",
      },
    }),
    db.appointment.create({
      data: {
        clientId: camila.id,
        professionalId: profissional.id,
        subscriptionId: subCamila.id,
        scheduledAt: slot(3, 14),
        durationMinutes: 120,
        status: "PENDING",
        serviceType: "Tintura + hidratação",
        notes: "Tom: castanho acobreado",
      },
    }),
    db.appointment.create({
      data: {
        clientId: joana.id,
        professionalId: profissional.id,
        subscriptionId: subJoana.id,
        scheduledAt: slot(5, 11),
        durationMinutes: 60,
        status: "PENDING",
        serviceType: "Hidratação profunda",
      },
    }),
    db.appointment.create({
      data: {
        clientId: maria.id,
        professionalId: profissional.id,
        subscriptionId: subMaria.id,
        scheduledAt: slot(7, 10),
        durationMinutes: 90,
        status: "PENDING",
        serviceType: "Corte + escova",
      },
    }),

    // Cancelado
    db.appointment.create({
      data: {
        clientId: camila.id,
        professionalId: profissional.id,
        subscriptionId: subCamila.id,
        scheduledAt: slot(-2, 13),
        durationMinutes: 60,
        status: "CANCELLED",
        serviceType: "Escova",
        cancelledAt: subDays(hoje, 3),
        cancelReason: "Cliente desmarcou por compromisso",
      },
    }),
  ])

  console.log("📝 Criando posts...")
  await Promise.all([
    db.post.create({
      data: {
        professionalId: profissional.id,
        title: "5 erros que danificam seu cabelo sem você perceber",
        content: `Olá, meninas! Hoje vou falar sobre os erros mais comuns que a gente comete no dia a dia e que podem estar destruindo a saúde do seu cabelo.

**1. Escovar o cabelo molhado**
Quando o cabelo está úmido, ele fica até 3x mais frágil. Use um pente de dentes largos e comece sempre pelas pontas.

**2. Secar com a toalha de forma agressiva**
Aquele movimento de vai e vem cria frizz e quebra os fios. O certo é envolver o cabelo na toalha e pressionar suavemente.

**3. Usar água quente demais no banho**
A água quente remove a oleosidade natural do couro cabeludo, deixando o cabelo seco e opaco. Prefira água morna.

**4. Dormir com o cabelo preso com elástico**
O elástico cria pressão nos fios durante horas. Use uma trança leve ou um grampo de dormir.

**5. Pular a proteção térmica**
Antes de usar chapinha ou babyliss, SEMPRE aplique protetor térmico. Essa etapa salva seus fios!

Gostou das dicas? Me chama no direct para saber mais! 💕`,
        isPublished: true,
        publishedAt: subDays(hoje, 5),
      },
    }),
    db.post.create({
      data: {
        professionalId: profissional.id,
        title: "Hidratação em casa: receita de máscara de abacate",
        content: `Meninas, vou compartilhar uma receita maravilhosa de máscara hidratante que eu mesma uso! 🥑

**Ingredientes:**
- 1 abacate maduro
- 2 colheres de sopa de azeite de oliva
- 1 colher de mel
- 1 ovo (só a gema)

**Modo de preparo:**
1. Amasse bem o abacate até virar uma pasta
2. Misture os demais ingredientes até ficar homogêneo
3. Aplique no cabelo úmido, do meio às pontas
4. Deixe agir por 30 minutos com uma touca
5. Lave com shampoo suave

Essa máscara repõe proteínas, hidrata e dá um brilho incrível! Faça uma vez por semana e me conta o resultado! ✨`,
        isPublished: true,
        publishedAt: subDays(hoje, 12),
      },
    }),
    db.post.create({
      data: {
        professionalId: profissional.id,
        title: "Por que seu cabelo está quebrando? Entenda o diagnóstico capilar",
        content: `Você trata o cabelo mas ele continua quebrando? O problema pode estar no diagnóstico!

Existem três tipos de porosidade capilar: baixa, média e alta. Cada uma pede um tratamento completamente diferente.

**Porosidade baixa** — cutícula muito fechada, produto não entra. Precisa de calor para abrir as cutículas e absorver o ativo.

**Porosidade média** — equilíbrio ideal. Responde bem à maioria dos tratamentos.

**Porosidade alta** — cutícula muito aberta (danificada por química ou calor). Perde nutrientes rápido. Precisa de proteínas e reconstrução.

**Teste rápido:** pegue um fio de cabelo limpo e coloque num copo com água. Se afundar rápido = alta porosidade. Se ficar flutuando = baixa porosidade. No meio = média.

Antes de comprar qualquer produto, faça esse teste! Assim você investe no que realmente vai funcionar para o SEU cabelo. 😊

Dúvidas? Me manda mensagem!`,
        isPublished: true,
        publishedAt: subDays(hoje, 20),
      },
    }),
    db.post.create({
      data: {
        professionalId: profissional.id,
        title: "Novidade no studio: cronograma capilar personalizado!",
        content: `Boa notícia para todas as clientes do plano Premium e VIP! 🎉

A partir deste mês, estou oferecendo cronograma capilar personalizado para todas vocês. O que isso significa?

Na sua próxima visita, vou fazer uma análise completa do seu cabelo e montar um cronograma específico para as suas necessidades — com a sequência certa de hidratação, nutrição e reconstrução.

Cada cabelo é único e merece um cuidado único! Agende seu horário e venha descobrir o que o seu cabelo realmente precisa. 💆‍♀️`,
        isPublished: false,
      },
    }),
  ])

  console.log("\n✅ Seed concluído!")
  console.log("\n─────────────────────────────────")
  console.log("🔐 CREDENCIAIS DE DEMO")
  console.log("─────────────────────────────────")
  console.log("Profissional: ana@studiosilva.com")
  console.log("Clientes:     maria@email.com")
  console.log("              joana@email.com")
  console.log("              camila@email.com")
  console.log("              beatriz@email.com")
  console.log("Senha (todos): demo123")
  console.log("─────────────────────────────────")
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
