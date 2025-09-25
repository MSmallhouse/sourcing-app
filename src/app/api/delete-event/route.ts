import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(req: Request) {
  try {
    const { calendarEventId } = await req.json();

    if (!calendarEventId) {
      return NextResponse.json({ success: false, error: 'Missing calendarEventId' });
    }

    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    const calendar = google.calendar('v3');

    // Delete the event from Google Calendar
    await calendar.events.delete({
      auth,
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
      eventId: calendarEventId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      'Error deleting calendar event:',
      error instanceof Error ? error.message : String(error)
    );
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
}