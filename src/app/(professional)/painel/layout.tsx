import type { Metadata } from "next"
import { PainelSidebar } from "@/components/professional/PainelSidebar"

export const metadata: Metadata = {
  title: {
    template: "%s | Painel",
    default: "Painel",
  },
}

export default function PainelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh bg-[#F8F9FA]">
      <PainelSidebar />
      <main className="flex-1 overflow-auto lg:ml-64">
        {children}
      </main>
    </div>
  )
}
