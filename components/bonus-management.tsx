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
import { PrimeForm } from "./bonus-form"

interface Prime {
  id: number
  nomPrime: string
  montantPrime: number
}

export function PrimeManagement() {
  const [primes, setPrimes] = useState<Prime[]>([])
  const [filteredPrimes, setFilteredPrimes] = useState<Prime[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedPrime, setSelectedPrime] = useState<Prime | null>(null)
  const [primeToDelete, setPrimeToDelete] = useState<Prime | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchPrimes()
  }, [])

  useEffect(() => {
    const filtered = primes.filter(
      (prime) =>
        prime.nomPrime.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredPrimes(filtered)
  }, [primes, searchTerm])

  const fetchPrimes = async () => {
    try {
      const response = await fetch("/api/bonuses")
      if (response.ok) {
        const data = await response.json()
        setPrimes(data)
      }
    } catch (error) {
      console.error("Error fetching primes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreatePrime = async (primeData: any) => {
    try {
      const response = await fetch("/api/bonuses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(primeData),
      })

      if (response.ok) {
        await fetchPrimes()
        setIsCreateDialogOpen(false)
      }
    } catch (error) {
      console.error("Error creating prime:", error)
    }
  }

  const handleUpdatePrime = async (primeData: any) => {
    if (!selectedPrime) return

    try {
      const response = await fetch(`/api/bonuses/${selectedPrime.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(primeData),
      })

      if (response.ok) {
        await fetchPrimes()
        setIsEditDialogOpen(false)
        setSelectedPrime(null)
      }
    } catch (error) {
      console.error("Error updating prime:", error)
    }
  }

  const handleDeletePrime = async () => {
    if (!primeToDelete) return

    try {
      const response = await fetch(`/api/bonuses/${primeToDelete.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchPrimes()
        setIsDeleteDialogOpen(false)
        setPrimeToDelete(null)
      }
    } catch (error) {
      console.error("Error deleting prime:", error)
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
            <h1 className="text-3xl font-bold text-primary">Gestion des Primes</h1>
            <p className="text-muted-foreground">Créer, modifier et supprimer les primes</p>
          </div>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Prime
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle prime</DialogTitle>
              <DialogDescription>Remplissez les informations de la prime</DialogDescription>
            </DialogHeader>
            <PrimeForm onSubmit={handleCreatePrime} onCancel={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom de prime..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Prime Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Primes</CardTitle>
          <CardDescription>Gérez les primes de l'entreprise</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom de la prime</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrimes.map((prime) => (
                  <TableRow key={prime.id}>
                    <TableCell className="font-medium">{prime.nomPrime}</TableCell>
                    <TableCell>{prime.montantPrime.toFixed(2)} €</TableCell>
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
                              setSelectedPrime(prime)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setPrimeToDelete(prime)
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
            <DialogTitle>Modifier la prime</DialogTitle>
            <DialogDescription>Modifiez les informations de la prime</DialogDescription>
          </DialogHeader>
          {selectedPrime && (
            <PrimeForm
              prime={selectedPrime}
              onSubmit={handleUpdatePrime}
              onCancel={() => {
                setIsEditDialogOpen(false)
                setSelectedPrime(null)
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
              Êtes-vous sûr de vouloir supprimer la prime "<strong>{primeToDelete?.nomPrime}</strong>" ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPrimeToDelete(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePrime} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}