import type { Metadata } from "next"
import { Lora, Raleway } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { SessionProvider } from "@/components/shared/SessionProvider"
import { theme } from "@/lib/theme"
import "./globals.css"

// Fontes do design system
// Lora: fonte de display/heading (serifada, elegante)
// Raleway: fonte de corpo e UI (sans-serif, moderna)

const lora = Lora({
  variable:  "--font-heading",
  subsets:   ["latin"],
  display:   "swap",
  weight:    ["400", "500", "600", "700"],
})

const raleway = Raleway({
  variable: "--font-sans",
  subsets:  ["latin"],
  display:  "swap",
  weight:   ["300", "400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: {
    template: `%s | ${theme.brandName}`,
    default:  theme.brandName,
  },
  description: `Clube de fidelidade exclusivo — ${theme.brandName}`,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${lora.variable} ${raleway.variable} h-full antialiased`}
      style={
        {
          "--brand-primary":    theme.colors.primary,
          "--brand-secondary":  theme.colors.secondary,
          "--brand-cta":        theme.colors.cta,
          "--brand-background": theme.colors.background,
          "--brand-text":       theme.colors.text,
          "--brand-border":     theme.colors.border,
          "--brand-gold":       theme.colors.gold,
        } as React.CSSProperties
      }
    >
      <body className="min-h-full flex flex-col font-sans">
        <SessionProvider>
          {children}
          <Toaster richColors position="top-right" />
        </SessionProvider>
      </body>
    </html>
  )
}
