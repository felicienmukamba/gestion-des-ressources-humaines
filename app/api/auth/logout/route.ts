import { NextResponse } from "next/server"
import { destroySession } from "@/lib/session"

export async function POST() {
  try {
    await destroySession()
    return NextResponse.json({ message: "Déconnexion réussie" })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Erreur lors de la déconnexion" }, { status: 500 })
  }
}
