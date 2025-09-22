import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const isAdmin = session.role.nomRole === "Admin" || session.role.nomRole === "RH"

    let leaves
    if (isAdmin) {
      // Admin/RH peut voir tous les congés
      leaves = await prisma.conge.findMany({
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
        orderBy: {
          dateDebut: "desc",
        },
      })
    } else {
      // Employé ne voit que ses propres congés
      if (!session.employee) {
        return NextResponse.json({ error: "Employé non trouvé" }, { status: 404 })
      }

      leaves = await prisma.conge.findMany({
        where: {
          employeId: session.employee.id,
        },
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
        orderBy: {
          dateDebut: "desc",
        },
      })
    }

    return NextResponse.json(leaves)
  } catch (error) {
    console.error("Error fetching leaves:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !session.employee) {
      return NextResponse.json({ error: "Non authentifié ou employé non trouvé" }, { status: 401 })
    }

    const data = await request.json()
    const { dateDebut, dateFin, motif } = data

    // Validation des dates
    const startDate = new Date(dateDebut)
    const endDate = new Date(dateFin)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (startDate < today) {
      return NextResponse.json({ error: "La date de début ne peut pas être dans le passé" }, { status: 400 })
    }

    if (endDate < startDate) {
      return NextResponse.json({ error: "La date de fin doit être après la date de début" }, { status: 400 })
    }

    // Vérifier les conflits de dates pour cet employé
    const conflictingLeave = await prisma.conge.findFirst({
      where: {
        employeId: session.employee.id,
        statut: { in: ["En attente", "Approuvé"] },
        OR: [
          {
            dateDebut: { lte: endDate },
            dateFin: { gte: startDate },
          },
        ],
      },
    })

    if (conflictingLeave) {
      return NextResponse.json({ error: "Vous avez déjà une demande de congé pour cette période" }, { status: 400 })
    }

    const leave = await prisma.conge.create({
      data: {
        employeId: session.employee.id,
        dateDebut: new Date(dateDebut),
        dateFin: new Date(dateFin),
        motif,
        statut: "En attente",
      },
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

    return NextResponse.json(leave, { status: 201 })
  } catch (error) {
    console.error("Error creating leave:", error)
    return NextResponse.json({ error: "Erreur lors de la création de la demande" }, { status: 500 })
  }
}
