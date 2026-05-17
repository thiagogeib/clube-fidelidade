import { auth } from "@/lib/auth"
import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== "PROFESSIONAL") {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return Response.json(
      { error: "Storage not configured", message: "Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nas variáveis de ambiente." },
      { status: 503 }
    )
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return Response.json({ error: "Invalid form data" }, { status: 400 })
  }

  const file = formData.get("file") as File | null
  if (!file || !file.type.startsWith("image/")) {
    return Response.json({ error: "Arquivo inválido. Envie uma imagem." }, { status: 400 })
  }

  if (file.size > 5 * 1024 * 1024) {
    return Response.json({ error: "Imagem muito grande. Máximo 5MB." }, { status: 400 })
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg"
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const buffer = await file.arrayBuffer()

  const uploadRes = await fetch(
    `${supabaseUrl}/storage/v1/object/dicas/${safeName}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": file.type,
        "x-upsert": "false",
      },
      body: buffer,
    }
  )

  if (!uploadRes.ok) {
    const text = await uploadRes.text()
    console.error("Supabase upload error:", text)
    return Response.json({ error: "Falha ao fazer upload da imagem." }, { status: 500 })
  }

  const publicUrl = `${supabaseUrl}/storage/v1/object/public/dicas/${safeName}`
  return Response.json({ url: publicUrl })
}
