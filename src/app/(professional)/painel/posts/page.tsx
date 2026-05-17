import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { PostsManager } from "@/components/professional/PostsManager"

export const metadata: Metadata = { title: "Dicas e Posts" }

export default async function PostsPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "PROFESSIONAL") redirect("/login")

  const posts = await db.post.findMany({
    where: { professionalId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return (
    <div className="p-4 sm:p-8 pt-6 space-y-6">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-slate-800">Dicas e Posts</h1>
        <p className="text-muted-foreground mt-1">Publique conteúdo exclusivo para suas clientes assinantes</p>
      </div>
      <PostsManager initialPosts={posts} />
    </div>
  )
}
