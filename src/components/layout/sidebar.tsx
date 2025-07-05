'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils' // optional, bisa diganti manual kalau tidak pakai `cn`

export const Sidebar = () => {
  const pathname = usePathname()

  const navItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'History', href: '/history' },
    { label: 'Teams', href: '/teams' },
    { label: 'Settings', href: '/settings' },
  ]

  return (
    <aside className="w-64 bg-gray-800 border-r min-h-screen p-4 shadow-sm">
      <div className="text-2xl font-bold mb-6 text-white">🕒 LogPose</div>
      <nav className="space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'block px-4 py-2 rounded hover:bg-blue-100',
                isActive ? 'bg-indigo-500 text-white' : 'text-white'
              )}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
