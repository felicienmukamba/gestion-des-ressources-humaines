import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session || (session.role.nomRole !== "Admin" && session.role.nomRole !== "RH")) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    const formationId = parseInt(params.id)
    const data = await request.json()
    const { titre, description, dureeHeures } = data

    const formation = await prisma.formation.update({
      where: { id: formationId },
      data: {
        titre,
        description,
        dureeHeures: parseInt(dureeHeures),
      },
      include: {
        participations: {
          include: {
            employe: {
              include: {
                utilisateur: true
              }
            }
          }
        },
      },
    })

    return NextResponse.json(formation)
  } catch (error) {
    console.error("Error updating formation:", error)
    return NextResponse.json({ error: "Erreur lors de la modification de la formation" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session || (session.role.nomRole !== "Admin" && session.role.nomRole !== "RH")) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    const formationId = parseInt(params.id)

    await prisma.formation.delete({
      where: { id: formationId },
    })

    return NextResponse.json({ message: "Formation supprimée avec succès" })
  } catch (error) {
    console.error("Error deleting formation:", error)
    return NextResponse.json({ error: "Erreur lors de la suppression de la formation" }, { status: 500 })
  }
}