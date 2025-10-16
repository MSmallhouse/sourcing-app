import { useEffect, useState } from 'react';
import type { Lead } from '@/app/leads/types';

type Slot = { start: string; end: string };

type PickupTimeSelectProps = {
  value: string;
  onChange: (value: string) => void;
  lead?: Lead;
};

function formatSlotLabel(startStr: string, endStr: string) {
  const start = new Date(startStr);
  const end = new Date(endStr);
  const day = start.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
  const time = `${start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} – ${end.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
  return `${day}, ${time}`;
}

export function PickupTimeSelect({ value, onChange, lead }: PickupTimeSelectProps) {
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);

  useEffect(() => {
    async function fetchSlots() {
      try {
        const res = await fetch('/api/available-slots');
        const slots = await res.json();
        setAvailableSlots(slots);
      } catch (error) {
        console.error('Error fetching available slots:', error);
      }
    }
    fetchSlots();
    const interval = setInterval(fetchSlots, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // If lead has a pickup time, show it as the first option
  let hasPickupTime = false;
  let pickupLabel = '';
  if (lead && lead.pickup_start && lead.pickup_end) {
    const pickupValue = `${lead.pickup_start}|${lead.pickup_end}`;
    hasPickupTime = value === pickupValue;
    pickupLabel = formatSlotLabel(lead.pickup_start, lead.pickup_end);
  }

  return (
    <select
      className="border p-2 w-full mb-4"
      value={value}
      onChange={e => onChange(e.target.value)}
      required
    >
      {!value || !hasPickupTime ? (
        <option value="">Select pickup time*</option>
      ) : (
        <option value={value}>{pickupLabel}</option>
      )}
      {availableSlots.map((slot, idx) => {
        const slotValue = `${slot.start}|${slot.end}`;
        return (
          <option key={idx} value={slotValue}>
            {formatSlotLabel(slot.start, slot.end)}
          </option>
        );
      })}
    </select>
  );
}