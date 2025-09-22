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
    const dateDebut = searchParams.get('dateDebut')
    const dateFin = searchParams.get('dateFin')

    let where: any = {}
    
    if (session.role.nomRole === "Employee") {
      where.employeId = session.employee.id
    } else if (employeId) {
      where.employeId = parseInt(employeId)
    }

    if (dateDebut && dateFin) {
      where.dateJournee = {
        gte: new Date(dateDebut),
        lte: new Date(dateFin)
      }
    }

    const presences = await prisma.presence.findMany({
      where,
      include: {
        employe: {
          include: {
            utilisateur: true
          }
        },
      },
      orderBy: {
        dateJournee: 'desc',
      },
    })

    return NextResponse.json(presences)
  } catch (error) {
    console.error("Error fetching presences:", error)
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
    const { employeId, dateJournee, heureArrivee, heureDepart } = data

    // Si c'est un employé, il ne peut créer des présences que pour lui-même
    const finalEmployeId = session.role.nomRole === "Employee" ? session.employee.id : employeId

    const presence = await prisma.presence.create({
      data: {
        employeId: finalEmployeId,
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

    return NextResponse.json(presence, { status: 201 })
  } catch (error) {
    console.error("Error creating presence:", error)
    return NextResponse.json({ error: "Erreur lors de l'enregistrement de la présence" }, { status: 500 })
  }
}