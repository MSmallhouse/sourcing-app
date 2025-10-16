'use client';

import Link from 'next/link';
import Image from 'next/image';
import { type Lead } from './types';

export function LeadCard({ lead }: { lead: Lead }) {
  return (
    <li className='border p-2 rounded space-y-1 flex flex-row'>
      <div className="w-[100px] h-[100px] overflow-hidden flex items-center justify-center relative">
        <Image
          src={lead.image_url}
          alt={lead.title}
          className='object-cover object-center'
          fill
          sizes="100px"
        />
      </div>
      <div className="flex flex-col">
        <Link href={`/leads/${lead.id}`} className='hover:underline flex flex-col'>
          <span className="font-semibold">{lead.title}</span>
        </Link>
        <Link href={`/leads/${lead.id}`} className='hover:underline flex flex-col'>
          <span>Price: ${lead.purchase_price}</span>
        </Link>
        <Link href={`/leads/${lead.id}`} className='hover:underline flex flex-col'>
          <span>Notes: {lead.notes}</span>
        </Link>
        <span className="text-gray-500 text-sm">
          {new Date(lead.created_at).toLocaleString()}
        </span>
        {/* Show sale info if sold */}
        {lead.status === 'sold' && (
          <div className="text-green-700 text-sm mt-1">
            <div>Sold on: {lead.sale_date ? new Date(lead.sale_date).toLocaleDateString() : 'N/A'}</div>
            <div>Sale Price: {lead.sale_price ? `$${lead.sale_price}` : 'N/A'}</div>
          </div>
        )}
      </div>
    </li>
  );
}