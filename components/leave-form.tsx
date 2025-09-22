"use client"

import type React from "react"

import { useState } from "react"
import type { AuthUser } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Calendar } from "lucide-react"

interface LeaveFormProps {
  user: AuthUser
  onSubmit: (data: any) => void
  onCancel: () => void
}

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

    // Validation
    const startDate = new Date(formData.dateDebut)
    const endDate = new Date(formData.dateFin)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (startDate < today) {
      setError("La date de début ne peut pas être dans le passé")
      setIsLoading(false)
      return
    }

    if (endDate < startDate) {
      setError("La date de fin doit être après la date de début")
      setIsLoading(false)
      return
    }

    if (!formData.motif.trim()) {
      setError("Le motif est obligatoire")
      setIsLoading(false)
      return
    }

    const submitData = {
      ...formData,
      dateDebut: new Date(formData.dateDebut).toISOString(),
      dateFin: new Date(formData.dateFin).toISOString(),
    }

    await onSubmit(submitData)
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
      if (end >= start) {
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
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{error}</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Informations de la demande
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateDebut">Date de début</Label>
              <Input
                id="dateDebut"
                type="date"
                value={formData.dateDebut}
                onChange={(e) => handleChange("dateDebut", e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
            <div>
              <Label htmlFor="dateFin">Date de fin</Label>
              <Input
                id="dateFin"
                type="date"
                value={formData.dateFin}
                onChange={(e) => handleChange("dateFin", e.target.value)}
                min={formData.dateDebut || new Date().toISOString().split("T")[0]}
                required
              />
            </div>
          </div>

          {duration > 0 && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md text-sm">
              <strong>Durée calculée:</strong> {duration} jour{duration > 1 ? "s" : ""}
            </div>
          )}

          <div>
            <Label htmlFor="motif">Motif de la demande</Label>
            <Textarea
              id="motif"
              placeholder="Décrivez le motif de votre demande de congé..."
              value={formData.motif}
              onChange={(e) => handleChange("motif", e.target.value)}
              rows={4}
              required
            />
          </div>
        </CardContent>
      </Card>

      {user.employee && (
        <Card>
          <CardHeader>
            <CardTitle>Informations du demandeur</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Nom:</span> {user.employee.prenom} {user.employee.nom}
              </div>
              <div>
                <span className="font-medium">Matricule:</span> {user.employee.matricule}
              </div>
              <div>
                <span className="font-medium">Service:</span> {user.employee.service}
              </div>
              <div>
                <span className="font-medium">Poste:</span> {user.employee.poste}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            "Soumettre la demande"
          )}
        </Button>
      </div>
    </form>
  )
}
