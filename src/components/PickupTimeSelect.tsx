import { useEffect, useState } from 'react';

type Slot = { start: string; end: string };

type PickupTimeSelectProps = {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
};

export function PickupTimeSelect({ value, onChange, required }: PickupTimeSelectProps) {
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);

  useEffect(() => {
    async function fetchSlots() {
      try {
        const res = await fetch('/api/available-slots');
        const slots = await res.json();
        setAvailableSlots?.(slots);
      } catch (error) {
        console.error('Error fetching available slots:', error);
      }
    }
    fetchSlots();
    const interval = setInterval(fetchSlots, 60 * 1000);
    return () => clearInterval(interval);
  }, [setAvailableSlots]);

  return (
    <select
      className="border p-2 w-full"
      value={value}
      onChange={e => onChange(e.target.value)}
      required={required}
    >
      <option value="">Select pickup time</option>
      {availableSlots.map((slot, idx) => {
        const start = new Date(slot.start);
        const end = new Date(slot.end);
        const day = start.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
        const time = `${start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} – ${end.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
        return (
          <option key={idx} value={`${slot.start}|${slot.end}`}>
            {day}, {time}
          </option>
        );
      })}
    </select>
  );
}