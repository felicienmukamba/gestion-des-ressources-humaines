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
import { AvantageForm } from "./benefit-form"

interface Avantage {
  id: number
  nomAvantages: string
  montantAvantages: number
}

export function AvantageManagement() {
  const [avantages, setAvantages] = useState<Avantage[]>([])
  const [filteredAvantages, setFilteredAvantages] = useState<Avantage[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedAvantage, setSelectedAvantage] = useState<Avantage | null>(null)
  const [avantageToDelete, setAvantageToDelete] = useState<Avantage | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchAvantages()
  }, [])

  useEffect(() => {
    const filtered = avantages.filter(
      (avantage) =>
        avantage.nomAvantages.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredAvantages(filtered)
  }, [avantages, searchTerm])

  const fetchAvantages = async () => {
    try {
      const response = await fetch("/api/benefits")
      if (response.ok) {
        const data = await response.json()
        setAvantages(data)
      }
    } catch (error) {
      console.error("Error fetching avantages:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateAvantage = async (avantageData: any) => {
    try {
      const response = await fetch("/api/benefits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(avantageData),
      })

      if (response.ok) {
        await fetchAvantages()
        setIsCreateDialogOpen(false)
      }
    } catch (error) {
      console.error("Error creating avantage:", error)
    }
  }

  const handleUpdateAvantage = async (avantageData: any) => {
    if (!selectedAvantage) return

    try {
      const response = await fetch(`/api/benefits/${selectedAvantage.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(avantageData),
      })

      if (response.ok) {
        await fetchAvantages()
        setIsEditDialogOpen(false)
        setSelectedAvantage(null)
      }
    } catch (error) {
      console.error("Error updating avantage:", error)
    }
  }

  const handleDeleteAvantage = async () => {
    if (!avantageToDelete) return

    try {
      const response = await fetch(`/api/benefits/${avantageToDelete.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchAvantages()
        setIsDeleteDialogOpen(false)
        setAvantageToDelete(null)
      }
    } catch (error) {
      console.error("Error deleting avantage:", error)
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
            <h1 className="text-3xl font-bold text-primary">Gestion des Avantages</h1>
            <p className="text-muted-foreground">Créer, modifier et supprimer les avantages</p>
          </div>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvel Avantage
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Créer un nouvel avantage</DialogTitle>
              <DialogDescription>Remplissez les informations de l'avantage</DialogDescription>
            </DialogHeader>
            <AvantageForm onSubmit={handleCreateAvantage} onCancel={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom d'avantage..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Avantage Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Avantages</CardTitle>
          <CardDescription>Gérez les avantages de l'entreprise</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom de l'avantage</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAvantages.map((avantage) => (
                  <TableRow key={avantage.id}>
                    <TableCell className="font-medium">{avantage.nomAvantages}</TableCell>
                    <TableCell>{avantage.montantAvantages.toFixed(2)} €</TableCell>
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
                              setSelectedAvantage(avantage)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setAvantageToDelete(avantage)
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
            <DialogTitle>Modifier l'avantage</DialogTitle>
            <DialogDescription>Modifiez les informations de l'avantage</DialogDescription>
          </DialogHeader>
          {selectedAvantage && (
            <AvantageForm
              avantage={selectedAvantage}
              onSubmit={handleUpdateAvantage}
              onCancel={() => {
                setIsEditDialogOpen(false)
                setSelectedAvantage(null)
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
              Êtes-vous sûr de vouloir supprimer l'avantage "<strong>{avantageToDelete?.nomAvantages}</strong>" ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAvantageToDelete(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAvantage} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}