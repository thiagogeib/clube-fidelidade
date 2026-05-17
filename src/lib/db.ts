import { PrismaClient } from "@/generated/prisma"
import { PrismaPg } from "@prisma/adapter-pg"

// Singleton do Prisma Client para Next.js.
// Em desenvolvimento, o hot-reload do Next cria novos módulos a cada save,
// o que criaria múltiplas conexões ao banco. O padrão abaixo evita isso
// armazenando a instância no objeto global (que persiste entre recargas).

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  })
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db
}
