'use client'
import { LeadCard } from './LeadCard';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useLeads } from '@/hooks/useLeads';
import type { LeadStatus } from '@/types/leads';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react'; // Icon library for the info icon

const STATUSES: { status: LeadStatus; description: string }[] = [
  { status: 'submitted', description: 'These leads have been submitted but not yet reviewed.' },
  { status: 'approved', description: 'These leads have been approved and are ready for further action.' },
  { status: 'rejected', description: 'These leads have been rejected and require no further action.' },
  { status: 'picked up', description: 'These leads have been picked up and are in transit.' },
  { status: 'pending sold', description: 'These leads are pending sale and awaiting confirmation.' },
  { status: 'sold', description: 'These leads have been sold successfully.' },
];

export default function DashboardPage() {
  const { userId, isAdmin } = useCurrentUser();
  const { leads, loading } = useLeads(userId, isAdmin);

  function filterLeadsByStatus(status: LeadStatus) {
    return leads.filter((lead) => lead.status === status);
  }

  return (
    <div className="p-8 max-w-lg mx-auto">
      {STATUSES.map(({ status, description }) => (
        <div key={status}>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold mb-2 pt-8">
              {`${status.charAt(0).toUpperCase() + status.slice(1)}`}
            </h2>
            <Tooltip>
              <TooltipTrigger className="pt-4 ms-1">
                <Info className="w-4 h-4 text-gray-500 hover:text-gray-700 cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent
                className="bg-slate-800 text-white border border-slate-700 shadow-md [&_svg]:hidden! max-w-[90vw]">
                <p className='max-w-[90vw]'>{description}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          {loading ? (
            <p>Loading...</p>
          ) : filterLeadsByStatus(status).length === 0 ? (
            <p>None</p>
          ) : (
            <ul className="space-y-2">
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