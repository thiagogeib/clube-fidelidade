import type { Metadata } from "next"
import { ClientHeader } from "@/components/client/ClientHeader"
import { ClientBottomNav } from "@/components/client/ClientBottomNav"

export const metadata: Metadata = {
  title: {
    template: "%s | Minha Área",
    default: "Minha Área",
  },
}

export default function AreaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="flex min-h-svh flex-col"
      style={{ backgroundColor: "var(--brand-background)" }}
    >
      <ClientHeader />
      <main className="flex-1 pb-20 lg:pb-0">
        {children}
      </main>
      <ClientBottomNav />
    </div>
  )
}
