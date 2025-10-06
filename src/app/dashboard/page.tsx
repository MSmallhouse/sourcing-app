'use client'
import { EditableLead } from '@/app/leads/EditableLead';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useLeads } from '@/hooks/useLeads'


export default function dashboardPage() {
  const { userId, isAdmin } = useCurrentUser();
  const { leads, loading } = useLeads(userId, isAdmin);

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-2">My Leads</h2>
      {loading ? ( <p>Loading...</p> ) :
        leads.length === 0 ? ( <p>No leads yet.</p> ) : (
          <ul className="space-y-2">
            {leads.map((lead) => (
              <EditableLead key={lead.id} lead={lead} />
            ))}
          </ul>
      )}
    </div>
  )
}