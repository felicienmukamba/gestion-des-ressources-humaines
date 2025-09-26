"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

// Interfaces
interface Employee {
  id: number
  nom: string
  prenom: string
}

interface Formation {
  id: number
  titre: string
}

interface Session {
  role: { nomRole: string }
  employee: { id: number }
}

interface ParticipationFormProps {
  session: Session
  participation?: any
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  employees: Employee[]
  formations: Formation[]
}

export function ParticipationForm({ session, participation, onSubmit, onCancel, employees, formations }: ParticipationFormProps) {
  const [formData, setFormData] = useState({
    employeId: "",
    formationId: "",
    statut: "Planifié",
    resultat: "En attente",
  })
  const [isLoading, setIsLoading] = useState(false)
  const isManager = session.role.nomRole === "Admin" || session.role.nomRole === "RH"
  const isEditing = !!participation

  useEffect(() => {
    if (participation) {
      setFormData({
        employeId: participation.employeId.toString(),
        formationId: participation.formationId.toString(),
        statut: participation.statut,
        resultat: participation.resultat || "En attente",
      })
    } else if (!isManager) {
      setFormData((prev) => ({ ...prev, employeId: session.employee.id.toString() }))
    }
  }, [participation, isManager, session.employee.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const submitData = {
      ...formData,
      resultat: formData.statut === "Terminé" ? formData.resultat : null,
    }
    await onSubmit(submitData)
    setIsLoading(false)
  }

  const handleValueChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
      <div className="grid grid-cols-1 gap-4">
        {isManager && (
          <div>
            <Label htmlFor="employeId">Employé</Label>
            <Select value={formData.employeId} onValueChange={(value) => handleValueChange("employeId", value)} required>
              <SelectTrigger id="employeId">
                <SelectValue placeholder="Sélectionner un employé" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id.toString()}>{`${emp.prenom} ${emp.nom}`}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <Label htmlFor="formationId">Formation</Label>
          <Select value={formData.formationId} onValueChange={(value) => handleValueChange("formationId", value)} required>
            <SelectTrigger id="formationId">
              <SelectValue placeholder="Sélectionner une formation" />
            </SelectTrigger>
            <SelectContent>
              {formations.map((form) => (
                <SelectItem key={form.id} value={form.id.toString()}>{form.titre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {(isManager || isEditing) && (
          <>
            <div>
              <Label htmlFor="statut">Statut</Label>
              <Select value={formData.statut} onValueChange={(value) => handleValueChange("statut", value)}>
                <SelectTrigger id="statut"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Planifié">Planifié</SelectItem>
                  <SelectItem value="En cours">En cours</SelectItem>
                  <SelectItem value="Terminé">Terminé</SelectItem>
                  <SelectItem value="Annulé">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {formData.statut === "Terminé" && (
               <div>
                <Label htmlFor="resultat">Résultat</Label>
                <Select value={formData.resultat} onValueChange={(value) => handleValueChange("resultat", value)}>
                  <SelectTrigger id="resultat"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Réussi">Réussi</SelectItem>
                    <SelectItem value="Échoué">Échoué</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isEditing ? "Modifier" : "Créer"}
        </Button>
      </div>
    </form>
  )
}