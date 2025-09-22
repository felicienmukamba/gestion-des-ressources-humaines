import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { EmployeeManagement } from "@/components/employee-management"

export default async function EmployeesPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  // Vérifier que l'utilisateur a les droits d'accès
  const isAuthorized = session.role.nomRole === "Admin" || session.role.nomRole === "RH"

  if (!isAuthorized) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      <EmployeeManagement />
    </div>
  )
}
