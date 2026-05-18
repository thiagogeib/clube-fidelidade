import { Resend } from "resend"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM   = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev"
const BRAND  = process.env.NEXT_PUBLIC_BRAND_NAME ?? "Clube Fidelidade"
const URL    = process.env.NEXTAUTH_URL ?? "https://clube-fidelidade-phi.vercel.app"

const PRIMARY = process.env.NEXT_PUBLIC_COLOR_PRIMARY   ?? "#EC4899"
const CTA     = process.env.NEXT_PUBLIC_COLOR_CTA       ?? "#8B5CF6"
const BG      = process.env.NEXT_PUBLIC_COLOR_BACKGROUND ?? "#FDF2F8"
const TEXT    = process.env.NEXT_PUBLIC_COLOR_TEXT       ?? "#831843"

function base(content: string) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F8F9FA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:white;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
        <!-- Header -->
        <tr><td style="background:${BG};padding:28px 32px;border-bottom:1px solid ${PRIMARY}22;">
          <p style="margin:0;font-size:22px;font-weight:700;color:${TEXT};">${BRAND}</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:32px;">
          ${content}
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:20px 32px;background:#F8F9FA;border-top:1px solid #E5E7EB;text-align:center;">
          <p style="margin:0;font-size:12px;color:#94A3B8;">
            Você recebeu este email porque é cliente de <strong>${BRAND}</strong>.<br>
            <a href="${URL}" style="color:${PRIMARY};">Acessar minha conta</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function btn(text: string, href: string) {
  return `<a href="${href}" style="display:inline-block;margin-top:20px;padding:12px 28px;background:${CTA};color:white;border-radius:12px;text-decoration:none;font-weight:600;font-size:14px;">${text}</a>`
}

function infoRow(label: string, value: string) {
  return `<tr>
    <td style="padding:6px 0;font-size:13px;color:#64748B;">${label}</td>
    <td style="padding:6px 0;font-size:13px;font-weight:600;color:${TEXT};text-align:right;">${value}</td>
  </tr>`
}

async function send(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) return
  try {
    await resend.emails.send({ from: `${BRAND} <${FROM}>`, to, subject, html })
  } catch (err) {
    console.error("[email] send error:", err)
  }
}

// ─── Templates ───────────────────────────────────────────────

