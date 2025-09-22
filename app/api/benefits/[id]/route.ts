import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session || (session.role.nomRole !== "Admin" && session.role.nomRole !== "RH")) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    const avantageId = parseInt(params.id)
    const data = await request.json()
    const { nomAvantages, montantAvantages } = data

    const avantage = await prisma.avantage.update({
      where: { id: avantageId },
      data: {
        nomAvantages,
        montantAvantages: parseFloat(montantAvantages),
      },
      include: {
        fiches_de_paie: {
          include: {
            employe: true
          }
        },
      },
    })

    return NextResponse.json(avantage)
  } catch (error) {
    console.error("Error updating avantage:", error)
    return NextResponse.json({ error: "Erreur lors de la modification de l'avantage" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session || (session.role.nomRole !== "Admin" && session.role.nomRole !== "RH")) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    const avantageId = parseInt(params.id)

    await prisma.avantage.delete({
      where: { id: avantageId },
    })

    return NextResponse.json({ message: "Avantage supprimé avec succès" })
  } catch (error) {
    console.error("Error deleting avantage:", error)
    return NextResponse.json({ error: "Erreur lors de la suppression de l'avantage" }, { status: 500 })
  }
}