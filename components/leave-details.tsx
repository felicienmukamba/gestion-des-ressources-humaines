"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Calendar, Clock, FileText, CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface LeaveDetailsProps {
  leave: any
  onClose: () => void
}

export function LeaveDetails({ leave, onClose }: LeaveDetailsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "En attente":
        return {
          icon: <AlertCircle className="h-5 w-5 text-yellow-600" />,
          badge: (
            <Badge variant="outline" className="text-yellow-600 border-yellow-600">
              En attente
            </Badge>
          ),
          description: "Cette demande est en cours d'examen par les ressources humaines.",
        }
      case "Approuvé":
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-600" />,
          badge: (
            <Badge variant="outline" className="text-green-600 border-green-600">
              Approuvé
            </Badge>
          ),
          description: "Cette demande a été approuvée. Vous pouvez prendre votre congé aux dates prévues.",
        }
      case "Refusé":
        return {
          icon: <XCircle className="h-5 w-5 text-red-600" />,
          badge: (
            <Badge variant="outline" className="text-red-600 border-red-600">
              Refusé
            </Badge>
          ),
          description: "Cette demande a été refusée. Contactez les ressources humaines pour plus d'informations.",
        }
      default:
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          badge: <Badge variant="secondary">{status}</Badge>,
          description: "",
        }
    }
  }

  const statusInfo = getStatusInfo(leave.statut)
  const duration = calculateDuration(leave.dateDebut, leave.dateFin)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Demande de Congé</h2>
          <p className="text-muted-foreground">
            {leave.employe.prenom} {leave.employe.nom} - {leave.employe.matricule}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {statusInfo.icon}
          {statusInfo.badge}
        </div>
      </div>

      <Separator />

      {/* Employee Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informations de l'employé
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="text-sm font-medium">Nom complet:</span>
            <p className="text-sm text-muted-foreground">
              {leave.employe.prenom} {leave.employe.nom}
            </p>
          </div>
          <div className="space-y-2">
            <span className="text-sm font-medium">Matricule:</span>
            <p className="text-sm text-muted-foreground">{leave.employe.matricule}</p>
          </div>
          <div className="space-y-2">
            <span className="text-sm font-medium">Service:</span>
            <p className="text-sm text-muted-foreground">{leave.employe.service}</p>
          </div>
          <div className="space-y-2">
            <span className="text-sm font-medium">Poste:</span>
            <p className="text-sm text-muted-foreground">{leave.employe.poste}</p>
          </div>
        </CardContent>
      </Card>

      {/* Leave Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Détails du congé
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Date de début:</span>
              </div>
              <p className="text-sm text-muted-foreground ml-6">{formatDate(leave.dateDebut)}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Date de fin:</span>
              </div>
              <p className="text-sm text-muted-foreground ml-6">{formatDate(leave.dateFin)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Durée totale:</span>
            </div>
            <p className="text-sm text-muted-foreground ml-6">
              {duration} jour{duration > 1 ? "s" : ""}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Motif */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Motif de la demande
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{leave.motif}</p>
        </CardContent>
      </Card>

      {/* Status Information */}
      <Card>
        <CardHeader>
          <CardTitle>Statut de la demande</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3">
            {statusInfo.icon}
            <div>
              <div className="mb-2">{statusInfo.badge}</div>
              <p className="text-sm text-muted-foreground">{statusInfo.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onClose}>Fermer</Button>
      </div>
    </div>
  )
}
