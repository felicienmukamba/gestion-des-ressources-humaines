import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session || (session.role.nomRole !== "Admin" && session.role.nomRole !== "RH")) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    const ficheId = parseInt(params.id)
    const data = await request.json()
    const { employeId, mois, annee, motif, statut, avantageIds, primeIds } = data

    const fiche = await prisma.ficheDePaie.update({
      where: { id: ficheId },
      data: {
        employeId,
        mois: new Date(mois),
        annee,
        motif,
        statut,
        avantages: {
          set: [],
          connect: avantageIds?.map((id: number) => ({ id })) || []
        },
        primes: {
          set: [],
          connect: primeIds?.map((id: number) => ({ id })) || []
        },
      },
      include: {
        employe: {
          include: {
            utilisateur: true
          }
        },
        avantages: true,
        primes: true,
      },
    })

    return NextResponse.json(fiche)
  } catch (error) {
    console.error("Error updating fiche de paie:", error)
    return NextResponse.json({ error: "Erreur lors de la modification de la fiche de paie" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session || (session.role.nomRole !== "Admin" && session.role.nomRole !== "RH")) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    const ficheId = parseInt(params.id)

    await prisma.ficheDePaie.delete({
      where: { id: ficheId },
    })

    return NextResponse.json({ message: "Fiche de paie supprimée avec succès" })
  } catch (error) {
    console.error("Error deleting fiche de paie:", error)
    return NextResponse.json({ error: "Erreur lors de la suppression de la fiche de paie" }, { status: 500 })
  }
}