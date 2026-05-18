"use client"

import { useCallback, useState } from "react"
import { toast } from "sonner"
import { Plus, ShoppingBag, Trash2, Pencil, ImagePlus, X, Loader2 } from "lucide-react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

type Product = {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  priceInCents: number | null
  category: string | null
  isActive: boolean
  order: number
}

const productSchema = z.object({
  name:         z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  description:  z.string().optional(),
  imageUrl:     z.string().optional(),
  priceInCents: z.number().int().min(0).optional(),
  category:     z.string().optional(),
})
type ProductInput = z.infer<typeof productSchema>

const CATEGORIES = ["Serviços", "Produtos", "Portfólio", "Promoções", "Outros"]

function formatPrice(cents: number | null) {
  if (!cents) return null
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100)
}

function compressImage(file: File, maxWidth = 1280, quality = 0.85): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width)
      const canvas = document.createElement("canvas")
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(objectUrl)
        resolve(new File([blob!], file.name, { type: "image/jpeg" }))
      }, "image/jpeg", quality)
    }
    img.src = objectUrl
  })
}

function ProductForm({
  onSave,
  onCancel,
  defaultValues,
}: {
  onSave: (data: ProductInput) => Promise<void>
  onCancel: () => void
  defaultValues?: Partial<ProductInput>
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(defaultValues?.imageUrl ?? null)
  const [isUploading, setIsUploading] = useState(false)

  const form = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: "", description: "", category: "", ...defaultValues },
  })

  const handleImageSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    setImagePreview(URL.createObjectURL(file))
    try {
      const compressed = await compressImage(file)
      const fd = new FormData()
      fd.append("file", compressed)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const json = await res.json()
      if (!res.ok) { toast.error(json.error || "Erro no upload"); setImagePreview(null); return }
      form.setValue("imageUrl", json.url)
    } catch { toast.error("Erro no upload"); setImagePreview(null) }
    finally { setIsUploading(false); e.target.value = "" }
  }, [form])

  async function onSubmit(data: ProductInput) {
    setIsSubmitting(true)
    try { await onSave(data) } finally { setIsSubmitting(false) }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
        {/* Foto */}
        <div>
          <p className="text-sm font-medium mb-1.5" style={{ color: "var(--brand-text)" }}>Foto <span className="text-muted-foreground font-normal">(opcional)</span></p>
          {imagePreview ? (
            <div className="relative rounded-xl overflow-hidden" style={{ border: "1px solid var(--brand-border)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="Preview" className="w-full object-cover" style={{ maxHeight: "180px" }} />
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-white text-sm font-medium">
                    <Loader2 className="w-4 h-4 animate-spin" /> Enviando...
                  </div>
                </div>
              )}
              {!isUploading && (
                <button type="button" onClick={() => { form.setValue("imageUrl", ""); setImagePreview(null) }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-2 w-full py-6 rounded-xl cursor-pointer transition-colors"
              style={{ border: "2px dashed var(--brand-border)", background: "var(--brand-background)" }}>
              <ImagePlus className="w-7 h-7" style={{ color: "var(--brand-primary)", opacity: 0.7 }} />
              <span className="text-sm font-medium" style={{ color: "var(--brand-primary)" }}>Adicionar foto</span>
              <input type="file" accept="image/*" className="sr-only" onChange={handleImageSelect} />
            </label>
          )}
        </div>

        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Nome</FormLabel>
            <FormControl>
              <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Ex: Box Braids Comprida, Óleo de Argan..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>Descrição <span className="text-muted-foreground font-normal">(opcional)</span></FormLabel>
            <FormControl>
              <textarea rows={2} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Descreva o produto ou serviço..." {...field} value={field.value ?? ""} />
            </FormControl>
          </FormItem>
        )} />

        <FormField control={form.control} name="category" render={({ field }) => (
          <FormItem>
            <FormLabel>Categoria <span className="text-muted-foreground font-normal">(opcional)</span></FormLabel>
            <FormControl>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button key={cat} type="button" onClick={() => field.onChange(field.value === cat ? "" : cat)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border"
                    style={field.value === cat
                      ? { background: "var(--brand-primary)", color: "white", borderColor: "var(--brand-primary)" }
                      : { background: "transparent", color: "var(--brand-text)", borderColor: "var(--brand-border)" }}>
                    {cat}
                  </button>
                ))}
              </div>
            </FormControl>
          </FormItem>
        )} />

        <FormField control={form.control} name="priceInCents" render={({ field }) => (
          <FormItem>
            <FormLabel>Preço <span className="text-muted-foreground font-normal">(opcional)</span></FormLabel>
            <FormControl>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
                <input type="number" min="0" step="0.01" placeholder="0,00"
                  className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={field.value != null ? field.value / 100 : ""}
                  onChange={(e) => field.onChange(e.target.value === "" ? undefined : Math.round(parseFloat(e.target.value) * 100))} />
              </div>
            </FormControl>
          </FormItem>
        )} />

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="flex-1 cursor-pointer" onClick={onCancel}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting || isUploading} className="flex-1 font-semibold text-white cursor-pointer"
            style={{ background: "var(--brand-cta)" }}>
            {isSubmitting ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export function CatalogManager({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  async function handleCreate(data: ProductInput) {
    const res = await fetch("/api/products", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
    })
    if (!res.ok) { toast.error("Erro ao criar produto"); return }
    const { data: created } = await res.json()
    setProducts((prev) => [...prev, created])
    toast.success("Produto adicionado!")
    setDialogOpen(false)
  }

  async function handleEdit(id: string, data: ProductInput) {
    const res = await fetch(`/api/products/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
    })
    if (!res.ok) { toast.error("Erro ao atualizar"); return }
    const { data: updated } = await res.json()
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)))
    toast.success("Produto atualizado!")
    setEditingId(null)
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover este produto do catálogo?")) return
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" })
    if (!res.ok) { toast.error("Erro ao remover"); return }
    setProducts((prev) => prev.filter((p) => p.id !== id))
    toast.success("Produto removido")
  }

  const byCategory = products.reduce<Record<string, Product[]>>((acc, p) => {
    const cat = p.category ?? "Sem categoria"
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(p)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger className="inline-flex items-center gap-2 rounded-xl h-10 px-5 font-semibold text-white cursor-pointer transition-all duration-200 hover:-translate-y-0.5 text-sm"
            style={{ background: "var(--brand-cta)", boxShadow: "0 4px 12px rgba(139,92,246,0.25)" }}>
            <Plus className="w-4 h-4" /> Novo produto
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" style={{ borderRadius: "20px" }}>
            <DialogHeader>
              <DialogTitle className="font-heading text-xl">Novo produto</DialogTitle>
            </DialogHeader>
            <ProductForm onSave={handleCreate} onCancel={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {products.length === 0 ? (
        <Card className="border-0" style={{ borderRadius: "16px", border: "1px solid #F1F5F9" }}>
          <CardContent className="p-12 text-center">
            <ShoppingBag className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="font-semibold text-slate-600">Catálogo vazio</p>
            <p className="text-sm text-muted-foreground mt-1">Adicione produtos, serviços ou trabalhos do seu portfólio</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(byCategory).map(([category, items]) => (
            <div key={category}>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{category}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {items.map((product) => (
                  <div key={product.id}>
                    {editingId === product.id ? (
                      <Card className="border-0" style={{ borderRadius: "16px", border: "1px solid var(--brand-border)" }}>
                        <CardContent className="p-4">
                          <p className="font-semibold text-sm mb-3" style={{ color: "var(--brand-text)" }}>Editando: {product.name}</p>
                          <ProductForm
                            defaultValues={{ name: product.name, description: product.description ?? "", imageUrl: product.imageUrl ?? "", priceInCents: product.priceInCents ?? undefined, category: product.category ?? "" }}
                            onSave={(data) => handleEdit(product.id, data)}
                            onCancel={() => setEditingId(null)}
                          />
                        </CardContent>
                      </Card>
                    ) : (
                      <Card className="border-0 overflow-hidden" style={{ borderRadius: "16px", border: "1px solid #F1F5F9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                        {product.imageUrl && (
                          <div className="w-full overflow-hidden" style={{ maxHeight: "160px" }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={product.imageUrl} alt={product.name} className="w-full object-cover" style={{ maxHeight: "160px" }} />
                          </div>
                        )}
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-800 text-sm">{product.name}</p>
                              {product.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{product.description}</p>}
                              {product.priceInCents && (
                                <p className="text-sm font-bold mt-1.5" style={{ color: "var(--brand-primary)" }}>
                                  {formatPrice(product.priceInCents)}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button onClick={() => setEditingId(product.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer">
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => handleDelete(product.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
