"use client"

import Link from "next/link";
import Image from "next/image"
import {FaLinkedin, FaGlobe} from "react-icons/fa";

export default function footer() {
  return (
    <footer className="bg-gray-900 text-white py-6 pb-28 md:pb-8">
      <div className="container mx-auto px-4 lg:px-24 flex flex-col md:flex-row justify-between items-center space-y-4">
        <div className="flex items-center space-x-4 mb-12 md:mb-0">
          <Image
            src="/images/iof-logo-text.svg"
            alt="Instant Offer Furniture Logo"
            width={150}
            height={0}
          />
        </div>
        <div className="text-center mb-12 md:mb-0">
          <p><Link href="mailto:instantofferfurniture@gmail.com" className="underline text-white hover:text-gray-400 transition-colors">instantofferfurniture@gmail.com</Link></p>
          <p><Link href="sms:+17208031211" className="underline text-white hover:text-gray-400 transition-colors">(720)803-1211</Link></p>
          <div className="flex justify-center">
            <Link href="https://www.linkedin.com/company/instant-offer-furniture/" target="_blank">
              <FaLinkedin className="h-5 w-5 me-2 text-white hover:text-gray-400 transition-colors" />
            </Link>
            <Link href="https://instantofferfurniture.com" target="_blank">
              <FaGlobe className="h-5 w-5 ms-2 text-white hover:text-gray-400 transition-colors"/>
            </Link>
          </div>
        </div>
        <div className="flex flex-col space-x-4 text-center">
          <p>4454 York Street</p>
          <p>Denver Colorado</p>
          <p>80216 United States</p>
        </div>
      </div>
    </footer>
  )
}