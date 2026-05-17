// Tokens de tema lidos das variáveis de ambiente.
// Suporta dual branding: "cabeleireira" (rosa/lavanda) e "trancista" (terracota/roxo).
// As variáveis NEXT_PUBLIC_* são injetadas em build time pelo Next.js.

export const theme = {
  brandName: process.env.NEXT_PUBLIC_BRAND_NAME || "Studio",
  brandTheme: process.env.NEXT_PUBLIC_BRAND_THEME || "cabeleireira",
  colors: {
    primary:    process.env.NEXT_PUBLIC_COLOR_PRIMARY    || "#EC4899",
    secondary:  process.env.NEXT_PUBLIC_COLOR_SECONDARY  || "#F9A8D4",
    cta:        process.env.NEXT_PUBLIC_COLOR_CTA        || "#8B5CF6",
    background: process.env.NEXT_PUBLIC_COLOR_BACKGROUND || "#FDF2F8",
    text:       process.env.NEXT_PUBLIC_COLOR_TEXT       || "#831843",
    border:     process.env.NEXT_PUBLIC_COLOR_BORDER     || "#FBCFE8",
    gold:       "#D4AF37", // cor fixa de destaque premium (usada em badges de plano)
  },
} as const

export type BrandTheme = "cabeleireira" | "trancista"

// Helper para verificar o tema ativo em Server Components
export function isCabeleireira(): boolean {
  return theme.brandTheme === "cabeleireira"
}

export function isTrancista(): boolean {
  return theme.brandTheme === "trancista"
}
