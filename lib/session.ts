import { cookies } from "next/headers"
import type { AuthUser } from "./auth"

const SESSION_COOKIE_NAME = "grh-session"

export async function createSession(user: AuthUser) {
  const sessionData = JSON.stringify({
    userId: user.id,
    login: user.login,
    role: user.role,
    employee: user.employee,
  })

  cookies().set(SESSION_COOKIE_NAME, sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

export async function getSession(): Promise<AuthUser | null> {
  try {
    const sessionCookie = cookies().get(SESSION_COOKIE_NAME)
    if (!sessionCookie) {
      return null
    }

    const sessionData = JSON.parse(sessionCookie.value)
    return sessionData as AuthUser
  } catch (error) {
    return null
  }
}

export async function destroySession() {
  cookies().delete(SESSION_COOKIE_NAME)
}
