import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    const formations = await prisma.formation.findMany({
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
      orderBy: {
        titre: "asc",
      },
    })

    return NextResponse.json(formations)
  } catch (error) {
    console.error("Error fetching formations:", error)
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
    const { titre, description, dureeHeures } = data

    const formation = await prisma.formation.create({
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

    return NextResponse.json(formation, { status: 201 })
  } catch (error) {
    console.error("Error creating formation:", error)
    return NextResponse.json({ error: "Erreur lors de la création de la formation" }, { status: 500 })
  }
}