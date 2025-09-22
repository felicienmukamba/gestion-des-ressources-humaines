"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface FormationFormProps {
  formation?: any
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function FormationForm({ formation, onSubmit, onCancel }: FormationFormProps) {
  const [formData, setFormData] = useState({
    titre: formation?.titre || "",
    description: formation?.description || "",
    dureeHeures: formation?.dureeHeures || "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await onSubmit(formData)
    setIsLoading(false)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="titre">Titre</Label>
              <Input
                id="titre"
                value={formData.titre}
                onChange={(e) => handleChange("titre", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="dureeHeures">Durée (heures)</Label>
              <Input
                id="dureeHeures"
                type="number"
                value={formData.dureeHeures}
                onChange={(e) => handleChange("dureeHeures", e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {formation ? "Modification..." : "Création..."}
            </>
          ) : (
            <>{formation ? "Modifier" : "Créer"}</>
          )}
        </Button>
      </div>
    </form>
  )
}