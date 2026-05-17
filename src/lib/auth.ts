import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { loginSchema } from "@/lib/validations/auth"
import type { UserRole } from "@/types"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email:    { label: "Email",  type: "email"    },
        password: { label: "Senha",  type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data

        const user = await db.user.findUnique({
          where: { email },
          select: {
            id:           true,
            name:         true,
            email:        true,
            passwordHash: true,
            role:         true,
            image:        true,
          },
        })

        if (!user || !user.passwordHash) return null

        const isValid = await bcrypt.compare(password, user.passwordHash)
        if (!isValid) return null

        return {
          id:    user.id,
          name:  user.name,
          email: user.email,
          role:  user.role,
          image: user.image,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as typeof user & { role: UserRole }).role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id   = token.sub as string
        session.user.role = token.role as UserRole
      }
      return session
    },
  },
})

// Extensão do tipo Session para incluir role e id
declare module "next-auth" {
  interface Session {
    user: {
      id:    string
      name:  string | null
      email: string
      image: string | null
      role:  UserRole
    }
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role: UserRole
  }
}
