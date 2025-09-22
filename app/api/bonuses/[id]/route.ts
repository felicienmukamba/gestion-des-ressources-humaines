import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session || (session.role.nomRole !== "Admin" && session.role.nomRole !== "RH")) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    const primeId = parseInt(params.id)
    const data = await request.json()
    const { nomPrime, montantPrime } = data

    const prime = await prisma.prime.update({
      where: { id: primeId },
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

    return NextResponse.json(prime)
  } catch (error) {
    console.error("Error updating prime:", error)
    return NextResponse.json({ error: "Erreur lors de la modification de la prime" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session || (session.role.nomRole !== "Admin" && session.role.nomRole !== "RH")) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    const primeId = parseInt(params.id)

    await prisma.prime.delete({
      where: { id: primeId },
    })

    return NextResponse.json({ message: "Prime supprimée avec succès" })
  } catch (error) {
    console.error("Error deleting prime:", error)
    return NextResponse.json({ error: "Erreur lors de la suppression de la prime" }, { status: 500 })
  }
}