'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navigationItems, siteName } from '@/config/site'

export default function Nav() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-8 py-4 border-b border-border bg-background/95 backdrop-blur-sm">
      <Link href="/" className="text-accent font-bold text-sm tracking-wide no-underline hover:no-underline">
        {siteName}
      </Link>

      <div className="flex gap-1 flex-wrap">
        {navigationItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-all no-underline hover:no-underline outline-none focus:outline-none focus-visible:ring-1 focus-visible:ring-accent ${
              pathname === item.href
                ? 'bg-surface-2 text-accent border-accent shadow-[0_0_8px_rgba(62,207,252,0.15)]'
                : 'bg-transparent text-muted border-transparent hover:bg-surface-2 hover:text-foreground hover:border-border'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
