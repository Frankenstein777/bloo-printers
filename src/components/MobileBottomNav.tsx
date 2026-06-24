'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function MobileBottomNav() {
  const pathname = usePathname()

  const navItems = [
    {
      name: 'Home',
      href: '/',
      icon: (active: boolean) => (
        <svg
          className={`w-6 h-6 transition-colors ${active ? 'text-brand-teal' : 'text-slate-500 hover:text-brand-teal'}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      name: 'Browse',
      href: '/catalog',
      icon: (active: boolean) => (
        <svg
          className={`w-6 h-6 transition-colors ${active ? 'text-brand-teal' : 'text-slate-500 hover:text-brand-teal'}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      ),
    },
    {
      name: 'Categories',
      href: '/#categories',
      icon: (active: boolean) => (
        <svg
          className={`w-6 h-6 transition-colors ${active ? 'text-brand-teal' : 'text-slate-500 hover:text-brand-teal'}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      ),
    },
    {
      name: 'Sell Plans',
      href: '/become-architect',
      icon: (active: boolean) => (
        <svg
          className={`w-6 h-6 transition-colors ${active ? 'text-brand-teal' : 'text-slate-500 hover:text-brand-teal'}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 7h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      name: 'Account',
      href: '/profile',
      icon: (active: boolean) => (
        <svg
          className={`w-6 h-6 transition-colors ${active ? 'text-brand-teal' : 'text-slate-500 hover:text-brand-teal'}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[90] bg-white dark:bg-[#0d152b] border-t border-slate-200 dark:border-slate-800 lg:hidden shadow-lg h-16 flex items-center justify-around px-4">
      {navItems.map(item => {
        // active state checks
        const isActive = item.href === '/' ? pathname === '/' : pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.name}
            href={item.href}
            className="flex flex-col items-center justify-center cursor-none"
          >
            {item.icon(isActive)}
            <span
              className={`text-[10px] font-medium mt-0.5 transition-colors ${
                isActive ? 'text-brand-teal font-semibold' : 'text-slate-550 dark:text-slate-400'
              }`}
            >
              {item.name}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
