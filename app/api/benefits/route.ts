import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function GET() {
  try {
    const session = await getSession()
    if (!session || (session.role.nomRole !== "Admin" && session.role.nomRole !== "RH")) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    const avantages = await prisma.avantage.findMany({
      include: {
        fiches_de_paie: {
          include: {
            employe: true
          }
        },
      },
      orderBy: {
        nomAvantages: "asc",
      },
    })

    return NextResponse.json(avantages)
  } catch (error) {
    console.error("Error fetching avantages:", error)
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
    const { nomAvantages, montantAvantages } = data

    const avantage = await prisma.avantage.create({
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

    return NextResponse.json(avantage, { status: 201 })
  } catch (error) {
    console.error("Error creating avantage:", error)
    return NextResponse.json({ error: "Erreur lors de la création de l'avantage" }, { status: 500 })
  }
}