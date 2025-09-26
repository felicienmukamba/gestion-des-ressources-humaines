import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session" // Assurez-vous que cette fonction récupère correctement l'objet AuthUser

// Fonction utilitaire pour garantir que les dates sont bien définies à minuit
const parseDateString = (dateString: string) => {
    // Crée une date à minuit UTC pour éviter les problèmes de fuseau horaire
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) return null;
    return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
};

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
        return NextResponse.json({ error: "Informations d'employé manquantes dans la session" }, { status: 404 })
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
    return NextResponse.json({ error: "Erreur interne du serveur lors de la récupération des congés" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !session.employee) {
      return NextResponse.json({ error: "Non authentifié ou informations d'employé manquantes" }, { status: 401 })
    }

    const data = await request.json()
    const { dateDebut, dateFin, motif } = data

    // 1. Validation des champs
    if (!dateDebut || !dateFin || !motif) {
      return NextResponse.json({ error: "Les champs Date de début, Date de fin et Motif sont obligatoires" }, { status: 400 })
    }
    
    // 2. Conversion et validation des dates
    const startDate = parseDateString(dateDebut)
    const endDate = parseDateString(dateFin)
    
    // Vérifie si la date est parsée correctement
    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Format de date invalide. Utilisez YYYY-MM-DD." }, { status: 400 })
    }

    // La date d'aujourd'hui pour la comparaison (à minuit UTC)
    const today = parseDateString(new Date().toISOString().split('T')[0]);

    if (startDate < today!) {
      return NextResponse.json({ error: "La date de début ne peut pas être dans le passé" }, { status: 400 })
    }

    if (endDate < startDate) {
      return NextResponse.json({ error: "La date de fin doit être après ou égale à la date de début" }, { status: 400 })
    }
    
    // 3. Création de la demande de congé dans la base de données
    const newLeave = await prisma.conge.create({
      data: {
        dateDebut: startDate,
        dateFin: endDate,
        motif: motif,
        statut: "En attente", // Statut par défaut
        employeId: session.employee.id,
      },
    })

    return NextResponse.json(newLeave, { status: 201 })
  } catch (error) {
    console.error("Error creating leave:", error)
    return NextResponse.json({ error: "Erreur interne du serveur lors de la création du congé" }, { status: 500 })
  }
}