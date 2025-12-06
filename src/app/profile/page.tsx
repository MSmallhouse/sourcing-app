'use client'

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useLeads } from '@/hooks/useLeads';
import { useEffect, useState } from "react";
import { StripeOnboardingStatus } from "@/types/stripe";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import Link from 'next/link';

export default function AccountPage() {
  const { userId, isAdmin } = useCurrentUser();
  const [profile, setProfile] = useState<{
    first_name: string;
    last_name: string;
    email: string;
    stripe_account_id: string;
  } | null>(null);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeOnboardStatus, setStripeOnboardStatus] = useState<StripeOnboardingStatus | null>(null);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [stripeOnboardUrl, setStripeOnboardUrl] = useState('');

  const { leads, loading: leadsLoading } = useLeads(userId, isAdmin);

  const totalSubmissions = leads.length;
  const totalApproved = leads.filter(l =>
    ["approved", "picked up", "pending sold", "sold"].includes(l.status)
  ).length;
  const totalRejected = leads.filter(l => l.status === "rejected").length;
  const totalSold = leads.filter(l => l.status === "sold").length;
  const totalCommission = leads
    .filter(l => l.commission_amount ?? 0)
    .reduce((sum, l) => sum + (l.commission_amount ?? 0), 0);
  const unpaidCommission = leads
    .filter(l => !l.commission_paid && (l.commission_amount ?? 0))
    .reduce((sum, l) => sum + (l.commission_amount ?? 0), 0);

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("first_name, last_name, email, stripe_account_id")
      .eq("id", userId)
      .single();
    if (!error && data) setProfile(data);
  };

  const handleConnectStripe = async () => {
    setStripeLoading(true);
    try {
      const res = await fetch('/api/stripe-connect-onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          email: profile?.email,
          stripeOnboardStatus,
          stripe_account_id: profile?.stripe_account_id ?? null, 
        }),
      });
      const { url } = await res.json();
      setStripeOnboardUrl(url);
    } finally {
      setStripeLoading(false);
    }
  };

  const checkStripeOnboarding = async (stripeAccountId: string) => {
    const res = await fetch('/api/stripe-connect-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stripeAccountId }),
    });
    const { isOnboarded } = await res.json();
    setStripeOnboardStatus(isOnboarded ? 'complete' : 'incomplete');
  };

  const handleRequestPayout = async () => {
    setPayoutLoading(true);
    try {
      const res = await fetch('/api/request-payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Payout requested successfully!");
        // Optionally refetch leads/profile here
      } else {
        alert(data.error || "Failed to request payout.");
      }
    } finally {
      setPayoutLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
    fetchUserProfile(userId);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    if (profile?.stripe_account_id) {
      checkStripeOnboarding(profile.stripe_account_id);
    } else {
      setStripeOnboardStatus('not_started');
    }
  }, [profile?.stripe_account_id]);

  useEffect(() => {
    if (!userId) return;
    if (stripeOnboardStatus !== null) {
      handleConnectStripe();
    }
  }, [stripeOnboardStatus, userId])

  if (!userId) {
    return (
      <div className="flex justify-center items-center h-full">
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <span className="font-semibold">Name:</span>{" "}
              {profile
                ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || "—"
                : "—"}
            </div>
            <div>
              <span className="font-semibold">Email:</span>{" "}
              {profile?.email || "—"}
            </div>
            <div>
              <span className="font-semibold">Total Submissions:</span>{" "}
                {totalSubmissions !== null ? totalSubmissions : "0"}
            </div>
            <div>
              <span className="font-semibold">Approved Count:</span>{" "}
                {totalApproved !== null ? totalApproved : "0"}
            </div>
            <div>
              <span className="font-semibold">Rejected Count:</span>{" "}
                {totalRejected!== null ? totalRejected : "0"}
            </div>
            <div>
              <span className="font-semibold">Sold Count:</span>{" "}
                {totalSold!== null ? totalSold : "0"}
            </div>
            <div>
              <span className="font-semibold">Total Commission:</span>{" $"}
                {totalCommission !== null ? totalCommission.toFixed(2) : "0"}
            </div>
            <div>
              <span className="font-semibold">Unpaid Commission:</span>{" $"}
                {unpaidCommission !== null ? unpaidCommission.toFixed(2) : "0"}
            </div>
            <div>
              <span className="font-semibold">Stripe Account Id:</span>{" "}
                {profile?.stripe_account_id ?? "-"}
            </div>
          </div>
          <Button
            disabled={stripeLoading}
            className="mt-4"
          >
            <Link href={stripeOnboardUrl} target="_blank">
              {stripeLoading ? "Loading Stripe..." :
                stripeOnboardStatus == 'complete' ? "Update Stripe Account" : 'Connect With Stripe'}
            </Link>
          </Button>
          {unpaidCommission > 0 && stripeOnboardStatus && (
            <Button
              onClick={handleRequestPayout}
              disabled={payoutLoading}
              className="mt-4"
            >
              {payoutLoading ? "Requesting Payout..." : "Request Payout"}
            </Button>
          )}
          <div>
            <Button
              variant="outline"
              className="mt-4"
            >
              <a href="/complete-profile">Edit Profile</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}