import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { ParticipationsFormationManagement } from "@/components/training-participation-management"

export default async function ParticipationsFormationPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <ParticipationsFormationManagement />
    </div>
  )
}