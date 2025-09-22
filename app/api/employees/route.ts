import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"
import { getSession } from "@/lib/session"

export async function GET() {
  try {
    const session = await getSession()
    if (!session || (session.role.nomRole !== "Admin" && session.role.nomRole !== "RH")) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    const employees = await prisma.employee.findMany({
      include: {
        utilisateur: {
          include: {
            role: true,
          },
        },
      },
      orderBy: {
        nom: "asc",
      },
    })

    return NextResponse.json(employees)
  } catch (error) {
    console.error("Error fetching employees:", error)
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
    const {
      login,
      password,
      roleId,
      matricule,
      nom,
      prenom,
      dateNaissance,
      telephone,
      service,
      poste,
      salaireBase,
      dateEmbauche,
    } = data

    // Vérifier si le login ou matricule existe déjà
    const existingUser = await prisma.user.findUnique({ where: { login } })
    if (existingUser) {
      return NextResponse.json({ error: "Ce nom d'utilisateur existe déjà" }, { status: 400 })
    }

    const existingEmployee = await prisma.employee.findUnique({ where: { matricule } })
    if (existingEmployee) {
      return NextResponse.json({ error: "Ce matricule existe déjà" }, { status: 400 })
    }

    // Hasher le mot de passe
    const hashedPassword = await hashPassword(password)

    // Créer l'utilisateur et l'employé dans une transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          login,
          password: hashedPassword,
          roleId,
        },
      })

      const employee = await tx.employee.create({
        data: {
          userId: user.id,
          matricule,
          nom,
          prenom,
          dateNaissance: new Date(dateNaissance),
          telephone,
          service,
          poste,
          salaireBase,
          dateEmbauche: new Date(dateEmbauche),
        },
        include: {
          utilisateur: {
            include: {
              role: true,
            },
          },
        },
      })

      return employee
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Error creating employee:", error)
    return NextResponse.json({ error: "Erreur lors de la création de l'employé" }, { status: 500 })
  }
}
