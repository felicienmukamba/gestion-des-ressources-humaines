"use client"

import type React from "react"

import { useState } from "react"
import type { AuthUser } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Calendar, Loader2, Info, User, CheckCircle, XCircle } from "lucide-react"

// Interfaces
interface LeaveFormProps {
  user: AuthUser
  onSubmit: (data: any) => void
  onCancel: () => void
}

// Composant LeaveForm
export function LeaveForm({ user, onSubmit, onCancel }: LeaveFormProps) {
  const [formData, setFormData] = useState({
    dateDebut: "",
    dateFin: "",
    motif: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // --- Validation Front-end Améliorée ---
    const startDate = new Date(formData.dateDebut)
    const endDate = new Date(formData.dateFin)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (!formData.dateDebut || !formData.dateFin || !formData.motif.trim()) {
      setError("Veuillez remplir tous les champs obligatoires.")
      setIsLoading(false)
      return
    }

    if (startDate < today) {
      setError("La date de début ne peut pas être antérieure à aujourd'hui.")
      setIsLoading(false)
      return
    }

    if (endDate < startDate) {
      setError("La date de fin doit être postérieure ou égale à la date de début.")
      setIsLoading(false)
      return
    }
    // ----------------------------------------

    const submitData = {
      ...formData,
      dateDebut: formData.dateDebut,
      dateFin: formData.dateFin,
      // Vous pouvez ajouter l'ID de l'employé ici si nécessaire pour l'API, mais c'est souvent géré côté serveur avec l'AuthUser
    }

    await onSubmit(submitData)
    // Note: Le parent (LeaveManagement) devrait gérer la réinitialisation/fermeture après un succès
    setIsLoading(false)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (error) setError("")
  }

  const calculateDuration = () => {
    if (formData.dateDebut && formData.dateFin) {
      const start = new Date(formData.dateDebut)
      const end = new Date(formData.dateFin)
      
      // Assure que la date de fin n'est pas antérieure pour éviter des nombres négatifs
      if (end >= start) {
        // Calcule la différence en jours et ajoute 1 pour inclure la date de fin
        const diffTime = Math.abs(end.getTime() - start.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
        return diffDays
      }
    }
    return 0
  }

  const duration = calculateDuration()

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Affichage d'erreur amélioré */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Erreur de validation</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Section 1: Informations sur la période */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <Calendar className="h-5 w-5 text-primary" />
            Période de Congé
          </CardTitle>
          <CardDescription>
            Sélectionnez les dates de début et de fin de votre absence.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="dateDebut">Date de début *</Label>
              <Input
                id="dateDebut"
                type="date"
                value={formData.dateDebut}
                onChange={(e) => handleChange("dateDebut", e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required
                className="focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateFin">Date de fin *</Label>
              <Input
                id="dateFin"
                type="date"
                value={formData.dateFin}
                onChange={(e) => handleChange("dateFin", e.target.value)}
                min={formData.dateDebut || new Date().toISOString().split("T")[0]}
                required
                className="focus-visible:ring-primary"
              />
            </div>
          </div>

          {/* Affichage de la durée calculée */}
          {duration > 0 && (
            <Alert className="border-l-4 border-blue-500 bg-blue-50 text-blue-800">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-600">Durée estimée</AlertTitle>
              <AlertDescription>
                Votre demande couvre **{duration} jour{duration > 1 ? "s" : ""}**.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="motif">Motif de la demande *</Label>
            <Textarea
              id="motif"
              placeholder="Ex: Vacances annuelles, congé de maladie, congé sans solde..."
              value={formData.motif}
              onChange={(e) => handleChange("motif", e.target.value)}
              rows={5}
              required
              className="resize-none focus-visible:ring-primary"
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Informations du demandeur (Lecture seule) */}
      {user.employee && (
        <Card className="border-l-4 border-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-green-600" />
              Informations du demandeur
            </CardTitle>
            <CardDescription>
              Ces informations seront incluses dans la demande.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="flex flex-col">
                <span className="font-semibold text-muted-foreground">Nom complet</span>
                <span className="font-medium text-base">
                  {user.employee.prenom} {user.employee.nom}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-muted-foreground">Matricule</span>
                <span className="font-medium text-base">{user.employee.matricule}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-muted-foreground">Service</span>
                <span className="font-medium text-base">{user.employee.service}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-muted-foreground">Poste</span>
                <span className="font-medium text-base">{user.employee.poste}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Boutons d'action */}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading || duration <= 0 || !!error} className="bg-primary hover:bg-primary/90">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Soumettre la demande
            </>
          )}
        </Button>
      </div>
    </form>
  )
}