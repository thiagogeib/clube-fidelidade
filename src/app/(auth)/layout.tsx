import { theme } from "@/lib/theme"
import Link from "next/link"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="min-h-svh flex flex-col"
      style={{ backgroundColor: "var(--brand-background)" }}
    >
      <header className="py-6 px-6 flex justify-center">
        <Link href="/" className="font-heading text-2xl font-bold text-brand-primary hover:opacity-80 transition-opacity">
          {theme.brandName}
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        {children}
      </main>
      <footer className="py-4 text-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} {theme.brandName}. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  )
}
