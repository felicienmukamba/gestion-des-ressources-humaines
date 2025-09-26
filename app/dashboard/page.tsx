"use client"

import type { AuthUser } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Calendar, FileText, GraduationCap, Clock, LogOut, Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import { DashboardStats } from "@/components/dashboard-content"

interface DashboardContentProps {
  user: AuthUser
}

export function DashboardContent({ user }: DashboardContentProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const isAdmin = user.role.nomRole === "Admin" || user.role.nomRole === "RH"

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">REGIDESO - GRH</h1>
            <p className="text-sm text-muted-foreground">
              Bienvenue, {user.employee ? `${user.employee.prenom} ${user.employee.nom}` : user.login}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary">{user.role.nomRole}</Badge>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {isAdmin && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Statistiques du Système</h2>
            <DashboardStats />
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Modules pour Admin/RH */}
          {isAdmin && (
            <>
              <Card
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push("/employees")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Gestion des Employés
                  </CardTitle>
                  <CardDescription>Créer, modifier et gérer les fiches des employés</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Accéder</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Bulletins de Paie
                  </CardTitle>
                  <CardDescription>Générer et gérer les fiches de paie</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Accéder</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Gestion des Présences
                  </CardTitle>
                  <CardDescription>Suivre les heures d'arrivée et de départ</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Accéder</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    Formations
                  </CardTitle>
                  <CardDescription>Organiser et suivre les formations</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Accéder</Button>
                </CardContent>
              </Card>
            </>
          )}

          {/* Modules communs */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/leaves")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Gestion des Congés
              </CardTitle>
              <CardDescription>{isAdmin ? "Approuver les demandes de congé" : "Demander un congé"}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Accéder</Button>
            </CardContent>
          </Card>

          {/* Informations personnelles pour les employés */}
          {user.employee && (
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Mon Profil
                </CardTitle>
                <CardDescription>Consulter mes informations personnelles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Matricule:</strong> {user.employee.matricule}
                  </p>
                  <p>
                    <strong>Service:</strong> {user.employee.service}
                  </p>
                  <p>
                    <strong>Poste:</strong> {user.employee.poste}
                  </p>
                </div>
                <Button className="w-full mt-4">Voir Détails</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
