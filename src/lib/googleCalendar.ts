import { google } from "googleapis";

export async function createCalendarEvent(
  summary: string,
  description: string,
  start: Date,
  end: Date
) {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  const calendar = google.calendar("v3");

  const event = {
    summary,
    description,
    start: { dateTime: start.toISOString(), timeZone: "America/Denver" },
    end: { dateTime: end.toISOString(), timeZone: "America/Denver" },
  };

  const response = await calendar.events.insert({
    auth,
    calendarId: process.env.GOOGLE_CALENDAR_ID || "primary",
    requestBody: event,
  });

  return response.data;
}