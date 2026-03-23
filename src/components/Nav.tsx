'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/oncology', label: 'Oncology AI' },
  { href: '/ai-automation', label: 'AI Automation' },
  { href: '/medical-tourism', label: 'Medical Tourism' },
  { href: '/contact', label: 'Contact' },
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-8 py-4 border-b border-border bg-background/95 backdrop-blur-sm">
      <Link href="/" className="text-accent font-bold text-sm tracking-wide no-underline hover:no-underline">
        Health AI Atlas
      </Link>

      <div className="flex gap-1 flex-wrap">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-all no-underline hover:no-underline ${
              pathname === item.href
                ? 'bg-surface-2 text-foreground border-accent'
                : 'bg-transparent text-muted border-border hover:bg-surface-2 hover:text-foreground hover:border-accent'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
