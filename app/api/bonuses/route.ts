import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function GET() {
  try {
    const session = await getSession()
    if (!session || (session.role.nomRole !== "Admin" && session.role.nomRole !== "RH")) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    const primes = await prisma.prime.findMany({
      include: {
        fiches_de_paie: {
          include: {
            employe: true
          }
        },
      },
      orderBy: {
        nomPrime: "asc",
      },
    })

    return NextResponse.json(primes)
  } catch (error) {
    console.error("Error fetching primes:", error)
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
    const { nomPrime, montantPrime } = data

    const prime = await prisma.prime.create({
      data: {
        nomPrime,
        montantPrime: parseFloat(montantPrime),
      },
      include: {
        fiches_de_paie: {
          include: {
            employe: true
          }
        },
      },
    })

    return NextResponse.json(prime, { status: 201 })
  } catch (error) {
    console.error("Error creating prime:", error)
    return NextResponse.json({ error: "Erreur lors de la création de la prime" }, { status: 500 })
  }
}