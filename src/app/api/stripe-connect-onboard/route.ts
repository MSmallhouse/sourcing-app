import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { userId, email } = await req.json();
  console.log("Received userID:", userId)

  // 1. Create or retrieve a connected account for the user
  const account = await stripe.accounts.create({
    country: 'US',
    type: 'express',
    capabilities: {
      transfers: {
        requested: true,
      },
    },
    email,
    metadata: { userId },
  });
  console.log("Created Stripe account:", account.id);

  // 2. Create an account link for onboarding
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/profile`,
    return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/profile`,
    type: 'account_onboarding',
  });

  console.log("Updating Supabase profile for userID: ", userId, " with stripe_account_id: ", account.id);
  // add User's stripe id into their profile
  const { data, error: supabaseError } = await supabaseAdmin
  .from("profiles")
  .update({ stripe_account_id: account.id })
  .eq("id", userId)
  .select();

  console.log("Supabase update result:", data, "Error:", supabaseError);

  if (supabaseError) {
    console.error("Failed to update stripe_account_id:", supabaseError);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }

  return NextResponse.json({ url: accountLink.url });
}