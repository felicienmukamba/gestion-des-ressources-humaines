import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || (session.role.nomRole !== "Admin" && session.role.nomRole !== "RH")) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const employeId = searchParams.get('employeId')

    const where = employeId ? { employeId: parseInt(employeId) } : {}

    const fiches = await prisma.ficheDePaie.findMany({
      where,
      include: {
        employe: {
          include: {
            utilisateur: true
          }
        },
        avantages: true,
        primes: true,
      },
      orderBy: [
        { annee: 'desc' },
        { mois: 'desc' }
      ],
    })

    return NextResponse.json(fiches)
  } catch (error) {
    console.error("Error fetching fiches de paie:", error)
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
    const { employeId, mois, annee, motif, statut, avantageIds, primeIds } = data

    const fiche = await prisma.ficheDePaie.create({
      data: {
        employeId,
        mois: new Date(mois),
        annee,
        motif,
        statut,
        avantages: avantageIds?.length ? {
          connect: avantageIds.map((id: number) => ({ id }))
        } : undefined,
        primes: primeIds?.length ? {
          connect: primeIds.map((id: number) => ({ id }))
        } : undefined,
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

    return NextResponse.json(fiche, { status: 201 })
  } catch (error) {
    console.error("Error creating fiche de paie:", error)
    return NextResponse.json({ error: "Erreur lors de la création de la fiche de paie" }, { status: 500 })
  }
}