"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Phone, Calendar, Building, Briefcase, DollarSign } from "lucide-react"

interface EmployeeDetailsProps {
  employee: any
  onClose: () => void
}

export function EmployeeDetails({ employee, onClose }: EmployeeDetailsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "USD",
    }).format(salary)
  }

  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const calculateSeniority = (hireDate: string) => {
    const today = new Date()
    const hire = new Date(hireDate)
    const years = today.getFullYear() - hire.getFullYear()
    const months = today.getMonth() - hire.getMonth()

    if (years === 0) {
      return `${months} mois`
    } else if (months < 0) {
      return `${years - 1} ans et ${12 + months} mois`
    } else {
      return `${years} ans et ${months} mois`
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {employee.prenom} {employee.nom}
          </h2>
          <p className="text-muted-foreground">Matricule: {employee.matricule}</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {employee.utilisateur.role.nomRole}
        </Badge>
      </div>

      <Separator />

      {/* Informations personnelles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informations personnelles
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Date de naissance:</span>
            </div>
            <p className="text-sm text-muted-foreground ml-6">
              {formatDate(employee.dateNaissance)} ({calculateAge(employee.dateNaissance)} ans)
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Téléphone:</span>
            </div>
            <p className="text-sm text-muted-foreground ml-6">{employee.telephone}</p>
          </div>
        </CardContent>
      </Card>

      {/* Informations professionnelles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Informations professionnelles
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Service:</span>
            </div>
            <p className="text-sm text-muted-foreground ml-6">{employee.service}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Poste:</span>
            </div>
            <p className="text-sm text-muted-foreground ml-6">{employee.poste}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Salaire de base:</span>
            </div>
            <p className="text-sm text-muted-foreground ml-6">{formatSalary(employee.salaireBase)}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Date d'embauche:</span>
            </div>
            <p className="text-sm text-muted-foreground ml-6">
              {formatDate(employee.dateEmbauche)} ({calculateSeniority(employee.dateEmbauche)} d'ancienneté)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Informations de connexion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informations de connexion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <span className="text-sm font-medium">Nom d'utilisateur:</span>
            <p className="text-sm text-muted-foreground">{employee.utilisateur.login}</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onClose}>Fermer</Button>
      </div>
    </div>
  )
}
