import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const employeId = searchParams.get('employeId')
    const formationId = searchParams.get('formationId')

    let where: any = {}
    
    if (session.role.nomRole === "Employee") {
      where.employeId = session.employee.id
    } else if (employeId) {
      where.employeId = parseInt(employeId)
    }

    if (formationId) {
      where.formationId = parseInt(formationId)
    }

    const participations = await prisma.participationFormation.findMany({
      where,
      include: {
        employe: {
          include: {
            utilisateur: true
          }
        },
        formation: true,
      },
      orderBy: {
        dateInscription: 'desc',
      },
    })

    return NextResponse.json(participations)
  } catch (error) {
    console.error("Error fetching participations:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    const data = await request.json()
    const { employeId, formationId, statut, resultat } = data

    // Si c'est un employé, il peut s'inscrire à des formations
    const finalEmployeId = session.role.nomRole === "Employee" ? session.employee.id : employeId
    const finalStatut = session.role.nomRole === "Employee" ? "Planifié" : statut

    const participation = await prisma.participationFormation.create({
      data: {
        employeId: finalEmployeId,
        formationId: parseInt(formationId),
        statut: finalStatut,
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

    return NextResponse.json(participation, { status: 201 })
  } catch (error) {
    console.error("Error creating participation:", error)
    return NextResponse.json({ error: "Erreur lors de l'inscription à la formation" }, { status: 500 })
  }
}