import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { to, cc, subject, html } = await req.json();

  try {
    const data = await resend.emails.send({
      from: 'Instant Offer Furniture <no-reply@updates.instantofferfurniture.com>',
      to,
      cc,
      subject,
      html,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Resend error:', error);
    return NextResponse.json({ error }, { status: 500 });
  }
}