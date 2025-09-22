import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { PrimeManagement } from "@/components/bonus-management"

export default async function PrimesPage() {
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
      <PrimeManagement />
    </div>
  )
}