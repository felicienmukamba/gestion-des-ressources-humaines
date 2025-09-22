import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    const presenceId = parseInt(params.id)
    const data = await request.json()

    const existingPresence = await prisma.presence.findUnique({
      where: { id: presenceId },
    })

    if (!existingPresence) {
      return NextResponse.json({ error: "Présence non trouvée" }, { status: 404 })
    }

    if (session.role.nomRole === "Employee" && existingPresence.employeId !== session.employee.id) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    const { employeId, dateJournee, heureArrivee, heureDepart } = data

    const presence = await prisma.presence.update({
      where: { id: presenceId },
      data: {
        employeId: session.role.nomRole === "Employee" ? existingPresence.employeId : employeId,
        dateJournee: new Date(dateJournee),
        heureArrivee: heureArrivee ? new Date(heureArrivee) : null,
        heureDepart: heureDepart ? new Date(heureDepart) : null,
      },
      include: {
        employe: {
          include: {
            utilisateur: true
          }
        },
      },
    })

    return NextResponse.json(presence)
  } catch (error) {
    console.error("Error updating presence:", error)
    return NextResponse.json({ error: "Erreur lors de la modification de la présence" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session || (session.role.nomRole !== "Admin" && session.role.nomRole !== "RH")) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    const presenceId = parseInt(params.id)

    await prisma.presence.delete({
      where: { id: presenceId },
    })

    return NextResponse.json({ message: "Présence supprimée avec succès" })
  } catch (error) {
    console.error("Error deleting presence:", error)
    return NextResponse.json({ error: "Erreur lors de la suppression de la présence" }, { status: 500 })
  }
}