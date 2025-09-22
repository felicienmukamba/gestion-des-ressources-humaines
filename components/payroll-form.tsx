"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Checkbox } from "@/components/ui/checkbox"

interface Employee {
  id: number
  nom: string
  prenom: string
}

interface Avantage {
  id: number
  nomAvantages: string
}

interface Prime {
  id: number
  nomPrime: string
}

interface FicheDePaieFormProps {
  fiche?: any
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function FicheDePaieForm({ fiche, onSubmit, onCancel }: FicheDePaieFormProps) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [avantages, setAvantages] = useState<Avantage[]>([])
  const [primes, setPrimes] = useState<Prime[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    employeId: fiche?.employeId.toString() || "",
    mois: fiche?.mois ? new Date(fiche.mois).toISOString().substring(0, 7) : "",
    annee: fiche?.annee || "",
    motif: fiche?.motif || "",
    statut: fiche?.statut || "Non payée",
    avantageIds: fiche?.avantages.map((a: any) => a.id) || [],
    primeIds: fiche?.primes.map((p: any) => p.id) || [],
  })

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true)
      try {
        const [employeesRes, avantagesRes, primesRes] = await Promise.all([
          fetch("/api/employees"),
          fetch("/api/avantages"),
          fetch("/api/primes"),
        ])

        const [employeesData, avantagesData, primesData] = await Promise.all([
          employeesRes.json(),
          avantagesRes.json(),
          primesRes.json(),
        ])

        setEmployees(employeesData)
        setAvantages(avantagesData)
        setPrimes(primesData)
      } catch (error) {
        console.error("Error fetching form data:", error)
      } finally {
        setIsLoadingData(false)
      }
    }
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const submitData = {
      ...formData,
      employeId: parseInt(formData.employeId),
      annee: parseInt(formData.annee.toString()),
      mois: `${formData.mois}-01T00:00:00.000Z`,
    }
    await onSubmit(submitData)
    setIsSubmitting(false)
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
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
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id.toString()}>
                      {`${employee.prenom} ${employee.nom}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mois">Mois</Label>
                <Input
                  id="mois"
                  type="month"
                  value={formData.mois}
                  onChange={(e) => handleChange("mois", e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div>
                <Label htmlFor="annee">Année</Label>
                <Input
                  id="annee"
                  type="number"
                  value={formData.annee}
                  onChange={(e) => handleChange("annee", e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="motif">Motif</Label>
              <Input
                id="motif"
                value={formData.motif}
                onChange={(e) => handleChange("motif", e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label>Statut</Label>
              <ToggleGroup
                type="single"
                value={formData.statut}
                onValueChange={(value) => handleChange("statut", value)}
                disabled={isSubmitting}
                className="mt-2"
              >
                <ToggleGroupItem value="Payée" className="w-1/2">
                  Payée
                </ToggleGroupItem>
                <ToggleGroupItem value="Non payée" className="w-1/2">
                  Non payée
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div>
              <Label>Avantages</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {avantages.map((avantage) => (
                  <div key={avantage.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`avantage-${avantage.id}`}
                      checked={formData.avantageIds.includes(avantage.id)}
                      onCheckedChange={(checked) => {
                        const newAvantageIds = checked
                          ? [...formData.avantageIds, avantage.id]
                          : formData.avantageIds.filter((id: number) => id !== avantage.id)
                        handleChange("avantageIds", newAvantageIds)
                      }}
                      disabled={isSubmitting}
                    />
                    <label htmlFor={`avantage-${avantage.id}`}>{avantage.nomAvantages}</label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label>Primes</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {primes.map((prime) => (
                  <div key={prime.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`prime-${prime.id}`}
                      checked={formData.primeIds.includes(prime.id)}
                      onCheckedChange={(checked) => {
                        const newPrimeIds = checked
                          ? [...formData.primeIds, prime.id]
                          : formData.primeIds.filter((id: number) => id !== prime.id)
                        handleChange("primeIds", newPrimeIds)
                      }}
                      disabled={isSubmitting}
                    />
                    <label htmlFor={`prime-${prime.id}`}>{prime.nomPrime}</label>
                  </div>
                ))}
              </div>
            </div>
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
              {fiche ? "Modification..." : "Création..."}
            </>
          ) : (
            <>{fiche ? "Modifier" : "Créer"}</>
          )}
        </Button>
      </div>
    </form>
  )
}