import { MercadoPagoConfig, Payment, PreApproval, PreApprovalPlan } from "mercadopago"

// Singleton do cliente Mercado Pago.
// Usado para criar planos de assinatura recorrente (PreApprovalPlan),
// processar assinaturas (PreApproval) e consultar pagamentos (Payment).

// Lazy initialization — evita throw em build time quando a env var não está definida
function getMpClient(): MercadoPagoConfig {
  if (!process.env.MP_ACCESS_TOKEN) {
    throw new Error("MP_ACCESS_TOKEN não definido nas variáveis de ambiente")
  }
  return new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN,
    options: { timeout: 5000 },
  })
}

export const mpClient         = { get client()         { return getMpClient()                     } }
export const mpPayment        = { get resource()       { return new Payment(getMpClient())         } }
export const mpPreApproval    = { get resource()       { return new PreApproval(getMpClient())     } }
export const mpPreApprovalPlan = { get resource()      { return new PreApprovalPlan(getMpClient()) } }

// Valida a assinatura do webhook do Mercado Pago
// Ref: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
export function validateWebhookSignature(
  xSignature: string,
  xRequestId: string,
  dataId: string,
  secret: string,
): boolean {
  const crypto = require("crypto") as typeof import("crypto")
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${xSignature.split(",")[0]?.split("=")[1]};`
  const parts = xSignature.split(",")
  const tsPart = parts.find((p) => p.startsWith("ts="))
  const v1Part = parts.find((p) => p.startsWith("v1="))

  if (!tsPart || !v1Part) return false

  const ts = tsPart.replace("ts=", "")
  const v1 = v1Part.replace("v1=", "")
  const signedManifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`

  const hmac = crypto
    .createHmac("sha256", secret)
    .update(signedManifest)
    .digest("hex")

  return hmac === v1
}
