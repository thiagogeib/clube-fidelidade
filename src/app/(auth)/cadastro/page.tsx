"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import { toast } from "sonner"
import { Eye, EyeOff, UserPlus } from "lucide-react"

import { cadastroClienteSchema, type CadastroClienteInput } from "@/lib/validations/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

export default function CadastroPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<CadastroClienteInput>({
    resolver: zodResolver(cadastroClienteSchema),
    defaultValues: { name: "", email: "", phone: "", password: "", confirmPassword: "" },
  })

  async function onSubmit(data: CadastroClienteInput) {
    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone || undefined,
          password: data.password,
          role: "CLIENT",
        }),
      })

      if (!res.ok) {
        const json = await res.json()
        if (res.status === 409) {
          form.setError("email", { message: "Este email já está cadastrado" })
        } else {
          toast.error(json.message || "Erro ao criar conta. Tente novamente.")
        }
        return
      }

      const loginResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (loginResult?.error) {
        toast.success("Conta criada! Faça login para continuar.")
        router.push("/login")
        return
      }

      toast.success("Bem-vinda ao clube! Sua conta foi criada com sucesso.")
      router.push("/area")
      router.refresh()
    } catch {
      toast.error("Erro ao criar conta. Tente novamente.")
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
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="font-heading text-2xl font-semibold text-center text-brand-text">
          Criar sua conta
        </CardTitle>
        <CardDescription className="text-center text-sm text-muted-foreground">
          Junte-se ao clube e comece a agendar
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-brand-text">Nome completo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Seu nome"
                      autoComplete="name"
                      disabled={isLoading}
                      className="h-11 rounded-[10px]"
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
                      className="h-11 rounded-[10px]"
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
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-brand-text">
                    Telefone <span className="text-muted-foreground font-normal">(opcional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="(11) 99999-9999"
                      autoComplete="tel"
                      disabled={isLoading}
                      className="h-11 rounded-[10px]"
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
                        placeholder="Mínimo 6 caracteres"
                        autoComplete="new-password"
                        disabled={isLoading}
                        className="h-11 rounded-[10px] pr-10"
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

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-brand-text">Confirmar senha</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirm ? "text" : "password"}
                        placeholder="Digite a senha novamente"
                        autoComplete="new-password"
                        disabled={isLoading}
                        className="h-11 rounded-[10px] pr-10"
                        style={{ borderColor: "var(--brand-border)" }}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand-primary transition-colors cursor-pointer"
                        aria-label={showConfirm ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
              className="w-full h-12 rounded-[12px] font-semibold text-base transition-all duration-200 cursor-pointer mt-2"
              style={{
                background: "var(--brand-cta)",
                boxShadow: "0 4px 12px rgba(139,92,246,0.3)",
              }}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Criando conta...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Criar conta
                </span>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="pt-4">
        <p className="text-sm text-muted-foreground text-center w-full">
          Já tem uma conta?{" "}
          <Link
            href="/login"
            className="font-semibold text-brand-primary hover:underline transition-colors"
          >
            Entrar
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
