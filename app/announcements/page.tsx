import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { AnnouncementManagement } from "@/components/announcement-management";

export default async function AnnouncementsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const isAuthorized = session.role.nomRole === "Admin" || session.role.nomRole === "RH";

  if (!isAuthorized) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementManagement />
    </div>
  );
}