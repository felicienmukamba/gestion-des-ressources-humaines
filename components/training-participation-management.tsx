"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Plus, Search, MoreHorizontal, Edit, Trash2, ArrowLeft } from "lucide-react"
import { ParticipationForm } from "./training-participations-form"

// Type definitions
interface Employee {
  id: number
  nom: string
  prenom: string
}

interface Formation {
  id: number
  titre: string
}

interface Participation {
  id: number
  dateInscription: string
  statut: "Planifié" | "En cours" | "Terminé" | "Annulé"
  resultat: "Réussi" | "Échoué" | "En attente" | null
  employe: Employee
  formation: Formation
  employeId: number
}

interface Session {
  role: { nomRole: string }
  employee: { id: number }
}

export function ParticipationManagement({ session }: { session: Session }) {
  const [participations, setParticipations] = useState<Participation[]>([])
  const [filteredParticipations, setFilteredParticipations] = useState<Participation[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [formations, setFormations] = useState<Formation[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedParticipation, setSelectedParticipation] = useState<Participation | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [participationToDelete, setParticipationToDelete] = useState<Participation | null>(null)
  const router = useRouter()

  const isManager = session.role.nomRole === "Admin" || session.role.nomRole === "RH"

  useEffect(() => {
    fetchParticipations()
    if (isManager) {
      fetchEmployees()
    }
    fetchFormations()
  }, [])

  useEffect(() => {
    const filtered = participations.filter(
      (p) =>
        p.employe.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.employe.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.formation.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.statut.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredParticipations(filtered)
  }, [participations, searchTerm])

  const fetchParticipations = async () => {
    try {
      const response = await fetch("/api/training-participations")
      if (response.ok) {
        setParticipations(await response.json())
      }
    } catch (error) {
      console.error("Error fetching participations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/employees")
      if (response.ok) setEmployees(await response.json())
    } catch (error) {
      console.error("Error fetching employees:", error)
    }
  }

  const fetchFormations = async () => {
    try {
      const response = await fetch("/api/trainings")
      if (response.ok) setFormations(await response.json())
    } catch (error) {
      console.error("Error fetching formations:", error)
    }
  }

  const handleCreate = async (data: any) => {
    try {
      const response = await fetch("/api/participations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (response.ok) {
        await fetchParticipations()
        setIsCreateDialogOpen(false)
      }
    } catch (error) {
      console.error("Error creating participation:", error)
    }
  }

  const handleUpdate = async (data: any) => {
    if (!selectedParticipation) return
    try {
      const response = await fetch(`/api/participations/${selectedParticipation.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (response.ok) {
        await fetchParticipations()
        setIsEditDialogOpen(false)
        setSelectedParticipation(null)
      }
    } catch (error) {
      console.error("Error updating participation:", error)
    }
  }

  const handleDelete = async () => {
    if (!participationToDelete) return
    try {
      const response = await fetch(`/api/participations/${participationToDelete.id}`, { method: "DELETE" })
      if (response.ok) {
        await fetchParticipations()
        setIsDeleteDialogOpen(false)
        setParticipationToDelete(null)
      }
    } catch (error) {
      console.error("Error deleting participation:", error)
    }
  }

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("fr-FR")

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-primary">Gestion des Participations</h1>
            <p className="text-muted-foreground">Suivre les inscriptions aux formations des employés.</p>
          </div>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {isManager ? "Nouvelle Participation" : "S'inscrire à une formation"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{isManager ? "Créer une participation" : "S'inscrire à une formation"}</DialogTitle>
            </DialogHeader>
            <ParticipationForm
              session={session}
              onSubmit={handleCreate}
              onCancel={() => setIsCreateDialogOpen(false)}
              employees={employees}
              formations={formations}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Rechercher</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par employé, formation, statut..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Participations</CardTitle>
          <CardDescription>
            {isManager ? "Gérez toutes les inscriptions." : "Consultez vos inscriptions."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {isManager && <TableHead>Employé</TableHead>}
                  <TableHead>Formation</TableHead>
                  <TableHead>Date d'inscription</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Résultat</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParticipations.map((p) => (
                  <TableRow key={p.id}>
                    {isManager && <TableCell className="font-medium">{`${p.employe.prenom} ${p.employe.nom}`}</TableCell>}
                    <TableCell>{p.formation.titre}</TableCell>
                    <TableCell>{formatDate(p.dateInscription)}</TableCell>
                    <TableCell>
                      <Badge>{p.statut}</Badge>
                    </TableCell>
                    <TableCell>{p.resultat || "N/A"}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setSelectedParticipation(p); setIsEditDialogOpen(true) }}>
                            <Edit className="mr-2 h-4 w-4" /> Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setParticipationToDelete(p); setIsDeleteDialogOpen(true) }} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Supprimer
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Modifier la participation</DialogTitle>
          </DialogHeader>
          {selectedParticipation && (
            <ParticipationForm
              session={session}
              participation={selectedParticipation}
              onSubmit={handleUpdate}
              onCancel={() => { setIsEditDialogOpen(false); setSelectedParticipation(null) }}
              employees={employees}
              formations={formations}
            />
          )}
        </DialogContent>
      </Dialog>
      
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
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}