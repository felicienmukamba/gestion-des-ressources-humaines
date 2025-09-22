import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session || (session.role.nomRole !== "Admin" && session.role.nomRole !== "RH")) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    const employeeId = Number.parseInt(params.id)
    const data = await request.json()
    const {
      login,
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

    // Vérifier si l'employé existe
    const existingEmployee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { utilisateur: true },
    })

    if (!existingEmployee) {
      return NextResponse.json({ error: "Employé non trouvé" }, { status: 404 })
    }

    // Vérifier les doublons (sauf pour l'employé actuel)
    const existingUser = await prisma.user.findFirst({
      where: {
        login,
        id: { not: existingEmployee.userId },
      },
    })

    if (existingUser) {
      return NextResponse.json({ error: "Ce nom d'utilisateur existe déjà" }, { status: 400 })
    }

    const existingMatricule = await prisma.employee.findFirst({
      where: {
        matricule,
        id: { not: employeeId },
      },
    })

    if (existingMatricule) {
      return NextResponse.json({ error: "Ce matricule existe déjà" }, { status: 400 })
    }

    // Mettre à jour dans une transaction
    const result = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: existingEmployee.userId },
        data: {
          login,
          roleId,
        },
      })

      const employee = await tx.employee.update({
        where: { id: employeeId },
        data: {
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

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error updating employee:", error)
    return NextResponse.json({ error: "Erreur lors de la modification de l'employé" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session || (session.role.nomRole !== "Admin" && session.role.nomRole !== "RH")) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    const employeeId = Number.parseInt(params.id)

    // Vérifier si l'employé existe
    const existingEmployee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { utilisateur: true },
    })

    if (!existingEmployee) {
      return NextResponse.json({ error: "Employé non trouvé" }, { status: 404 })
    }

    // Supprimer dans une transaction (l'employé d'abord, puis l'utilisateur)
    await prisma.$transaction(async (tx) => {
      await tx.employee.delete({
        where: { id: employeeId },
      })

      await tx.user.delete({
        where: { id: existingEmployee.userId },
      })
    })

    return NextResponse.json({ message: "Employé supprimé avec succès" })
  } catch (error) {
    console.error("Error deleting employee:", error)
    return NextResponse.json({ error: "Erreur lors de la suppression de l'employé" }, { status: 500 })
  }
}
