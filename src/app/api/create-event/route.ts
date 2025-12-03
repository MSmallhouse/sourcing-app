import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(req: Request) {
  try {
    const { title, description, startISO, endISO } = await req.json();

    if (!title || !startISO || !endISO) {
      return NextResponse.json({ success: false, error: 'Missing required fields' });
    }

    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    const calendar = google.calendar('v3');

    // Create the event in Google Calendar
    const event = await calendar.events.insert({
      auth,
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
      requestBody: {
        summary: title,
        description: description,
        start: { dateTime: startISO },
        end: { dateTime: endISO },
      },
    });

    return NextResponse.json({ success: true, eventId: event.data.id });
  } catch (error) {
    console.error(
      'Error creating calendar event:',
      error instanceof Error ? error.message : String(error)
    );
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
}