import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { AvantageManagement } from "@/components/benefit-management"

export default async function AvantagesPage() {
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
      <AvantageManagement />
    </div>
  )
}