import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { stripeAccountId } = await req.json();

  if (!stripeAccountId) {
    return NextResponse.json({ onboarded: false });
  }

  const account = await stripe.accounts.retrieve(stripeAccountId);

  // Stripe recommends checking these requirements for onboarding completion
  const isOnboarded =
    account.details_submitted &&
    !account.requirements?.currently_due?.length;

  return NextResponse.json({ isOnboarded, account });
}