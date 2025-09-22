"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface Role {
  id: number
  nomRole: string
}

interface EmployeeFormProps {
  employee?: any
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function EmployeeForm({ employee, onSubmit, onCancel }: EmployeeFormProps) {
  const [formData, setFormData] = useState({
    login: "",
    password: "",
    roleId: "",
    matricule: "",
    nom: "",
    prenom: "",
    dateNaissance: "",
    telephone: "",
    service: "",
    poste: "",
    salaireBase: "",
    dateEmbauche: "",
  })
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingRoles, setIsLoadingRoles] = useState(true)

  useEffect(() => {
    fetchRoles()
    if (employee) {
      setFormData({
        login: employee.utilisateur.login,
        password: "",
        roleId: employee.utilisateur.role.id?.toString() || "",
        matricule: employee.matricule,
        nom: employee.nom,
        prenom: employee.prenom,
        dateNaissance: employee.dateNaissance.split("T")[0],
        telephone: employee.telephone,
        service: employee.service,
        poste: employee.poste,
        salaireBase: employee.salaireBase.toString(),
        dateEmbauche: employee.dateEmbauche.split("T")[0],
      })
    }
  }, [employee])

  const fetchRoles = async () => {
    try {
      const response = await fetch("/api/roles")
      if (response.ok) {
        const data = await response.json()
        setRoles(data)
      }
    } catch (error) {
      console.error("Error fetching roles:", error)
    } finally {
      setIsLoadingRoles(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const submitData = {
      ...formData,
      roleId: Number.parseInt(formData.roleId),
      salaireBase: Number.parseFloat(formData.salaireBase),
      dateNaissance: new Date(formData.dateNaissance).toISOString(),
      dateEmbauche: new Date(formData.dateEmbauche).toISOString(),
    }

    await onSubmit(submitData)
    setIsLoading(false)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Informations de connexion */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4">Informations de connexion</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="login">Nom d'utilisateur</Label>
                <Input
                  id="login"
                  value={formData.login}
                  onChange={(e) => handleChange("login", e.target.value)}
                  required
                />
              </div>
              {!employee && (
                <div>
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    required={!employee}
                  />
                </div>
              )}
              <div>
                <Label htmlFor="roleId">Rôle</Label>
                <Select value={formData.roleId} onValueChange={(value) => handleChange("roleId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.nomRole}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations personnelles */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4">Informations personnelles</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="matricule">Matricule</Label>
                <Input
                  id="matricule"
                  value={formData.matricule}
                  onChange={(e) => handleChange("matricule", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="nom">Nom</Label>
                <Input id="nom" value={formData.nom} onChange={(e) => handleChange("nom", e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="prenom">Prénom</Label>
                <Input
                  id="prenom"
                  value={formData.prenom}
                  onChange={(e) => handleChange("prenom", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="dateNaissance">Date de naissance</Label>
                <Input
                  id="dateNaissance"
                  type="date"
                  value={formData.dateNaissance}
                  onChange={(e) => handleChange("dateNaissance", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="telephone">Téléphone</Label>
                <Input
                  id="telephone"
                  value={formData.telephone}
                  onChange={(e) => handleChange("telephone", e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations professionnelles */}
        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4">Informations professionnelles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="service">Service</Label>
                <Input
                  id="service"
                  value={formData.service}
                  onChange={(e) => handleChange("service", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="poste">Poste</Label>
                <Input
                  id="poste"
                  value={formData.poste}
                  onChange={(e) => handleChange("poste", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="salaireBase">Salaire de base (USD)</Label>
                <Input
                  id="salaireBase"
                  type="number"
                  step="0.01"
                  value={formData.salaireBase}
                  onChange={(e) => handleChange("salaireBase", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="dateEmbauche">Date d'embauche</Label>
                <Input
                  id="dateEmbauche"
                  type="date"
                  value={formData.dateEmbauche}
                  onChange={(e) => handleChange("dateEmbauche", e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading || isLoadingRoles}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {employee ? "Modification..." : "Création..."}
            </>
          ) : (
            <>{employee ? "Modifier" : "Créer"}</>
          )}
        </Button>
      </div>
    </form>
  )
}
