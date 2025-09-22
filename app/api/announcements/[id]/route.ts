import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session || (session.role.nomRole !== "Admin" && session.role.nomRole !== "RH")) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    const annonceId = parseInt(params.id)
    const data = await request.json()
    const { titre, contenu } = data

    const annonce = await prisma.annonce.update({
      where: { id: annonceId },
      data: {
        titre,
        contenu,
      },
    })

    return NextResponse.json(annonce)
  } catch (error) {
    console.error("Error updating annonce:", error)
    return NextResponse.json({ error: "Erreur lors de la modification de l'annonce" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session || (session.role.nomRole !== "Admin" && session.role.nomRole !== "RH")) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    const annonceId = parseInt(params.id)

    await prisma.annonce.delete({
      where: { id: annonceId },
    })

    return NextResponse.json({ message: "Annonce supprimée avec succès" })
  } catch (error) {
    console.error("Error deleting annonce:", error)
    return NextResponse.json({ error: "Erreur lors de la suppression de l'annonce" }, { status: 500 })
  }
}