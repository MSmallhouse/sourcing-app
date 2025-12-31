"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Plus, User, FileQuestionMark } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", icon: Home },
  { href: "/submit-lead", icon: Plus },
  { href: "/profile", icon: User },
  { href: "/faqs", icon: FileQuestionMark },
]

export default function BottomNav() {
  const pathname = usePathname()
  if (pathname === "/login") return null; // Hide on /login

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 md:hidden z-50">
      <div className="flex items-center justify-center gap-2 px-2 py-3 rounded-full bg-background border border-border shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-center p-3 rounded-full transition-colors",
                isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-6 w-6" />
            </Link>
          )
        })}
      </div>
    </nav>
  )
}