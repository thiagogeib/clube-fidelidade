"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Calendar, CreditCard, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/area",        label: "Início",   icon: Home },
  { href: "/area/agendar", label: "Agendar",  icon: Calendar },
  { href: "/area/meu-plano", label: "Meu Plano", icon: CreditCard },
  { href: "/area/dicas",  label: "Dicas",    icon: BookOpen },
]

export function ClientBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t safe-area-pb"
      style={{ borderColor: "var(--brand-border)" }}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200 min-w-[56px]",
                isActive ? "text-brand-primary" : "text-muted-foreground"
              )}
            >
              <item.icon
                className="w-5 h-5"
                strokeWidth={isActive ? 2.5 : 1.5}
                style={isActive ? { color: "var(--brand-primary)" } : undefined}
              />
              <span
                className="text-[10px] font-medium"
                style={isActive ? { color: "var(--brand-primary)" } : undefined}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
