import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { LeaveManagement } from "@/components/leave-management"

export default async function LeavesPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <LeaveManagement user={session} />
    </div>
  )
}
