import { NextResponse } from "next/server";
import { createCalendarEvent } from "@/lib/googleCalendar";

export async function POST(req: Request) {
  try {
    const { title, notes, startISO, endISO } = await req.json();

    const event = await createCalendarEvent(
      title,
      notes || "No notes",
      new Date(startISO),
      new Date(endISO)
    );

    return NextResponse.json({ success: true, event });
  } catch (error: any) {
    console.error("Error in /api/leads/create-event:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
