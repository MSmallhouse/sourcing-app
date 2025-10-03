'use client'

import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="w-full bg-gray-800 text-white px-6 py-3 flex items-center justify-between">
      <div className="text-lg font-bold">Instant Offer Furniture</div>
      <div className="flex space-x-4">
        <Link href="/dashboard" className="hover:underline">
          Dashboard
        </Link>
        <Link href="/submit-lead" className="hover:underline">
          Submit a Lead
        </Link>
      </div>
    </nav>
  );
}