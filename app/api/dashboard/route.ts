// Ce fichier est une route API Next.js qui récupère les données
// de la base de données pour les graphiques du tableau de bord.
import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function GET() {
  try {
    // 1. Statistiques sur la répartition des employés par service
    const employeesByService = await prisma.employee.groupBy({
      by: ["service"],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
    })
    const formattedEmployeesByService = employeesByService.map(item => ({
      name: item.service,
      count: item._count.id,
    }))

    // 2. Statistiques sur la répartition des congés par statut
    const leavesByStatus = await prisma.conge.groupBy({
      by: ["statut"],
      _count: {
        id: true,
      },
    })
    const formattedLeavesByStatus = leavesByStatus.map(item => ({
      name: item.statut,
      count: item._count.id,
    }))

    // 3. Statistiques sur la répartition des salaires par tranche
    // Note: Pour un affichage réel, vous devriez ajuster les tranches de salaire.
    const salaryData = await prisma.employee.findMany({
      select: {
        salaireBase: true,
      },
    })
    
    const salaryRanges = {
      "< 500": 0,
      "500 - 1000": 0,
      "1001 - 2000": 0,
      "2001 - 5000": 0,
      "> 5000": 0,
    }

    salaryData.forEach(employee => {
      const salary = employee.salaireBase
      if (salary < 500) salaryRanges["< 500"]++
      else if (salary >= 500 && salary <= 1000) salaryRanges["500 - 1000"]++
      else if (salary > 1000 && salary <= 2000) salaryRanges["1001 - 2000"]++
      else if (salary > 2000 && salary <= 5000) salaryRanges["2001 - 5000"]++
      else salaryRanges["> 5000"]++
    })
    
    const formattedSalaryRanges = Object.entries(salaryRanges).map(([range, count]) => ({
      name: range,
      count,
    }))
    
    // Retourner les données formatées
    return NextResponse.json({
      employeesByService: formattedEmployeesByService,
      leavesByStatus: formattedLeavesByStatus,
      salaryRanges: formattedSalaryRanges,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques du tableau de bord :", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
