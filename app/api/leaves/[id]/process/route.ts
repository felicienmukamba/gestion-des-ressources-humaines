import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session || (session.role.nomRole !== "Admin" && session.role.nomRole !== "RH")) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    const leaveId = Number.parseInt(params.id)
    const { action } = await request.json()

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Action invalide" }, { status: 400 })
    }

    // Vérifier si la demande existe et est en attente
    const existingLeave = await prisma.conge.findUnique({
      where: { id: leaveId },
    })

    if (!existingLeave) {
      return NextResponse.json({ error: "Demande de congé non trouvée" }, { status: 404 })
    }

    if (existingLeave.statut !== "En attente") {
      return NextResponse.json({ error: "Cette demande a déjà été traitée" }, { status: 400 })
    }

    const newStatus = action === "approve" ? "Approuvé" : "Refusé"

    const updatedLeave = await prisma.conge.update({
      where: { id: leaveId },
      data: { statut: newStatus },
      include: {
        employe: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            matricule: true,
            service: true,
            poste: true,
          },
        },
      },
    })

    return NextResponse.json(updatedLeave)
  } catch (error) {
    console.error("Error processing leave:", error)
    return NextResponse.json({ error: "Erreur lors du traitement de la demande" }, { status: 500 })
  }
}
