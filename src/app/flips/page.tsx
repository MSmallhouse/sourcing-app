'use client'

import { LeadCard } from '@/components/LeadCard';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useLeads } from '@/hooks/useLeads';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Image from 'next/image';

export default function Flips() {
  const { userId, isAdmin } = useCurrentUser();
  const { leads, loading } = useLeads(userId, true);

  const successes = leads
  .filter((lead) => lead.status === 'sold')
  .sort((a, b) => {
    const dateA = new Date(a.sale_date || '1970-01-01').getTime();
    const dateB = new Date(b.sale_date || '1970-01-01').getTime();
    return dateB - dateA; // Sort in descending order
  });

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Recent Successful Flips</h1>
      <ul className="space-y-4">
        {successes.map((lead) => <LeadCard lead={lead} key={lead.id} />)}
      </ul>

      <h1 className="text-2xl font-bold my-4">Past Examples</h1>

      <Card className="hover:shadow-md hover:border-gray-300 transition-all duration-400 border p-4 rounded-lg cursor-pointer mb-4">
          <div className='text-green-700'>Sourcer Commission:
            <span className='font-semibold'> $65</span>
          </div>
        <div className="flex flex-row gap-4">
          <div className="w-[100px] h-[100px] overflow-hidden flex items-center justify-center relative">
              <Image
                src="https://evnaxatqjkerbuezxrua.supabase.co/storage/v1/object/public/Hardcoded%20Lead%20images/couch.png"
                alt="Gray Jonathan Louis Chaise Sectional"
                className="object-cover object-center rounded"
                fill
                sizes="100px"
              />
          </div>
          <div className="flex flex-col flex-1">
            <CardHeader className="p-0">
              <CardTitle className="text-lg font-semibold">Gray Jonathan Louis Chaise Sectional</CardTitle>
            </CardHeader>
            <CardContent className="p-0 mt-2 space-y-1">
              <div className="text-sm">Price: $175</div>
                <div className="text-green-700 text-sm mt-2">
                  <div>Sale Price: $500</div>
                </div>
            </CardContent>
          </div>
        </div>
      </Card>

      <Card className="hover:shadow-md hover:border-gray-300 transition-all duration-400 border p-4 rounded-lg cursor-pointer mb-4">
          <div className='text-green-700'>Sourcer Commission:
            <span className='font-semibold'> $70</span>
          </div>
        <div className="flex flex-row gap-4">
          <div className="w-[100px] h-[100px] overflow-hidden flex items-center justify-center relative">
              <Image
                src="https://evnaxatqjkerbuezxrua.supabase.co/storage/v1/object/public/Hardcoded%20Lead%20images/Screenshot%202026-01-14%20at%2011.44.14%20PM.png"
                alt="Gray Mario Capasa Chaise Sectional"
                className="object-cover object-center rounded"
                fill
                sizes="100px"
              />
          </div>
          <div className="flex flex-col flex-1">
            <CardHeader className="p-0">
              <CardTitle className="text-lg font-semibold">Gray Mario Capasa Chaise Sectional</CardTitle>
            </CardHeader>
            <CardContent className="p-0 mt-2 space-y-1">
              <div className="text-sm">Price: $250</div>
                <div className="text-green-700 text-sm mt-2">
                  <div>Sale Price: $600</div>
                </div>
            </CardContent>
          </div>
        </div>
      </Card>

      <Card className="hover:shadow-md hover:border-gray-300 transition-all duration-400 border p-4 rounded-lg cursor-pointer mb-4">
          <div className='text-green-700'>Sourcer Commission:
            <span className='font-semibold'> $60</span>
          </div>
        <div className="flex flex-row gap-4">
          <div className="w-[100px] h-[100px] overflow-hidden flex items-center justify-center relative">
              <Image
                src="https://evnaxatqjkerbuezxrua.supabase.co/storage/v1/object/public/Hardcoded%20Lead%20images/Screenshot%202026-01-14%20at%2011.47.41%20PM.png"
                alt="Navy Blue West Elm Sectional"
                className="object-cover object-center rounded"
                fill
                sizes="100px"
              />
          </div>
          <div className="flex flex-col flex-1">
            <CardHeader className="p-0">
              <CardTitle className="text-lg font-semibold">Navy Blue West Elm Sectional</CardTitle>
            </CardHeader>
            <CardContent className="p-0 mt-2 space-y-1">
              <div className="text-sm">Price: $200</div>
                <div className="text-green-700 text-sm mt-2">
                  <div>Sale Price: $500</div>
                </div>
            </CardContent>
          </div>
        </div>
      </Card>

      <Card className="hover:shadow-md hover:border-gray-300 transition-all duration-400 border p-4 rounded-lg cursor-pointer mb-4">
          <div className='text-green-700'>Sourcer Commission:
            <span className='font-semibold'> $60</span>
          </div>
        <div className="flex flex-row gap-4">
          <div className="w-[100px] h-[100px] overflow-hidden flex items-center justify-center relative">
              <Image
                src="https://evnaxatqjkerbuezxrua.supabase.co/storage/v1/object/public/Hardcoded%20Lead%20images/Screenshot%202026-01-14%20at%2011.49.53%20PM.png"
                alt="Large Gray Sectional with Chaise"
                className="object-cover object-center rounded"
                fill
                sizes="100px"
              />
          </div>
          <div className="flex flex-col flex-1">
            <CardHeader className="p-0">
              <CardTitle className="text-lg font-semibold">Large Gray Sectional with Chaise</CardTitle>
            </CardHeader>
            <CardContent className="p-0 mt-2 space-y-1">
              <div className="text-sm">Price: $300</div>
                <div className="text-green-700 text-sm mt-2">
                  <div>Sale Price: $600</div>
                </div>
            </CardContent>
          </div>
        </div>
      </Card>

      <Card className="hover:shadow-md hover:border-gray-300 transition-all duration-400 border p-4 rounded-lg cursor-pointer mb-4">
          <div className='text-green-700'>Sourcer Commission:
            <span className='font-semibold'> $90</span>
          </div>
        <div className="flex flex-row gap-4">
          <div className="w-[100px] h-[100px] overflow-hidden flex items-center justify-center relative">
              <Image
                src="https://evnaxatqjkerbuezxrua.supabase.co/storage/v1/object/public/Hardcoded%20Lead%20images/Screenshot%202026-01-14%20at%2011.51.41%20PM.png"
                alt="Crate & Barrel Mid-Century Modern Sofa"
                className="object-cover object-center rounded"
                fill
                sizes="100px"
              />
          </div>
          <div className="flex flex-col flex-1">
            <CardHeader className="p-0">
              <CardTitle className="text-lg font-semibold">Crate & Barrel Mid-Century Modern Sofa</CardTitle>
            </CardHeader>
            <CardContent className="p-0 mt-2 space-y-1">
              <div className="text-sm">Price: $250</div>
                <div className="text-green-700 text-sm mt-2">
                  <div>Sale Price: $700</div>
                </div>
            </CardContent>
          </div>
        </div>
      </Card>
    </div>
  )
}