import { z } from "zod"

export const createPostSchema = z.object({
  title:       z.string().min(3, "Título deve ter ao menos 3 caracteres"),
  content:     z.string().min(10, "Conteúdo deve ter ao menos 10 caracteres"),
  imageUrl:    z.string().transform((v) => v === "" ? undefined : v).pipe(z.string().url("URL de imagem inválida").optional()),
  isPublished: z.boolean().default(false),
})

export const updatePostSchema = createPostSchema.partial()

export type CreatePostInput = z.infer<typeof createPostSchema>
export type UpdatePostInput = z.infer<typeof updatePostSchema>
