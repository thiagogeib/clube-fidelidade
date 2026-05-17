import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { validateWebhookSignature } from "@/lib/mercadopago"

// POST /api/webhooks/mercadopago
// Rota pública — valida assinatura HMAC antes de processar.
// Ref: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks

export async function POST(req: Request) {
  const xSignature  = req.headers.get("x-signature")  ?? ""
  const xRequestId  = req.headers.get("x-request-id") ?? ""

  const body = await req.json() as {
    type:   string
    action: string
    data:   { id: string }
  }

  const webhookSecret = process.env.MP_WEBHOOK_SECRET ?? ""

  // Validar assinatura do webhook
  if (webhookSecret && xSignature) {
    const isValid = validateWebhookSignature(
      xSignature,
      xRequestId,
      body.data.id,
      webhookSecret,
    )

    if (!isValid) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Assinatura do webhook inválida" },
        { status: 401 },
      )
    }
  }

  // Processar eventos de assinatura (preapproval)
  if (body.type === "subscription_preapproval") {
    await handlePreapprovalEvent(body.action, body.data.id)
  }

  // Processar eventos de pagamento
  if (body.type === "payment") {
    await handlePaymentEvent(body.data.id)
  }

  // Responder 200 imediatamente para o MP não retentar
  return NextResponse.json({ received: true })
}

async function handlePreapprovalEvent(action: string, mpSubscriptionId: string) {
  const subscription = await db.subscription.findFirst({
    where: { mpSubscriptionId },
  })

  if (!subscription) return

  const statusMap: Record<string, string> = {
    "updated":   "ACTIVE",
    "cancelled": "CANCELLED",
    "paused":    "PAUSED",
  }

  const newStatus = statusMap[action]
  if (!newStatus) return

  await db.subscription.update({
    where: { id: subscription.id },
    data:  { status: newStatus as never },
  })
}

async function handlePaymentEvent(_paymentId: string) {
  // Implementação completa: payments-agent
  // Consultar pagamento no MP e atualizar status da assinatura se necessário
}
