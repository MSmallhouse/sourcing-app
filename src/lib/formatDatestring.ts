import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

export function formatDatestring(dateString: string, timezone?: string): string {
  if (!dateString) return '';

  const date = timezone
    ? dayjs.utc(dateString).tz(timezone) // Parse as UTC and convert to the specified timezone
    : dayjs(dateString); // Use local timezone by default

  return date.format('MM/DD/YYYY h:mm A'); // Format as "MM/DD/YYYY h:mm AM/PM"
}