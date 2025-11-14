import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="w-full border-b-1 text-white px-6 py-3 flex items-center justify-between">
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
      </div>
    </nav>
  );
}