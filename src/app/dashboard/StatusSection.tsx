'use client'

import { LeadCard } from '@/components/LeadCard';
import type { LeadStatus, Lead } from '@/types/leads';
import { HoverPopover } from '@/components/HoverPopover';
import { Info } from 'lucide-react';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator"

type StatusSectionProps = {
  statuses: { status: LeadStatus; description: string }[];
  loading: boolean;
  filterLeadsByStatus: (status: LeadStatus) => Lead[];
  layout: 'horizontal' | 'vertical'; // Determines the layout (desktop or mobile)
};

export function StatusSection({ statuses, loading, filterLeadsByStatus, layout }: StatusSectionProps) {
  return (
    <div
      className={layout === 'horizontal' ? 'flex md:flex-row md:gap-8 whitespace-nowrap' : 'space-y-8'}
    >
      {statuses.map(({ status, description }) => (
        <div
          key={status}
          className={layout === 'horizontal' ? 'flex-shrink-0 w-80' : ''}
        >
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
            <ScrollArea className="max-h-96 md:h-[65vh] md:max-h-full overflow-y-auto border border-gray-400 rounded-md p-4">
              <ul>
                {filterLeadsByStatus(status).map((lead, index) => (
                  <li key={lead.id}>
                    <LeadCard lead={lead} />
                    {index < filterLeadsByStatus(status).length - 1 && <Separator className="my-4" />}
                  </li>
                ))}
              </ul>
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          )}
        </div>
      ))}
    </div>
  );
}