export async function sendAppointmentCreated(params: {
  to: string
  clientName: string
  scheduledAt: Date
  serviceType?: string | null
  durationMinutes?: number
}) {
  const dateStr = format(params.scheduledAt, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  const hourStr = format(params.scheduledAt, "HH:mm")
  const isFlexible = hourStr === "00:00"

  const html = base(`
    <h2 style="margin:0 0 8px;font-size:20px;color:${TEXT};">Agendamento recebido!</h2>
    <p style="margin:0 0 24px;color:#64748B;font-size:14px;">
      Olá, <strong>${params.clientName}</strong>! Seu agendamento foi registrado e está aguardando confirmação.
    </p>
    <table width="100%" style="background:${BG};border-radius:12px;padding:16px;border-collapse:collapse;">
      ${params.serviceType ? infoRow("Serviço", params.serviceType) : ""}
      ${infoRow("Data", dateStr)}
      ${infoRow("Horário", isFlexible ? "A combinar no dia" : hourStr)}
      ${params.durationMinutes && !isFlexible ? infoRow("Duração estimada", params.durationMinutes < 60 ? `${params.durationMinutes}min` : `${Math.floor(params.durationMinutes/60)}h${params.durationMinutes%60 ? params.durationMinutes%60+"min" : ""}`) : ""}
    </table>
    <p style="margin:16px 0 0;font-size:13px;color:#94A3B8;">
      Você receberá outro email assim que a profissional confirmar o horário.
    </p>
    ${btn("Ver meus agendamentos", `${URL}/area/agendar`)}
  `)

  await send(params.to, `Agendamento recebido — ${BRAND}`, html)
}

export async function sendAppointmentConfirmed(params: {
  to: string
  clientName: string
  scheduledAt: Date
  serviceType?: string | null
}) {
  const dateStr = format(params.scheduledAt, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  const hourStr = format(params.scheduledAt, "HH:mm")
  const isFlexible = hourStr === "00:00"

  const html = base(`
    <h2 style="margin:0 0 8px;font-size:20px;color:${TEXT};">Horário confirmado!</h2>
    <p style="margin:0 0 24px;color:#64748B;font-size:14px;">
      Olá, <strong>${params.clientName}</strong>! Sua profissional confirmou o seu horário.
    </p>
    <table width="100%" style="background:${BG};border-radius:12px;padding:16px;border-collapse:collapse;">
      ${params.serviceType ? infoRow("Serviço", params.serviceType) : ""}
      ${infoRow("Data", dateStr)}
      ${infoRow("Horário", isFlexible ? "A combinar no dia" : hourStr)}
      ${infoRow("Status", "✅ Confirmado")}
    </table>
    <p style="margin:16px 0 0;font-size:13px;color:#94A3B8;">
      Lembre-se de chegar com alguns minutos de antecedência.
    </p>
    ${btn("Ver meus agendamentos", `${URL}/area/agendar`)}
  `)

  await send(params.to, `Horário confirmado — ${BRAND}`, html)
}

export async function sendAppointmentCancelled(params: {
  to: string
  clientName: string
  scheduledAt: Date
  serviceType?: string | null
  cancelReason?: string | null
  cancelledBy: "professional" | "client"
}) {
  const dateStr = format(params.scheduledAt, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  const hourStr = format(params.scheduledAt, "HH:mm")

  const html = base(`
    <h2 style="margin:0 0 8px;font-size:20px;color:${TEXT};">Agendamento cancelado</h2>
    <p style="margin:0 0 24px;color:#64748B;font-size:14px;">
      Olá, <strong>${params.clientName}</strong>!
      ${params.cancelledBy === "professional"
        ? "Sua profissional precisou cancelar o agendamento abaixo."
        : "Seu agendamento foi cancelado conforme solicitado."}
    </p>
    <table width="100%" style="background:#FEF2F2;border-radius:12px;padding:16px;border-collapse:collapse;border:1px solid #FECACA;">
      ${params.serviceType ? infoRow("Serviço", params.serviceType) : ""}
      ${infoRow("Data", dateStr)}
      ${infoRow("Horário", hourStr === "00:00" ? "A combinar no dia" : hourStr)}
      ${infoRow("Status", "❌ Cancelado")}
      ${params.cancelReason ? infoRow("Motivo", params.cancelReason) : ""}
    </table>
    <p style="margin:16px 0 0;font-size:13px;color:#94A3B8;">
      Você pode fazer um novo agendamento quando quiser.
    </p>
    ${btn("Fazer novo agendamento", `${URL}/area/agendar`)}
  `)

  await send(params.to, `Agendamento cancelado — ${BRAND}`, html)
}

export async function sendNewPost(params: {
  to: string
  clientName: string
  postTitle: string
  postId: string
}) {
  const html = base(`
    <h2 style="margin:0 0 8px;font-size:20px;color:${TEXT};">Nova dica publicada!</h2>
    <p style="margin:0 0 24px;color:#64748B;font-size:14px;">
      Olá, <strong>${params.clientName}</strong>! Sua profissional publicou uma nova dica exclusiva para você.
    </p>
    <div style="background:${BG};border-radius:12px;padding:20px;border-left:4px solid ${PRIMARY};">
      <p style="margin:0;font-size:16px;font-weight:700;color:${TEXT};">${params.postTitle}</p>
      <p style="margin:8px 0 0;font-size:13px;color:#64748B;">Conteúdo exclusivo para assinantes</p>
    </div>
    ${btn("Ler dica completa", `${URL}/area/dicas`)}
  `)

  await send(params.to, `Nova dica: ${params.postTitle} — ${BRAND}`, html)
}

export async function sendSubscriptionReminder(params: {
  to: string
  clientName: string
  daysLeft: number
  endDate: Date
  planName: string
}) {
  const dateStr = format(params.endDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })

  const html = base(`
    <h2 style="margin:0 0 8px;font-size:20px;color:${TEXT};">Sua assinatura vence em breve</h2>
    <p style="margin:0 0 24px;color:#64748B;font-size:14px;">
      Olá, <strong>${params.clientName}</strong>! Sua assinatura <strong>${params.planName}</strong> vence em
      <strong>${params.daysLeft} dia${params.daysLeft > 1 ? "s" : ""}</strong>.
    </p>
    <table width="100%" style="background:${BG};border-radius:12px;padding:16px;border-collapse:collapse;">
      ${infoRow("Plano", params.planName)}
      ${infoRow("Vencimento", dateStr)}
      ${infoRow("Dias restantes", String(params.daysLeft))}
    </table>
    <p style="margin:16px 0 0;font-size:13px;color:#94A3B8;">
      Entre em contato com sua profissional para renovar.
    </p>
    ${btn("Acessar minha conta", `${URL}/area/meu-plano`)}
  `)

  await send(params.to, `Assinatura vence em ${params.daysLeft} dia${params.daysLeft > 1 ? "s" : ""} — ${BRAND}`, html)
}
