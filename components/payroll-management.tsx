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
import { Plus, Search, MoreHorizontal, Edit, Trash2, ArrowLeft, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { fr } from 'date-fns/locale' // Correction: Import de la locale française
import { FicheDePaieForm } from "./payroll-form"
import { FicheDePaieViewer } from "./FicheDePaieViewer"

interface Employe {
  id: number
  nom: string
  prenom: string
}

interface Avantage {
  id: number
  nomAvantages: string
  montantAvantages: number
}

interface Prime {
  id: number
  nomPrime: string
  montantPrime: number
}

interface FicheDePaie {
  id: number
  employe: Employe
  mois: string
  annee: number
  motif: string
  statut: string
  avantages: Avantage[]
  primes: Prime[]
}

export function FicheDePaieManagement() {
  const [fiches, setFiches] = useState<FicheDePaie[]>([])
  const [filteredFiches, setFilteredFiches] = useState<FicheDePaie[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedFiche, setSelectedFiche] = useState<FicheDePaie | null>(null)
  const [ficheToDelete, setFicheToDelete] = useState<FicheDePaie | null>(null)
  const router = useRouter()

    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [ficheToView, setFicheToView] = useState<FicheDePaie | null>(null)

  useEffect(() => {
    fetchFiches()
  }, [])

  useEffect(() => {
    const filtered = fiches.filter(
      (fiche) =>
        fiche.employe.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fiche.employe.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fiche.motif.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredFiches(filtered)
  }, [fiches, searchTerm])

  const fetchFiches = async () => {
    try {
      const response = await fetch("/api/payrolls")
      if (response.ok) {
        const data = await response.json()
        setFiches(data)
      }
    } catch (error) {
      console.error("Error fetching fiches de paie:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateFiche = async (ficheData: any) => {
    try {
      const response = await fetch("/api/payrolls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ficheData),
      })
      if (response.ok) {
        await fetchFiches()
        setIsCreateDialogOpen(false)
      }
    } catch (error) {
      console.error("Error creating fiche de paie:", error)
    }
  }

  const handleUpdateFiche = async (ficheData: any) => {
    if (!selectedFiche) return
    try {
      const response = await fetch(`/api/payrolls/${selectedFiche.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ficheData),
      })
      if (response.ok) {
        await fetchFiches()
        setIsEditDialogOpen(false)
        setSelectedFiche(null)
      }
    } catch (error) {
      console.error("Error updating fiche de paie:", error)
    }
  }

  const handleDeleteFiche = async () => {
    if (!ficheToDelete) return
    try {
      const response = await fetch(`/api/payrolls/${ficheToDelete.id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        await fetchFiches()
        setIsDeleteDialogOpen(false)
        setFicheToDelete(null)
      }
    } catch (error) {
      console.error("Error deleting fiche de paie:", error)
    }
  }

  const formatMois = (dateString: string) => {
    return format(new Date(dateString), "MMMM", { locale: fr }) // Correction: Utilisation de l'objet 'fr' importé
  }

  const getAvantagesSummary = (avantages: Avantage[]) => {
    return avantages.map(a => a.nomAvantages).join(", ")
  }

  const getPrimesSummary = (primes: Prime[]) => {
    return primes.map(p => p.nomPrime).join(", ")
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
            <h1 className="text-3xl font-bold text-primary">Gestion des Fiches de Paie</h1>
            <p className="text-muted-foreground">Créer, modifier et gérer les fiches de paie des employés</p>
          </div>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Fiche de Paie
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle fiche de paie</DialogTitle>
              <DialogDescription>Remplissez les informations de la fiche</DialogDescription>
            </DialogHeader>
            <FicheDePaieForm onSubmit={handleCreateFiche} onCancel={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom d'employé ou motif..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Fiche de Paie Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Fiches de Paie</CardTitle>
          <CardDescription>Consultez et gérez les fiches de paie</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employé</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead>Motif</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Avantages</TableHead>
                  <TableHead>Primes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFiches.map((fiche) => (
                  <TableRow key={fiche.id}>
                    <TableCell className="font-medium">{`${fiche.employe.prenom} ${fiche.employe.nom}`}</TableCell>
                    <TableCell>{`${formatMois(fiche.mois)} ${fiche.annee}`}</TableCell>
                    <TableCell>{fiche.motif}</TableCell>
                    <TableCell>{fiche.statut}</TableCell>
                    <TableCell className="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap">
                      {getAvantagesSummary(fiche.avantages)}
                    </TableCell>
                    <TableCell className="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap">
                      {getPrimesSummary(fiche.primes)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {/* AJOUT: Bouton Visualiser */}
                          <DropdownMenuItem onClick={() => { setFicheToView(fiche); setIsViewDialogOpen(true); }}>
                            <Eye className="mr-2 h-4 w-4" />
                            Visualiser
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem onClick={() => { setSelectedFiche(fiche); setIsEditDialogOpen(true); }}>
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setFicheToDelete(fiche); setIsDeleteDialogOpen(true); }} className="text-destructive">
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
            <DialogTitle>Modifier la fiche de paie</DialogTitle>
            <DialogDescription>Modifiez les informations de la fiche</DialogDescription>
          </DialogHeader>
          {selectedFiche && (
            <FicheDePaieForm
              fiche={selectedFiche}
              onSubmit={handleUpdateFiche}
              onCancel={() => {
                setIsEditDialogOpen(false)
                setSelectedFiche(null)
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
              Êtes-vous sûr de vouloir supprimer cette fiche de paie ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setFicheToDelete(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFiche} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

            {/* AJOUT: Modale de visualisation du PDF */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Aperçu de la Fiche de Paie</DialogTitle>
            <DialogDescription>
              {ficheToView ? `Fiche de paie pour ${ficheToView.employe.prenom} ${ficheToView.employe.nom}` : ""}
            </DialogDescription>
          </DialogHeader>
          {ficheToView && <FicheDePaieViewer fiche={ficheToView} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
