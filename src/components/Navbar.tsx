"use client"

import Link from 'next/link'
import { usePathname } from "next/navigation"

export default function Navbar() {
  const pathname = usePathname()
  if (pathname === "/login") return null; // Hide on login

  return (
    <nav className="w-full border-b-1 text-white px-6 py-3 items-center justify-between hidden md:flex">
      <div className="text-lg font-bold">Instant Offer Furniture</div>
      <div className="flex space-x-4">
        <Link href="/profile" className="hover:underline">
          My Profile
        </Link>
        <Link href="/dashboard" className="hover:underline">
          Dashboard
        </Link>
        <Link href="/submit-lead" className="hover:underline">
          Submit a Lead
        </Link>
        <Link href="/faqs" className="hover:underline">
          FAQs
        </Link>
      </div>
    </nav>
  );
}