import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    const participationId = parseInt(params.id)
    const data = await request.json()

    const existingParticipation = await prisma.participationFormation.findUnique({
      where: { id: participationId },
    })

    if (!existingParticipation) {
      return NextResponse.json({ error: "Participation non trouvée" }, { status: 404 })
    }

    if (session.role.nomRole === "Employee" && existingParticipation.employeId !== session.employee.id) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    const { employeId, formationId, statut, resultat } = data

    const participation = await prisma.participationFormation.update({
      where: { id: participationId },
      data: {
        employeId: session.role.nomRole === "Employee" ? existingParticipation.employeId : employeId,
        formationId: parseInt(formationId),
        statut,
        resultat,
      },
      include: {
        employe: {
          include: {
            utilisateur: true
          }
        },
        formation: true,
      },
    })

    return NextResponse.json(participation)
  } catch (error) {
    console.error("Error updating participation:", error)
    return NextResponse.json({ error: "Erreur lors de la modification de la participation" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    const participationId = parseInt(params.id)

    const existingParticipation = await prisma.participationFormation.findUnique({
      where: { id: participationId },
    })

    if (!existingParticipation) {
      return NextResponse.json({ error: "Participation non trouvée" }, { status: 404 })
    }

    if (session.role.nomRole === "Employee" && existingParticipation.employeId !== session.employee.id) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    await prisma.participationFormation.delete({
      where: { id: participationId },
    })

    return NextResponse.json({ message: "Participation supprimée avec succès" })
  } catch (error) {
    console.error("Error deleting participation:", error)
    return NextResponse.json({ error: "Erreur lors de la suppression de la participation" }, { status: 500 })
  }
}