"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { getSession } from "@/lib/session"

interface Employe {
  id: number
  nom: string
  prenom: string
}

interface Formation {
  id: number
  titre: string
}

interface ParticipationFormationFormProps {
  participation?: any
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function ParticipationFormationForm({ participation, onSubmit, onCancel }: ParticipationFormationFormProps) {
  const [employees, setEmployees] = useState<Employe[]>([])
  const [formations, setFormations] = useState<Formation[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [session, setSession] = useState<any>(null)

  const [formData, setFormData] = useState({
    employeId: participation?.employeId.toString() || "",
    formationId: participation?.formationId.toString() || "",
    statut: participation?.statut || "Planifié",
    resultat: participation?.resultat || "En attente",
  })

  useEffect(() => {
    const fetchSessionAndData = async () => {
      setIsLoadingData(true)
      const sessionData = await getSession()
      setSession(sessionData)

      try {
        if (sessionData && sessionData.role.nomRole !== "Employee") {
          const employeesRes = await fetch("/api/employees")
          const employeesData = await employeesRes.json()
          setEmployees(employeesData)
        }

        const formationsRes = await fetch("/api/formations")
        const formationsData = await formationsRes.json()
        setFormations(formationsData)

      } catch (error) {
        console.error("Error fetching form data:", error)
      } finally {
        setIsLoadingData(false)
      }
    }
    fetchSessionAndData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const submitData = {
      ...formData,
      formationId: parseInt(formData.formationId),
      employeId: session.role.nomRole === "Employee" ? session.employee.id : parseInt(formData.employeId),
    }

    await onSubmit(submitData)
    setIsSubmitting(false)
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const isManagementRole = session && (session.role.nomRole === "Admin" || session.role.nomRole === "RH")

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {isManagementRole && (
              <div>
                <Label htmlFor="employeId">Employé</Label>
                <Select
                  value={formData.employeId}
                  onValueChange={(value) => handleChange("employeId", value)}
                  disabled={isLoadingData || isSubmitting}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un employé" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((e) => (
                      <SelectItem key={e.id} value={e.id.toString()}>
                        {`${e.prenom} ${e.nom}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label htmlFor="formationId">Formation</Label>
              <Select
                value={formData.formationId}
                onValueChange={(value) => handleChange("formationId", value)}
                disabled={isLoadingData || isSubmitting}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une formation" />
                </SelectTrigger>
                <SelectContent>
                  {formations.map((f) => (
                    <SelectItem key={f.id} value={f.id.toString()}>
                      {f.titre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {isManagementRole && (
              <>
                <div>
                  <Label htmlFor="statut">Statut</Label>
                  <Select
                    value={formData.statut}
                    onValueChange={(value) => handleChange("statut", value)}
                    disabled={isSubmitting}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Planifié">Planifié</SelectItem>
                      <SelectItem value="En cours">En cours</SelectItem>
                      <SelectItem value="Terminé">Terminé</SelectItem>
                      <SelectItem value="Annulé">Annulé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="resultat">Résultat</Label>
                  <Select
                    value={formData.resultat}
                    onValueChange={(value) => handleChange("resultat", value)}
                    disabled={isSubmitting}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un résultat" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="En attente">En attente</SelectItem>
                      <SelectItem value="Réussi">Réussi</SelectItem>
                      <SelectItem value="Échoué">Échoué</SelectItem>
                      <SelectItem value="Absent">Absent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting || isLoadingData}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {participation ? "Modification..." : "Inscription..."}
            </>
          ) : (
            <>{participation ? "Modifier" : "S'inscrire"}</>
          )}
        </Button>
      </div>
    </form>
  )
}