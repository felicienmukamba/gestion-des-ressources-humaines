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
import { getSession } from "@/lib/session"
import { ParticipationFormationForm } from "./training-participations-form"

interface Utilisateur {
  nom: string
  prenom: string
}

interface Employe {
  id: number
  utilisateur: Utilisateur
}

interface Formation {
  id: number
  titre: string
}

interface ParticipationFormation {
  id: number
  employe: Employe
  formation: Formation
  statut: string
  resultat: string
  dateInscription: string
}

export function ParticipationsFormationManagement() {
  const [participations, setParticipations] = useState<ParticipationFormation[]>([])
  const [filteredParticipations, setFilteredParticipations] = useState<ParticipationFormation[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedParticipation, setSelectedParticipation] = useState<ParticipationFormation | null>(null)
  const [participationToDelete, setParticipationToDelete] = useState<ParticipationFormation | null>(null)
  const [session, setSession] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchSessionAndData = async () => {
      const sessionData = await getSession()
      setSession(sessionData)
      if (sessionData) {
        fetchParticipations(sessionData)
      } else {
        router.push("/login")
      }
    }
    fetchSessionAndData()
  }, [])

  useEffect(() => {
    const filtered = participations.filter(
      (p) =>
        p.employe.utilisateur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.employe.utilisateur.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.formation.titre.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredParticipations(filtered)
  }, [participations, searchTerm])

  const fetchParticipations = async (currentSession: any) => {
    try {
      let url = "/api/participations-formation"
      // Si l'utilisateur est un employé, on ne récupère que ses participations
      if (currentSession.role.nomRole === "Employee") {
        url += `?employeId=${currentSession.employee.id}`
      }

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setParticipations(data)
      }
    } catch (error) {
      console.error("Error fetching participations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateParticipation = async (participationData: any) => {
    try {
      const response = await fetch("/api/participations-formation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(participationData),
      })

      if (response.ok) {
        await fetchParticipations(session)
        setIsCreateDialogOpen(false)
      }
    } catch (error) {
      console.error("Error creating participation:", error)
    }
  }

  const handleUpdateParticipation = async (participationData: any) => {
    if (!selectedParticipation) return

    try {
      const response = await fetch(`/api/participations-formation/${selectedParticipation.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(participationData),
      })

      if (response.ok) {
        await fetchParticipations(session)
        setIsEditDialogOpen(false)
        setSelectedParticipation(null)
      }
    } catch (error) {
      console.error("Error updating participation:", error)
    }
  }

  const handleDeleteParticipation = async () => {
    if (!participationToDelete) return

    try {
      const response = await fetch(`/api/participations-formation/${participationToDelete.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchParticipations(session)
        setIsDeleteDialogOpen(false)
        setParticipationToDelete(null)
      }
    } catch (error) {
      console.error("Error deleting participation:", error)
    }
  }

  const isManagementRole = session && (session.role.nomRole === "Admin" || session.role.nomRole === "RH")
  const isEmployeeRole = session && session.role.nomRole === "Employee"

  if (!session) {
    return null
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
            <h1 className="text-3xl font-bold text-primary">
              {isManagementRole ? "Gestion des Participations" : "Mes Participations aux Formations"}
            </h1>
            <p className="text-muted-foreground">
              {isManagementRole ? "Gérer les inscriptions et les résultats des formations" : "Consulter et s'inscrire à des formations"}
            </p>
          </div>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              S'inscrire à une formation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Inscription à une formation</DialogTitle>
              <DialogDescription>Remplissez les informations pour vous inscrire</DialogDescription>
            </DialogHeader>
            <ParticipationFormationForm
              onSubmit={handleCreateParticipation}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, prénom ou formation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Participations</CardTitle>
          <CardDescription>Consultez l'historique des formations</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {isManagementRole && <TableHead>Employé</TableHead>}
                  <TableHead>Formation</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Résultat</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParticipations.map((p) => (
                  <TableRow key={p.id}>
                    {isManagementRole && (
                      <TableCell className="font-medium">{`${p.employe.utilisateur.prenom} ${p.employe.utilisateur.nom}`}</TableCell>
                    )}
                    <TableCell>{p.formation.titre}</TableCell>
                    <TableCell>{p.statut}</TableCell>
                    <TableCell>{p.resultat}</TableCell>
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
                              setSelectedParticipation(p)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setParticipationToDelete(p)
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
            <DialogTitle>Modifier la participation</DialogTitle>
            <DialogDescription>Modifiez les informations de la participation</DialogDescription>
          </DialogHeader>
          {selectedParticipation && (
            <ParticipationFormationForm
              participation={selectedParticipation}
              onSubmit={handleUpdateParticipation}
              onCancel={() => {
                setIsEditDialogOpen(false)
                setSelectedParticipation(null)
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
              Êtes-vous sûr de vouloir supprimer cette participation ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setParticipationToDelete(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteParticipation} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}