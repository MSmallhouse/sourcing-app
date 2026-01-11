import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { isDevUser } from "@/lib/utils";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { userId } = await req.json();
  const isDev = isDevUser(userId);

  // 1. Fetch unpaid leads and sum commission
  let leadsQuery = supabaseAdmin.from('leads').select('id, commission_amount, dev_commission_amount');

  if (isDev) {
    leadsQuery = leadsQuery
      .eq('dev_commission_paid', false)
      .not('dev_commission_amount', 'is', null); // Ensure dev commission exists
  } else {
    leadsQuery = leadsQuery
      .eq('sourcer_id', userId)
      .eq('commission_paid', false)
      .not('commission_amount', 'is', null); // Ensure user commission exists
  }

  const { data: leads, error } = await leadsQuery.eq('status', 'sold');

  if (error || !leads || leads.length === 0) {
    return NextResponse.json({ error: "No unpaid commission found." }, { status: 400 });
  }

  const totalCommission = isDev ? 
    leads.reduce((sum, l) => sum + (l.dev_commission_amount ?? 0), 0) :
    leads.reduce((sum, l) => sum + (l.commission_amount ?? 0), 0);


  // 2. Fetch user's stripe_account_id
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('stripe_account_id')
    .eq('id', userId)
    .single();

  if (!profile?.stripe_account_id) {
    return NextResponse.json({ error: "User not connected to Stripe." }, { status: 400 });
  }

  // 3. Create Stripe transfer (amount in cents)
  let transfer;
  try {
    transfer = await stripe.transfers.create({
      amount: Math.round(totalCommission * 100),
      currency: 'usd',
      destination: profile.stripe_account_id,
      description: 'Sourcer commission payout',
    });
  } catch (stripeError) {
    console.error("Stripe transfer error:", stripeError)
    return NextResponse.json({ error: "Stripe payout failed", stripeError }, { status: 500 })
  }

  // 4. Mark leads as paid
  const leadIds = leads.map(l => l.id);
  await supabaseAdmin
    .from('leads')
    .update(isDev ? { dev_commission_paid: true } : { commission_paid: true })
    .in('id', leadIds);

  return NextResponse.json({ success: true });
}