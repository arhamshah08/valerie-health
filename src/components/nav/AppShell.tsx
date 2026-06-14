'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/lib/supabase/database.types'

const NAV_ITEMS = [
  { href: '/dashboard',  label: 'Home',      icon: '🏠' },
  { href: '/check-in',   label: 'Check in',  icon: '📓' },
  { href: '/insights',   label: 'Insights',  icon: '✨' },
  { href: '/chat',       label: 'Chat',      icon: '💬' },
  { href: '/providers',  label: 'Providers', icon: '🧭' },
  { href: '/settings',   label: 'Settings',  icon: '⚙️' },
]

interface Props {
  children: React.ReactNode
  user: User
  profile: Profile | null
}

export default function AppShell({ children, user, profile }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const firstName = profile?.full_name?.split(' ')[0] ?? user.email?.split('@')[0] ?? 'there'

  return (
    <div className="flex min-h-screen bg-[#fdfbff]">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-gray-100 fixed inset-y-0 left-0 z-40">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shrink-0">
              V
            </div>
            <span className="font-bold text-violet-950 text-base tracking-tight">valerie</span>
          </Link>
        </div>

        {/* User */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-violet-50">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {firstName[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{firstName}</p>
              <p className="text-[10px] text-violet-500 font-medium">
                {profile?.subscription_status === 'trial' ? '🌸 Free trial' : '⭐ Premium'}
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  active
                    ? 'bg-violet-100 text-violet-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Sign out */}
        <div className="px-3 py-4 border-t border-gray-100">
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all w-full text-left"
          >
            <span>🚪</span>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">
        {children}
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 glass border-t border-gray-100 flex">
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center py-3 gap-0.5 text-[10px] font-medium transition-colors',
                active ? 'text-violet-700' : 'text-gray-400'
              )}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
