import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { FicheDePaieManagement } from "@/components/payroll-management"

export default async function FichesDePaiePage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const isAuthorized = session.role.nomRole === "Admin" || session.role.nomRole === "RH"

  if (!isAuthorized) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      <FicheDePaieManagement />
    </div>
  )
}