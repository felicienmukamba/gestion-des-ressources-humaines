import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { AttendanceManagement } from "@/components/attendance-management";

export default async function AttendancesPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Tous les rôles ont accès à cette page pour voir leurs présences
  // La logique de visibilité est gérée dans le composant et l'API
  const isAuthorized = session.role.nomRole === "Admin" || session.role.nomRole === "RH" || session.role.nomRole === "Employee";

  if (!isAuthorized) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      <AttendanceManagement />
    </div>
  );
}