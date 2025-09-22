"use client"

import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

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

  return (
    <header className="sticky top-0 z-10 w-full bg-card/80 backdrop-blur-md">
      <div className="flex items-center justify-between p-4 md:px-6">
        <h1 className="text-xl font-bold">{pageTitle}</h1>
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </div>
      </div>
      <Separator />
    </header>
  )
}
