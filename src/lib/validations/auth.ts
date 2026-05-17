import { z } from "zod"

export const loginSchema = z.object({
  email:    z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
})

export const cadastroClienteSchema = z.object({
  name:            z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  email:           z.string().email("Email inválido"),
  phone:           z.string().optional(),
  password:        z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
})

export const cadastroProfissionalSchema = z.object({
  name:            z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  email:           z.string().email("Email inválido"),
  phone:           z.string().optional(),
  password:        z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
})

export type LoginInput           = z.infer<typeof loginSchema>
export type CadastroClienteInput = z.infer<typeof cadastroClienteSchema>
export type CadastroProfissionalInput = z.infer<typeof cadastroProfissionalSchema>
