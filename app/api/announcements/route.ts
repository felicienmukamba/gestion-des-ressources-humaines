import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    const annonces = await prisma.annonce.findMany({
      orderBy: {
        datePub: 'desc',
      },
    })

    return NextResponse.json(annonces)
  } catch (error) {
    console.error("Error fetching annonces:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || (session.role.nomRole !== "Admin" && session.role.nomRole !== "RH")) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    const data = await request.json()
    const { titre, contenu } = data

    const annonce = await prisma.annonce.create({
      data: {
        titre,
        contenu,
      },
    })

    return NextResponse.json(annonce, { status: 201 })
  } catch (error) {
    console.error("Error creating annonce:", error)
    return NextResponse.json({ error: "Erreur lors de la création de l'annonce" }, { status: 500 })
  }
}