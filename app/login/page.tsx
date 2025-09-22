import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { LoginForm } from "@/components/login-form"

export default async function LoginPage() {
  const session = await getSession()

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">REGIDESO</h1>
          <p className="text-muted-foreground mt-2">Système de Gestion des Ressources Humaines</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
