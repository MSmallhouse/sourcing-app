import { useEffect, useState } from 'react';
import type { Lead } from '@/types/leads';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

type Slot = { start: string; end: string };

type PickupTimeSelectProps = {
  value: string;
  onChange: (value: string) => void;
  lead?: Lead;
};

dayjs.extend(utc);
dayjs.extend(timezone);

function formatSlotLabel(startStr: string, endStr: string) {
  const TIMEZONE = 'America/Denver';

  const start = dayjs.utc(startStr).tz(TIMEZONE); // Parse as UTC and convert to Mountain Time
  const end = dayjs.utc(endStr).tz(TIMEZONE); // Parse as UTC and convert to Mountain Time

  const day = start.format('dddd, MMM D');
  const time = `${start.format('h:mm A')} – ${end.format('h:mm A')} MT`;

  return `${day}, ${time}`.trim();
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
  }, []);

  // If in edit mode, do not show the empty option
  const isEditMode = !!lead;

  // Check if value exists in availableSlots
  const slotExists = availableSlots.some(
    slot => `${slot.start}|${slot.end}` === value
  );

  // If not, add the value as a temporary slot
  const slotsToShow = slotExists || !value
    ? availableSlots
    : [{ start: value.split('|')[0], end: value.split('|')[1] }, ...availableSlots];

  return (
    <Select
      value={availableSlots.length === 0 ? "" : value}
      onValueChange={value => onChange(value)}
      disabled={availableSlots.length === 0}
    >
      <SelectTrigger className="w-full">
        <SelectValue
          placeholder={
            availableSlots.length === 0
              ? "Loading..."
              : isEditMode && value
                ? formatSlotLabel(value.split('|')[0], value.split('|')[1])
                : "Select pickup time*"
          }
        />
      </SelectTrigger>
      <SelectContent>
        {slotsToShow.map((slot) => {
          const slotValue = `${slot.start}|${slot.end}`;
          return (
            <SelectItem key={slotValue} value={slotValue}>
              {formatSlotLabel(slot.start, slot.end)}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}