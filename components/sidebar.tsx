"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Users,
  Briefcase,
  Gift,
  Handshake,
  Calendar,
  DollarSign,
  MessageSquare,
  Award,
  BookOpen,
  LayoutDashboard,
} from "lucide-react"

const navLinks = [
  {
    title: "Tableau de Bord",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Employés",
    href: "/employees",
    icon: Users,
  },
  {
    title: "Congés",
    href: "/leaves",
    icon: Calendar,
  },
  {
    title: "Avantages",
    href: "/benefits",
    icon: Gift,
  },
  {
    title: "Paies",
    href: "/payrolls",
    icon: DollarSign,
  },
  {
    title: "Formations",
    href: "/trainings",
    icon: BookOpen,
  },
  {
    title: "Primes",
    href: "/bonuses",
    icon: Award,
  },
  {
    title: "Présences",
    href: "/attendances",
    icon: Handshake,
  },
  {
    title: "Annonces",
    href: "/announcements",
    icon: MessageSquare,
  },
  {
    title: "Rôles",
    href: "/roles",
    icon: Briefcase,
  },
  {
    title: "Utilisateurs",
    href: "/users",
    icon: Users,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-64 p-4 border-r bg-card h-screen overflow-y-auto">
      <div className="flex items-center justify-center p-4">
        <span className="text-2xl font-bold text-primary">HR App</span>
      </div>
      <nav className="flex-1 mt-6 space-y-2">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-muted/50",
              pathname === link.href ? "bg-muted text-primary" : "text-muted-foreground",
            )}
          >
            <link.icon className="h-5 w-5" />
            <span>{link.title}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}
