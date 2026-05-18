import { db } from "@/lib/db"
import { sendSubscriptionReminder } from "@/lib/email"
import { addDays, startOfDay, endOfDay } from "date-fns"

// Chamado pelo Vercel Cron diariamente às 10h
// Envia lembrete para assinaturas que vencem em 3 ou 7 dias
export async function GET(req: Request) {
  const secret = req.headers.get("x-cron-secret")
  if (secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const today = new Date()
  const remindDays = [3, 7]
  let sent = 0

  for (const days of remindDays) {
    const targetDate = addDays(today, days)
    const subscriptions = await db.subscription.findMany({
      where: {
        status: "ACTIVE",
        endDate: {
          gte: startOfDay(targetDate),
          lte: endOfDay(targetDate),
        },
      },
      include: {
        client: { select: { name: true, email: true } },
        plan:   { select: { name: true } },
      },
    })

    for (const sub of subscriptions) {
      if (sub.client?.email && sub.endDate) {
        await sendSubscriptionReminder({
          to:        sub.client.email,
          clientName: sub.client.name ?? "Cliente",
          daysLeft:  days,
          endDate:   sub.endDate,
          planName:  sub.plan.name,
        })
        sent++
      }
    }
  }

  return Response.json({ ok: true, sent })
}
