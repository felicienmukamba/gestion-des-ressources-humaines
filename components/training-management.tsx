"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Search, MoreHorizontal, Edit, Trash2, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { FormationForm } from "./trainnig-form"

interface Formation {
  id: number
  titre: string
  description: string
  dureeHeures: number
}

export function FormationManagement() {
  const [formations, setFormations] = useState<Formation[]>([])
  const [filteredFormations, setFilteredFormations] = useState<Formation[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null)
  const [formationToDelete, setFormationToDelete] = useState<Formation | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchFormations()
  }, [])

  useEffect(() => {
    const filtered = formations.filter(
      (formation) =>
        formation.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formation.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredFormations(filtered)
  }, [formations, searchTerm])

  const fetchFormations = async () => {
    try {
      const response = await fetch("/api/trainings")
      if (response.ok) {
        const data = await response.json()
        setFormations(data)
      }
    } catch (error) {
      console.error("Error fetching formations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateFormation = async (formationData: any) => {
    try {
      const response = await fetch("/api/trainings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formationData),
      })

      if (response.ok) {
        await fetchFormations()
        setIsCreateDialogOpen(false)
      }
    } catch (error) {
      console.error("Error creating formation:", error)
    }
  }

  const handleUpdateFormation = async (formationData: any) => {
    if (!selectedFormation) return

    try {
      const response = await fetch(`/api/trainings/${selectedFormation.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formationData),
      })

      if (response.ok) {
        await fetchFormations()
        setIsEditDialogOpen(false)
        setSelectedFormation(null)
      }
    } catch (error) {
      console.error("Error updating formation:", error)
    }
  }

  const handleDeleteFormation = async () => {
    if (!formationToDelete) return

    try {
      const response = await fetch(`/api/trainings/${formationToDelete.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchFormations()
        setIsDeleteDialogOpen(false)
        setFormationToDelete(null)
      }
    } catch (error) {
      console.error("Error deleting formation:", error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-primary">Gestion des Formations</h1>
            <p className="text-muted-foreground">Créer, modifier et supprimer les programmes de formation</p>
          </div>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Formation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle formation</DialogTitle>
              <DialogDescription>Remplissez les informations de la formation</DialogDescription>
            </DialogHeader>
            <FormationForm onSubmit={handleCreateFormation} onCancel={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par titre ou description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Formation Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Formations</CardTitle>
          <CardDescription>Gérez les formations disponibles</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Durée (heures)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFormations.map((formation) => (
                  <TableRow key={formation.id}>
                    <TableCell className="font-medium">{formation.titre}</TableCell>
                    <TableCell className="max-w-[300px] overflow-hidden text-ellipsis whitespace-nowrap">
                      {formation.description}
                    </TableCell>
                    <TableCell>{formation.dureeHeures}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedFormation(formation)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setFormationToDelete(formation)
                              setIsDeleteDialogOpen(true)
                            }}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Modifier la formation</DialogTitle>
            <DialogDescription>Modifiez les informations de la formation</DialogDescription>
          </DialogHeader>
          {selectedFormation && (
            <FormationForm
              formation={selectedFormation}
              onSubmit={handleUpdateFormation}
              onCancel={() => {
                setIsEditDialogOpen(false)
                setSelectedFormation(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer la formation "<strong>{formationToDelete?.titre}</strong>" ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setFormationToDelete(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFormation} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}