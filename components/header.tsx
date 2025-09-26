"use client"

import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge, LogOut } from "lucide-react"
import { Button } from "./ui/button"
import router from "next/router"

// Function to get a friendly title from the current path
const getPageTitle = (pathname: string): string => {
  const pathParts = pathname.split('/').filter(Boolean)
  const lastPart = pathParts[pathParts.length - 1]

  switch (lastPart) {
    case 'dashboard':
      return 'Tableau de Bord'
    case 'employees':
      return 'Gestion des Employés'
    case 'leaves':
      return 'Demandes de Congés'
    case 'benefits':
      return 'Avantages'
    case 'payrolls':
      return 'Fiches de Paie'
    case 'formations':
      return 'Gestion des Formations'
    case 'bonuses':
      return 'Primes'
    case 'attendances':
      return 'Présences'
    case 'announcements':
      return 'Annonces'
    case 'roles':
      return 'Gestion des Rôles'
    case 'users':
      return 'Gestion des Utilisateurs'
    default:
      return 'Bienvenue'
  }
}

export function Header() {
  const pathname = usePathname()
  const pageTitle = getPageTitle(pathname)

    const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <header className="sticky top-0 z-10 w-full bg-card/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">REGIDESO - GRH</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>
  )
}
