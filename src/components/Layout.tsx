import { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-paper">
      {/* Header */}
      <header className="bg-white border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-2">
              <h1 className="text-xl font-serif">Questbook</h1>
            </Link>

            {user && (
              <nav className="flex items-center gap-6">
                <Link
                  to="/dashboard"
                  className="text-sm text-ink hover:text-teal"
                >
                  Dashboard
                </Link>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-ink-soft">{user.email}</span>
                  <button
                    onClick={handleSignOut}
                    className="text-sm text-teal hover:text-amber"
                  >
                    Sign Out
                  </button>
                </div>
              </nav>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-navy text-paper text-center py-8 mt-12">
        <p className="text-sm">
          © 2024 Questbook. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
