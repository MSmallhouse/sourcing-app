"use client"

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from "next/navigation"

export default function Navbar() {
  const pathname = usePathname()
  if (pathname === "/login") return null; // Hide on login

  return (
    <nav className="w-full border-b-1 text-white px-6 py-3 items-center justify-between hidden md:flex">

      <Link href="/dashboard">
        <Image
          src="/images/iof-logo-text.svg"
          width={150}
          height={0}
          alt="Instant Offer Furniture"
        />
      </Link>
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
        <Link href="/flips" className="hover:underline">
          Past Successes
        </Link>
        <Link href="/faqs" className="hover:underline">
          FAQs
        </Link>
      </div>
    </nav>
  );
}