import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'

export const metadata: Metadata = {
  title: 'Dashboard RH',
  description: 'Gérer les ressources humaines de votre entreprise',
  generator: 'Raissa',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <div className="flex min-h-screen bg-background text-foreground">
          <div className="flex-1 flex flex-col">
            <main className="flex-1 p-6">
              {children}
            </main>
          </div>
        </div>
        <Analytics />
      </body>
    </html>
  )
}
