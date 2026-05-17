"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { LogOut, User, ChevronDown } from "lucide-react"
import { theme } from "@/lib/theme"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ClientHeader() {
  const { data: session } = useSession()
  const router = useRouter()

  const initials = session?.user?.name
    ? session.user.name.split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase()
    : "?"

  async function handleSignOut() {
    await signOut({ redirect: false })
    router.push("/login")
    router.refresh()
  }

  return (
    <header
      className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b"
      style={{ borderColor: "var(--brand-border)" }}
    >
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/area"
          className="font-heading text-xl font-bold text-brand-primary hover:opacity-80 transition-opacity"
        >
          {theme.brandName}
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity outline-none">
            <Avatar className="w-8 h-8">
              <AvatarImage src={session?.user?.image ?? undefined} />
              <AvatarFallback
                className="text-xs font-semibold text-white"
                style={{ background: "var(--brand-primary)" }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48" style={{ borderRadius: "12px" }}>
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-slate-800 truncate">{session?.user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
