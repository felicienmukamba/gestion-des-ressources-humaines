"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface AvantageFormProps {
  avantage?: any
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function AvantageForm({ avantage, onSubmit, onCancel }: AvantageFormProps) {
  const [formData, setFormData] = useState({
    nomAvantages: avantage?.nomAvantages || "",
    montantAvantages: avantage?.montantAvantages || "",
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
              <Label htmlFor="nomAvantages">Nom de l'avantage</Label>
              <Input
                id="nomAvantages"
                value={formData.nomAvantages}
                onChange={(e) => handleChange("nomAvantages", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="montantAvantages">Montant</Label>
              <Input
                id="montantAvantages"
                type="number"
                step="0.01"
                value={formData.montantAvantages}
                onChange={(e) => handleChange("montantAvantages", e.target.value)}
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
              {avantage ? "Modification..." : "Création..."}
            </>
          ) : (
            <>{avantage ? "Modifier" : "Créer"}</>
          )}
        </Button>
      </div>
    </form>
  )
}