"use client"

import type { AuthUser } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight, ChevronRight, Menu, LogOut, Settings } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Annonce, Prisma } from "@prisma/client"
import Image from "next/image"

interface HomeContentProps {
  announcements: Annonce[]
  user: AuthUser
}

export function HomeContent({ announcements, user }: HomeContentProps) {
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

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-blue-700">REGIDESO - GRH</h1>
            <Badge variant="secondary">{user.role.nomRole}</Badge>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-sm font-medium hidden md:flex" onClick={() => router.push("/dashboard")}>
              Tableau de Bord
            </Button>
            <Button variant="ghost" className="text-sm font-medium hidden md:flex" onClick={() => router.push("/leaves")}>
              Congés
            </Button>
            <Button variant="ghost" className="text-sm font-medium hidden md:flex" onClick={() => router.push("/settings")}>
              <Settings className="h-4 w-4 mr-2" />
              Profil
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </nav>
      </header>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative h-[60vh] md:h-[80vh] bg-blue-700 text-white flex items-center justify-center overflow-hidden">
          {/* Background image placeholder */}
          <div className="absolute inset-0 z-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: "url('https://placehold.co/1920x1080/007bff/ffffff?text=REGIDESO')" }}></div>
          
          <div className="relative z-10 text-center px-4">
            <h2 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">
              Gestion des Ressources Humaines
            </h2>
            <p className="text-lg md:text-xl font-light max-w-2xl mx-auto mb-8">
              Simplifiez la gestion du personnel, du recrutement aux fiches de paie et aux formations.
            </p>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full text-lg shadow-lg" onClick={() => router.push("/dashboard")}>
              Accéder au Tableau de Bord <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>

        {/* Annonces Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-10 text-blue-800">Dernières Annonces</h2>
            {announcements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {announcements.slice(0, 3).map((annonce) => (
                  <div key={annonce.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2 text-blue-700">{annonce.titre}</h3>
                      <p className="text-gray-600 line-clamp-3">{annonce.contenu}</p>
                      <p className="text-xs text-gray-400 mt-4">Publié le: {new Date(annonce.datePub).toLocaleDateString()}</p>
                      <Button variant="link" className="p-0 mt-4 text-blue-600">
                        Lire la suite <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 italic">Aucune annonce récente pour le moment.</p>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">© {new Date().getFullYear()} REGIDESO - GRH. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}
