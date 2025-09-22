"use client"

import { useState, useEffect } from "react"
import type { AuthUser } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import {
  Plus,
  Search,
  MoreHorizontal,
  Check,
  X,
  Eye,
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"
import { LeaveForm } from "./leave-form"
import { LeaveDetails } from "./leave-details"
import { useRouter } from "next/navigation"

interface Leave {
  id: number
  dateDebut: string
  dateFin: string
  motif: string
  statut: string
  employe: {
    id: number
    nom: string
    prenom: string
    matricule: string
    service: string
    poste: string
  }
}

interface LeaveManagementProps {
  user: AuthUser
}

export function LeaveManagement({ user }: LeaveManagementProps) {
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [filteredLeaves, setFilteredLeaves] = useState<Leave[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false)
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject" | null>(null)
  const [leaveToProcess, setLeaveToProcess] = useState<Leave | null>(null)
  const router = useRouter()

  const isAdmin = user.role.nomRole === "Admin" || user.role.nomRole === "RH"

  useEffect(() => {
    fetchLeaves()
  }, [])

  useEffect(() => {
    const filtered = leaves.filter(
      (leave) =>
        leave.employe.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.employe.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.employe.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.motif.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.statut.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredLeaves(filtered)
  }, [leaves, searchTerm])

  const fetchLeaves = async () => {
    try {
      const response = await fetch("/api/leaves")
      if (response.ok) {
        const data = await response.json()
        setLeaves(data)
      }
    } catch (error) {
      console.error("Error fetching leaves:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateLeave = async (leaveData: any) => {
    try {
      const response = await fetch("/api/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leaveData),
      })

      if (response.ok) {
        await fetchLeaves()
        setIsCreateDialogOpen(false)
      }
    } catch (error) {
      console.error("Error creating leave:", error)
    }
  }

  const handleProcessLeave = async () => {
    if (!leaveToProcess || !approvalAction) return

    try {
      const response = await fetch(`/api/leaves/${leaveToProcess.id}/process`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: approvalAction }),
      })

      if (response.ok) {
        await fetchLeaves()
        setIsApprovalDialogOpen(false)
        setLeaveToProcess(null)
        setApprovalAction(null)
      }
    } catch (error) {
      console.error("Error processing leave:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR")
  }

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "En attente":
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            <AlertCircle className="h-3 w-3 mr-1" />
            En attente
          </Badge>
        )
      case "Approuvé":
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approuvé
          </Badge>
        )
      case "Refusé":
        return (
          <Badge variant="outline" className="text-red-600 border-red-600">
            <XCircle className="h-3 w-3 mr-1" />
            Refusé
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getLeaveStats = () => {
    const total = leaves.length
    const pending = leaves.filter((l) => l.statut === "En attente").length
    const approved = leaves.filter((l) => l.statut === "Approuvé").length
    const rejected = leaves.filter((l) => l.statut === "Refusé").length

    return { total, pending, approved, rejected }
  }

  const stats = getLeaveStats()

  // Filtrer les congés selon le rôle
  const myLeaves = leaves.filter((leave) => leave.employe.id === user.employee?.id)
  const pendingLeaves = leaves.filter((leave) => leave.statut === "En attente")

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
            <h1 className="text-3xl font-bold text-primary">Gestion des Congés</h1>
            <p className="text-muted-foreground">
              {isAdmin ? "Gérer les demandes de congé des employés" : "Gérer mes demandes de congé"}
            </p>
          </div>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Demande
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nouvelle demande de congé</DialogTitle>
              <DialogDescription>Remplissez les informations de votre demande de congé</DialogDescription>
            </DialogHeader>
            <LeaveForm user={user} onSubmit={handleCreateLeave} onCancel={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Demandes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isAdmin ? stats.total : myLeaves.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {isAdmin ? stats.pending : myLeaves.filter((l) => l.statut === "En attente").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approuvées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {isAdmin ? stats.approved : myLeaves.filter((l) => l.statut === "Approuvé").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Refusées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {isAdmin ? stats.rejected : myLeaves.filter((l) => l.statut === "Refusé").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content based on role */}
      {isAdmin ? (
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">Toutes les demandes</TabsTrigger>
            <TabsTrigger value="pending">En attente ({pendingLeaves.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {/* Search */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rechercher</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par employé, motif, statut..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* All Leaves Table */}
            <Card>
              <CardHeader>
                <CardTitle>Toutes les Demandes de Congé</CardTitle>
                <CardDescription>Gérez toutes les demandes de congé des employés</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Chargement...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employé</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Période</TableHead>
                        <TableHead>Durée</TableHead>
                        <TableHead>Motif</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLeaves.map((leave) => (
                        <TableRow key={leave.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {leave.employe.prenom} {leave.employe.nom}
                              </div>
                              <div className="text-sm text-muted-foreground">{leave.employe.matricule}</div>
                            </div>
                          </TableCell>
                          <TableCell>{leave.employe.service}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{formatDate(leave.dateDebut)}</div>
                              <div className="text-muted-foreground">au {formatDate(leave.dateFin)}</div>
                            </div>
                          </TableCell>
                          <TableCell>{calculateDuration(leave.dateDebut, leave.dateFin)} jours</TableCell>
                          <TableCell className="max-w-xs truncate">{leave.motif}</TableCell>
                          <TableCell>{getStatusBadge(leave.statut)}</TableCell>
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
                                    setSelectedLeave(leave)
                                    setIsDetailsDialogOpen(true)
                                  }}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  Voir détails
                                </DropdownMenuItem>
                                {leave.statut === "En attente" && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setLeaveToProcess(leave)
                                        setApprovalAction("approve")
                                        setIsApprovalDialogOpen(true)
                                      }}
                                      className="text-green-600"
                                    >
                                      <Check className="mr-2 h-4 w-4" />
                                      Approuver
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setLeaveToProcess(leave)
                                        setApprovalAction("reject")
                                        setIsApprovalDialogOpen(true)
                                      }}
                                      className="text-red-600"
                                    >
                                      <X className="mr-2 h-4 w-4" />
                                      Refuser
                                    </DropdownMenuItem>
                                  </>
                                )}
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
          </TabsContent>

          <TabsContent value="pending" className="space-y-6">
            {/* Pending Leaves */}
            <Card>
              <CardHeader>
                <CardTitle>Demandes en Attente</CardTitle>
                <CardDescription>Demandes nécessitant votre approbation</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingLeaves.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">Aucune demande en attente</div>
                ) : (
                  <div className="space-y-4">
                    {pendingLeaves.map((leave) => (
                      <Card key={leave.id} className="border-l-4 border-l-yellow-500">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">
                                  {leave.employe.prenom} {leave.employe.nom}
                                </h3>
                                <Badge variant="outline">{leave.employe.service}</Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                <div className="flex items-center gap-4">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {formatDate(leave.dateDebut)} - {formatDate(leave.dateFin)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {calculateDuration(leave.dateDebut, leave.dateFin)} jours
                                  </span>
                                </div>
                                <p className="mt-2">{leave.motif}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedLeave(leave)
                                  setIsDetailsDialogOpen(true)
                                }}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Détails
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 border-green-600 hover:bg-green-50 bg-transparent"
                                onClick={() => {
                                  setLeaveToProcess(leave)
                                  setApprovalAction("approve")
                                  setIsApprovalDialogOpen(true)
                                }}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Approuver
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
                                onClick={() => {
                                  setLeaveToProcess(leave)
                                  setApprovalAction("reject")
                                  setIsApprovalDialogOpen(true)
                                }}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Refuser
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        /* Employee View - My Leaves */
        <Card>
          <CardHeader>
            <CardTitle>Mes Demandes de Congé</CardTitle>
            <CardDescription>Historique de vos demandes de congé</CardDescription>
          </CardHeader>
          <CardContent>
            {myLeaves.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Aucune demande de congé</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Période</TableHead>
                    <TableHead>Durée</TableHead>
                    <TableHead>Motif</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myLeaves.map((leave) => (
                    <TableRow key={leave.id}>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatDate(leave.dateDebut)}</div>
                          <div className="text-muted-foreground">au {formatDate(leave.dateFin)}</div>
                        </div>
                      </TableCell>
                      <TableCell>{calculateDuration(leave.dateDebut, leave.dateFin)} jours</TableCell>
                      <TableCell className="max-w-xs truncate">{leave.motif}</TableCell>
                      <TableCell>{getStatusBadge(leave.statut)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedLeave(leave)
                            setIsDetailsDialogOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Détails
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la demande de congé</DialogTitle>
          </DialogHeader>
          {selectedLeave && (
            <LeaveDetails
              leave={selectedLeave}
              onClose={() => {
                setIsDetailsDialogOpen(false)
                setSelectedLeave(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Approval Confirmation Dialog */}
      <AlertDialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {approvalAction === "approve" ? "Approuver la demande" : "Refuser la demande"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir {approvalAction === "approve" ? "approuver" : "refuser"} la demande de congé de{" "}
              <strong>
                {leaveToProcess?.employe.prenom} {leaveToProcess?.employe.nom}
              </strong>{" "}
              du {leaveToProcess && formatDate(leaveToProcess.dateDebut)} au{" "}
              {leaveToProcess && formatDate(leaveToProcess.dateFin)} ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setLeaveToProcess(null)
                setApprovalAction(null)
              }}
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleProcessLeave}
              className={
                approvalAction === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
              }
            >
              {approvalAction === "approve" ? "Approuver" : "Refuser"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
