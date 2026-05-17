"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"
import { Plus, FileText, Trash2, Eye, EyeOff } from "lucide-react"
import { z } from "zod"

const postFormSchema = z.object({
  title:       z.string().min(3, "Título deve ter ao menos 3 caracteres"),
  content:     z.string().min(10, "Conteúdo deve ter ao menos 10 caracteres"),
  imageUrl:    z.string().optional(),
  isPublished: z.boolean(),
})
type PostFormInput = z.infer<typeof postFormSchema>
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

type Post = {
  id: string
  title: string
  content: string
  imageUrl: string | null
  isPublished: boolean
  publishedAt: Date | null
  createdAt: Date
}

interface PostsManagerProps {
  initialPosts: Post[]
}

export function PostsManager({ initialPosts }: PostsManagerProps) {
  const [posts, setPosts] = useState(initialPosts)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<PostFormInput>({
    resolver: zodResolver(postFormSchema),
    defaultValues: { title: "", content: "", imageUrl: "", isPublished: false },
  })

  async function onSubmit(data: PostFormInput) {
    const payload = { ...data, imageUrl: data.imageUrl || undefined }
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const json = await res.json()
        toast.error(json.message || "Erro ao criar post")
        return
      }

      const { data: newPost } = await res.json()
      setPosts((prev) => [newPost, ...prev])
      toast.success(payload.isPublished ? "Post publicado!" : "Post salvo como rascunho")
      form.reset()
      setDialogOpen(false)
    } catch {
      toast.error("Erro ao criar post.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function togglePublish(post: Post) {
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !post.isPublished }),
      })
      if (!res.ok) throw new Error()
      const { data: updated } = await res.json()
      setPosts((prev) => prev.map((p) => (p.id === post.id ? updated : p)))
      toast.success(updated.isPublished ? "Post publicado!" : "Post despublicado")
    } catch {
      toast.error("Erro ao atualizar post")
    }
  }

  async function deletePost(id: string) {
    if (!confirm("Excluir este post permanentemente?")) return
    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setPosts((prev) => prev.filter((p) => p.id !== id))
      toast.success("Post excluído")
    } catch {
      toast.error("Erro ao excluir post")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            className="inline-flex items-center gap-2 rounded-xl h-10 px-5 font-semibold text-white cursor-pointer transition-all duration-200 hover:-translate-y-0.5 text-sm"
            style={{
              background: "var(--brand-cta)",
              boxShadow: "0 4px 12px rgba(139,92,246,0.25)",
            }}
          >
            <Plus className="w-4 h-4" />
            Nova dica
          </DialogTrigger>
          <DialogContent className="max-w-lg" style={{ borderRadius: "20px" }}>
            <DialogHeader>
              <DialogTitle className="font-heading text-xl">Criar nova dica</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Como hidratar o cabelo em casa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conteúdo</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Escreva sua dica aqui..."
                          rows={5}
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL da imagem (opcional)</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://..."
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isPublished"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="isPublished"
                          checked={field.value}
                          onChange={field.onChange}
                          className="w-4 h-4 rounded cursor-pointer accent-brand-primary"
                          style={{ accentColor: "var(--brand-cta)" }}
                        />
                        <FormLabel htmlFor="isPublished" className="cursor-pointer font-normal m-0">
                          Publicar imediatamente
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 cursor-pointer"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 font-semibold text-white cursor-pointer"
                    style={{ background: "var(--brand-cta)" }}
                  >
                    {isSubmitting ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {posts.length === 0 ? (
        <Card
          className="border-0"
          style={{ borderRadius: "16px", border: "1px solid #F1F5F9", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        >
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="font-semibold text-slate-600">Nenhum post ainda</p>
            <p className="text-sm text-muted-foreground mt-1">Crie dicas e conteúdo para suas clientes</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Card
              key={post.id}
              className="border-0"
              style={{ borderRadius: "12px", border: "1px solid #F1F5F9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
            >
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-800 line-clamp-1">{post.title}</p>
                      <Badge
                        className={`text-xs font-medium rounded-full border-0 shrink-0 ${
                          post.isPublished
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {post.isPublished ? "Publicado" : "Rascunho"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(post.createdAt), "dd MMM yyyy", { locale: ptBR })}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => togglePublish(post)}
                      className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      aria-label={post.isPublished ? "Despublicar" : "Publicar"}
                    >
                      {post.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => deletePost(post.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                      aria-label="Excluir post"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
