"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { useState } from "react"
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  CreditCard,
  FileText,
  LogOut,
  Menu,
  Scissors,
  Clock,
  ShoppingBag,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { theme } from "@/lib/theme"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const navItems = [
  { href: "/painel",           label: "Dashboard",  icon: LayoutDashboard },
  { href: "/painel/agenda",    label: "Agenda",     icon: CalendarDays },
  { href: "/painel/clientes",  label: "Clientes",   icon: Users },
  { href: "/painel/planos",    label: "Planos",     icon: CreditCard },
  { href: "/painel/servicos",  label: "Serviços",   icon: Scissors },
  { href: "/painel/horarios",  label: "Horários",   icon: Clock },
  { href: "/painel/catalogo",  label: "Catálogo",   icon: ShoppingBag },
  { href: "/painel/posts",     label: "Dicas",      icon: FileText },
]

function NavContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    await signOut({ redirect: false })
    router.push("/login")
    router.refresh()
  }

  return (
    <div className="flex flex-col h-full">
      <div
        className="px-6 py-5 border-b"
        style={{ borderColor: "#E5E7EB" }}
      >
        <span className="font-heading text-xl font-bold text-brand-primary">
          {theme.brandName}
        </span>
        <p className="text-xs text-muted-foreground mt-0.5">Painel Profissional</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer",
                isActive
                  ? "text-white"
                  : "text-slate-600 hover:bg-white hover:text-slate-900"
              )}
              style={isActive ? { background: "var(--brand-cta)" } : undefined}
            >
              <item.icon className="w-4.5 h-4.5 shrink-0" style={{ width: "18px", height: "18px" }} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t" style={{ borderColor: "#E5E7EB" }}>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 cursor-pointer w-full"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sair
        </button>
      </div>
    </div>
  )
}

export function PainelSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile header */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-white border-b flex items-center justify-between px-4"
        style={{ borderColor: "#E5E7EB" }}
      >
        <span className="font-heading text-lg font-bold text-brand-primary">{theme.brandName}</span>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            className="inline-flex items-center justify-center rounded-md w-9 h-9 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <NavContent onClose={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col fixed top-0 left-0 bottom-0 w-64 bg-white border-r z-30"
        style={{ borderColor: "#E5E7EB" }}
      >
        <NavContent />
      </aside>

      {/* Mobile top spacer */}
      <div className="lg:hidden h-14" />
    </>
  )
}
