'use client';

import Link from 'next/link';
import Image from 'next/image';
import { type Lead } from '@/types/leads';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function LeadCard({ lead }: { lead: Lead }) {
  return (
    <Link href={`/leads/${lead.id}`} className="block">
      <Card className="hover:shadow-md hover:border-gray-300 transition-all duration-400 border p-4 rounded-lg cursor-pointer">
        <div className="flex flex-row gap-4">
          {/* Image Section */}
          <div className="w-[100px] h-[100px] overflow-hidden flex items-center justify-center relative">
            {lead.image_url && (
              <Image
                src={lead.image_url}
                alt={lead.title}
                className="object-cover object-center rounded"
                fill
                sizes="100px"
              />
            )}
          </div>

          {/* Content Section */}
          <div className="flex flex-col flex-1">
            <CardHeader className="p-0">
              <CardTitle className="text-lg font-semibold">{lead.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-0 mt-2 space-y-1">
              <div className="text-sm">Price: ${lead.purchase_price}</div>
              <div className="text-sm">Notes: {lead.notes.length > 100 ? `${lead.notes.slice(0,100)}...` : `${lead.notes}`}</div>
              <div className="text-xs text-gray-500">
                {new Date(lead.created_at).toLocaleString()}
              </div>

              {/* Sale Info */}
              {lead.status === 'sold' && (
                <div className="text-green-700 text-sm mt-2">
                  <div>Sold on: {lead.sale_date ? new Date(lead.sale_date).toLocaleDateString() : 'N/A'}</div>
                  <div>Sale Price: {lead.sale_price ? `$${lead.sale_price}` : 'N/A'}</div>
                </div>
              )}
            </CardContent>
          </div>
        </div>
      </Card>
    </Link>
  );
}