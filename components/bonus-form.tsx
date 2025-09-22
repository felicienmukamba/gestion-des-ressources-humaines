"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface PrimeFormProps {
  prime?: any
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function PrimeForm({ prime, onSubmit, onCancel }: PrimeFormProps) {
  const [formData, setFormData] = useState({
    nomPrime: prime?.nomPrime || "",
    montantPrime: prime?.montantPrime || "",
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
              <Label htmlFor="nomPrime">Nom de la prime</Label>
              <Input
                id="nomPrime"
                value={formData.nomPrime}
                onChange={(e) => handleChange("nomPrime", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="montantPrime">Montant</Label>
              <Input
                id="montantPrime"
                type="number"
                step="0.01"
                value={formData.montantPrime}
                onChange={(e) => handleChange("montantPrime", e.target.value)}
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
              {prime ? "Modification..." : "Création..."}
            </>
          ) : (
            <>{prime ? "Modifier" : "Créer"}</>
          )}
        </Button>
      </div>
    </form>
  )
}