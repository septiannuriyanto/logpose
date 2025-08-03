'use client'

import { useAuth } from '@/components/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const supabase = createClient();

export const Sidebar = () => {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()

  const navItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Projects', href: '/projects' },
    { label: 'Settings', href: '/settings' },
  ]

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="w-64 bg-gray-800 border-r min-h-screen p-4 shadow-sm flex flex-col justify-between">
      {/* Top Section */}
      <div>
        <div className="text-2xl font-bold mb-6 text-white">🕒 LogPose</div>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'cursor-pointer block px-4 py-2 rounded hover:bg-blue-100 hover:text-indigo-500 transition-colors',
                  isActive ? 'bg-indigo-500 text-white' : 'text-white'
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Bottom Section: Sign Out */}
      <div className="mt-6">
        {user && (
          <button
            onClick={handleSignOut}
            className="cursor-pointer w-full text-left px-4 py-2 rounded text-red-400 hover:text-red-600 hover:bg-red-100 transition"
          >
            Sign Out
          </button>
        )}
      </div>
    </aside>
  )
}
