'use client'

import { LeadCard } from '@/components/LeadCard';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useLeads } from '@/hooks/useLeads';
import type { LeadStatus } from '@/types/leads';
import { HoverPopover } from '@/components/HoverPopover';
import { Info } from 'lucide-react'; // Icon library for the info icon
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from 'next/link'

const STATUSES: { status: LeadStatus; description: string }[] = [
  { status: 'submitted', description: 'These leads have been submitted but not yet reviewed by our team.' },
  { status: 'approved', description: 'These leads have been approved for pickup by our team.' },
  { status: 'rejected', description: 'These leads have been rejected, view the lead\'s page to see why.' },
  { status: 'picked up', description: 'These leads have been picked up and will be listed at our storefront.' },
  { status: 'pending sold', description: 'These leads are pending sale and awaiting confirmation.' },
  { status: 'sold', description: 'These leads have been sold successfully!' },
];

export default function DashboardPage() {
  const { userId, isAdmin } = useCurrentUser();
  const { leads, loading } = useLeads(userId, isAdmin);

  function filterLeadsByStatus(status: LeadStatus) {
    return leads.filter((lead) => lead.status === status);
  }

  return (
    <div className="p-8 max-w-lg mx-auto">
      {!loading && leads.length === 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold">No Submissions Yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Set your location to Denver, and start hunting for deals on Facebook Marketplace, OfferUp, Craigslist, or anywhere else you can find used sofas and sectionals!</p>
            <p>See <Link href="/flips" className="underline text-blue-600 hover:text-blue-800">successful flips</Link> from other users for inspiration!</p>
            <p>Read our <Link href="/faqs/#seller-messaging" className="underline text-blue-600 hover:text-blue-800">Seller Messaging Script</Link>.</p>
            <p>Submit your first lead <Link href="/submit-lead" className="underline text-blue-600 hover:text-blue-800">here</Link>.</p>
          </CardContent>
        </Card>
      )}
      {STATUSES.map(({ status, description }) => (
        <div key={status}>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold mb-2 pt-8">
              {`${status.charAt(0).toUpperCase() + status.slice(1)}`}
            </h2>
            <HoverPopover
              trigger={
                <Info className="w-4 h-4 text-gray-500 hover:text-gray-700 cursor-pointer" />
              }
              content={<p>{description}</p>}
            />
          </div>
          {loading ? (
            <p>Loading...</p>
          ) : filterLeadsByStatus(status).length === 0 ? (
            <p>None</p>
          ) : (
            <ul className="space-y-4">
              {filterLeadsByStatus(status).map((lead) => (
                <LeadCard lead={lead} key={lead.id} />
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}