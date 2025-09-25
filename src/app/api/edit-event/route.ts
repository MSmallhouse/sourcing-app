import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(req: Request) {
  try {
    const { calendarEventId, title, notes } = await req.json();

    if (!calendarEventId) {
      return NextResponse.json({ success: false, error: 'Missing calendarEventId' });
    }
    if (!title) {
      return NextResponse.json({ success: false, error: 'Missing title' });
    }

    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    const calendar = google.calendar('v3');

    // Update the event in Google Calendar using patch
    await calendar.events.patch({
      auth,
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
      eventId: calendarEventId,
      requestBody: {
        summary: title,
        description: notes,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      'Error updating calendar event:',
      error instanceof Error ? error.message : String(error)
    );
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
}