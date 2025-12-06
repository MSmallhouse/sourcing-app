import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { StripeOnboardingStatus } from "@/types/stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { userId, email, stripeOnboardStatus, stripe_account_id } = await req.json();

  // TODO: handle these 3 cases:
  // acct doesn't exist -> create acct
  // acct exists but is imcomplete -> get acct and then finish onboarding
  // acct exists but is complete -> change type under accountLink to be 'account_update' for user to update profile

  let accountId = stripe_account_id;

  if (stripeOnboardStatus === 'not_started') {
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
    accountId = account.id;
  } 

  // 2. Create an account link for onboarding
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/profile`,
    return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/profile`,
    type: 'account_onboarding',
  });

  if (stripeOnboardStatus === 'not_started') {
    const { data, error: supabaseError } = await supabaseAdmin
    .from("profiles")
    .update({ stripe_account_id: accountId })
    .eq("id", userId)
    .select();

    if (supabaseError) {
      console.error("Failed to update stripe_account_id:", supabaseError);
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
  }


  return NextResponse.json({ url: accountLink.url });
}