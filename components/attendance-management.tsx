"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Search, MoreHorizontal, Edit, Trash2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { AttendanceForm } from "./attendance-form";
import { getSession } from "@/lib/session";

interface Employee {
  id: number;
  nom: string;
  prenom: string;
}

interface Attendance {
  id: number;
  dateJournee: string;
  heureArrivee: string | null;
  heureDepart: string | null;
  employe: Employee;
}

export function AttendanceManagement() {
  
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [filteredAttendances, setFilteredAttendances] = useState<Attendance[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);
  const [attendanceToDelete, setAttendanceToDelete] = useState<Attendance | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchAttendances();
  }, []);

  useEffect(() => {
    const filtered = attendances.filter(
      (attendance) =>
        attendance.employe.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attendance.employe.prenom.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAttendances(filtered);
  }, [attendances, searchTerm]);

  const fetchAttendances = async () => {
    try {
      const response = await fetch("/api/attendances");
      if (response.ok) {
        const data = await response.json();
        setAttendances(data);
      }
    } catch (error) {
      console.error("Error fetching attendances:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAttendance = async (attendanceData: any) => {
    try {
      const response = await fetch("/api/attendances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attendanceData),
      });
      if (response.ok) {
        await fetchAttendances();
        setIsCreateDialogOpen(false);
      }
    } catch (error) {
      console.error("Error creating attendance:", error);
    }
  };

  const handleUpdateAttendance = async (attendanceData: any) => {
    if (!selectedAttendance) return;
    try {
      const response = await fetch(`/api/attendances/${selectedAttendance.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attendanceData),
      });
      if (response.ok) {
        await fetchAttendances();
        setIsEditDialogOpen(false);
        setSelectedAttendance(null);
      }
    } catch (error) {
      console.error("Error updating attendance:", error);
    }
  };

  const handleDeleteAttendance = async () => {
    if (!attendanceToDelete) return;
    try {
      const response = await fetch(`/api/attendances/${attendanceToDelete.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        await fetchAttendances();
        setIsDeleteDialogOpen(false);
        setAttendanceToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting attendance:", error);
    }
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "-";
    return format(new Date(dateString), "HH:mm");
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMMM yyyy");
  };

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
            <h1 className="text-3xl font-bold text-primary">Gestion des Présences</h1>
            <p className="text-muted-foreground">Enregistrer et gérer les fiches de présence</p>
          </div>
        </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle Présence
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Enregistrer une présence</DialogTitle>
                <DialogDescription>Remplissez les informations de présence</DialogDescription>
              </DialogHeader>
              <AttendanceForm onSubmit={handleCreateAttendance} onCancel={() => setIsCreateDialogOpen(false)} />
            </DialogContent>
          </Dialog>
      </div>

      {/* Search */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom d'employé..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Présences</CardTitle>
          <CardDescription>Consultez les enregistrements de présence</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom de l'employé</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Heure d'arrivée</TableHead>
                  <TableHead>Heure de départ</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttendances.map((attendance) => (
                  <TableRow key={attendance.id}>
                    <TableCell className="font-medium">{`${attendance.employe.prenom} ${attendance.employe.nom}`}</TableCell>
                    <TableCell>{formatDate(attendance.dateJournee)}</TableCell>
                    <TableCell>{formatDateTime(attendance.heureArrivee)}</TableCell>
                    <TableCell>{formatDateTime(attendance.heureDepart)}</TableCell>
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
                              setSelectedAttendance(attendance);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setAttendanceToDelete(attendance);
                                setIsDeleteDialogOpen(true);
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
            <DialogTitle>Modifier la présence</DialogTitle>
            <DialogDescription>Modifiez les informations de présence</DialogDescription>
          </DialogHeader>
          {selectedAttendance && (
            <AttendanceForm
              attendance={selectedAttendance}
              onSubmit={handleUpdateAttendance}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedAttendance(null);
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
              Êtes-vous sûr de vouloir supprimer cette présence ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAttendanceToDelete(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAttendance} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
