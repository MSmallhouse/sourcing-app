import { NextResponse } from "next/server";
import { google } from "googleapis";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Extend dayjs with the plugins
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(utc);
dayjs.extend(timezone);

const TIMEZONE = process.env.TIMEZONE;

function isWeekend(date: dayjs.ConfigType) {
  const dayOfWeek = dayjs(date).day();
  return dayOfWeek === 0 || dayOfWeek === 6;
}

export async function GET() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  const calendar = google.calendar("v3");

  const now = dayjs().tz(TIMEZONE); // Current time
  const today = now.startOf("day");
  const sevenDaysFromNow = now.add(7, "day").endOf("day");

  const response = await calendar.events.list({
    auth,
    calendarId: process.env.GOOGLE_CALENDAR_ID || "primary",
    timeMin: today.toISOString(),
    timeMax: sevenDaysFromNow.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
  });

  const events = response.data.items || [];

  // Generate all 1-hour slots between 9 AM and 5 PM for the next 7 days
  const allSlots = [];
  for (let i = 0; i < 7; i++) {
    const day = now.add(i, "day");
    if ( isWeekend(day) ) continue;
    for (let hour = 9; hour < 17; hour++) {
      const start = day.hour(hour).minute(0).second(0);
      const end = start.add(1, "hour");

      // Exclude slots earlier than the current time on the current day
      if (i === 0 && start.isBefore(now)) {
        continue;
      }

      allSlots.push({ start: start.toISOString(), end: end.toISOString() });
    }
  }

  // Filter out occupied slots
  const occupiedSlots = events.map((event) => ({
    start: event.start?.dateTime,
    end: event.end?.dateTime,
  }));

  const availableSlots = allSlots.filter((slot) =>
    occupiedSlots.every(
      (event) =>
        dayjs(slot.end).isSameOrBefore(event.start) ||
        dayjs(slot.start).isSameOrAfter(event.end)
    )
  );

  return NextResponse.json(availableSlots);
}