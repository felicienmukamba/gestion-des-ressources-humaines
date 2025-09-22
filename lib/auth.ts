import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

export interface AuthUser {
  id: number
  login: string
  role: {
    id: number
    nomRole: string
  }
  employee?: {
    id: number
    nom: string
    prenom: string
    matricule: string
    service: string
    poste: string
  }
}

export async function authenticateUser(login: string, password: string): Promise<AuthUser | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { login },
      include: {
        role: true,
        employee: true,
      },
    })

    if (!user) {
      return null
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return null
    }

    return {
      id: user.id,
      login: user.login,
      role: user.role,
      employee: user.employee || undefined,
    }
  } catch (error) {
    console.error("Authentication error:", error)
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}
