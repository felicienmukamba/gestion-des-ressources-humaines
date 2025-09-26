import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { ParticipationManagement } from "@/components/training-participation-management"
export default async function ParticipationsPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  // Le composant client gère l'affichage en fonction du rôle de l'utilisateur
  return (
    <div className="min-h-screen bg-background">
      <ParticipationManagement session={session as any} />
    </div>
  )
}