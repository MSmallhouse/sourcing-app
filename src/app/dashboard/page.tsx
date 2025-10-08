'use client'
import { EditableLead } from '@/app/leads/EditableLead';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useLeads } from '@/hooks/useLeads'
import type { LeadStatus } from '@/app/leads/types'
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

const STATUSES: LeadStatus[] = [
  'submitted',
  'approved',
  'rejected',
  'picked up',
  'sold',
]

export default function dashboardPage() {
  const { userId, isAdmin } = useCurrentUser();
  const { leads, loading } = useLeads(userId, isAdmin);

  function filterLeadsByStatus(status: LeadStatus) {
    return leads.filter((lead) => lead.status === status);
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  return (
    <div className="p-8 max-w-lg mx-auto">
      {STATUSES.map((status) => (
        <div key={status}>
          <h2 className="text-xl font-bold mb-2 pt-8">
            {`${status.charAt(0).toUpperCase() + status.slice(1)}`}
          </h2>
          {loading ? ( <p>Loading...</p> ) :
            filterLeadsByStatus(status).length === 0 ? ( <p>None</p> ) : (
              <ul className="space-y-2">
                {filterLeadsByStatus(status).map((lead) => (
                  <EditableLead lead={lead} isAdmin={isAdmin} key={lead.id} />
                ))}
              </ul>
          )}
        </div>
      ))}
      <button
        onClick={handleLogout}
        className='bg-red-500 p-3 mt-4 max-w-lg mx-auto cursor-pointer'>
        Log Out
      </button>
    </div>
  )
}