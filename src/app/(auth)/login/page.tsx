"use client"

import { Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import { toast } from "sonner"
import { Eye, EyeOff, LogIn } from "lucide-react"

import { loginSchema, type LoginInput } from "@/lib/validations/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

function LoginFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || ""
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(data: LoginInput) {
    setIsLoading(true)
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error("Email ou senha incorretos. Tente novamente.")
        return
      }

      toast.success("Bem-vinda de volta!")

      if (callbackUrl && callbackUrl !== "/login") {
        router.push(callbackUrl)
      } else {
        const sessionRes = await fetch("/api/auth/session")
        const session = await sessionRes.json()
        if (session?.user?.role === "PROFESSIONAL") {
          router.push("/painel")
        } else {
          router.push("/area")
        }
      }
      router.refresh()
    } catch {
      toast.error("Erro ao fazer login. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card
      className="w-full max-w-md border-0"
      style={{
        borderRadius: "20px",
        boxShadow: "0 8px 24px rgba(236,72,153,0.12)",
      }}
    >
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="font-heading text-2xl font-semibold text-center text-brand-text">
          Entrar na sua conta
        </CardTitle>
        <CardDescription className="text-center text-sm text-muted-foreground">
          Digite seu email e senha para continuar
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-brand-text">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      autoComplete="email"
                      disabled={isLoading}
                      className="h-12 rounded-[10px] border-brand focus-visible:ring-brand-primary/30"
                      style={{ borderColor: "var(--brand-border)" }}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-brand-text">Senha</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        disabled={isLoading}
                        className="h-12 rounded-[10px] pr-10 border-brand focus-visible:ring-brand-primary/30"
                        style={{ borderColor: "var(--brand-border)" }}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand-primary transition-colors cursor-pointer"
                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-[12px] font-semibold text-base transition-all duration-200 cursor-pointer"
              style={{
                background: "var(--brand-cta)",
                boxShadow: "0 4px 12px rgba(139,92,246,0.3)",
              }}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Entrando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Entrar
                </span>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 pt-4">
        <p className="text-sm text-muted-foreground text-center">
          Ainda não tem uma conta?{" "}
          <Link
            href="/cadastro"
            className="font-semibold text-brand-primary hover:underline transition-colors"
          >
            Cadastre-se aqui
          </Link>
        </p>
        <p className="text-xs text-muted-foreground text-center">
          É profissional?{" "}
          <span className="text-muted-foreground">
            Entre em contato para receber seu acesso.
          </span>
        </p>
      </CardFooter>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          className="w-full max-w-md border-0 flex items-center justify-center h-64"
          style={{ borderRadius: "20px", boxShadow: "0 8px 24px rgba(236,72,153,0.12)" }}
        >
          <span className="w-6 h-6 border-2 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  )
}
