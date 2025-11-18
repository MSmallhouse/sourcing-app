'use client'

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { SOURCER_COMMISSION_RATE } from "@/config/constants";
import { Button } from "@/components/ui/button";
import { handleClientScriptLoad } from "next/script";

export default function AccountPage() {
  const { userId, isAdmin } = useCurrentUser();
  const [profile, setProfile] = useState<{
    first_name: string;
    last_name: string;
    email: string;
    stripe_account_id: string;
  } | null>(null);
  const [totalSubmissions, setTotalSubmissions] = useState<number | null>(null);
  const [totalApproved, setTotalApproved] = useState<number | null>(null);
  const [totalRejected, settotalRejected] = useState<number | null>(null);
  const [totalSold, settotalSold] = useState<number | null>(null);
  const [totalCommission, setTotalCommission]  = useState<number | null>(null);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [isStripeonboarded, setIsStripeOnboarded] = useState<boolean | null>(null);

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("first_name, last_name, email, stripe_account_id")
      .eq("id", userId)
      .single();
    if (!error && data) setProfile(data);
  };

  const fetchTotalSubmissionsCount = async (userId: string) => {
    const { count, error } = await supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("sourcer_id", userId);
    if (!error) setTotalSubmissions(count ?? 0);
  };

  const fetchSubmissionCountByStatus = async (
    userId: string,
    status: string | string[],
    setter: React.Dispatch<React.SetStateAction<number | null>>
  ) => {
    let query = supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("sourcer_id", userId);

    if (Array.isArray(status)) {
      query = query.in("status", status);
    } else {
      query = query.eq("status", status);
    }

    const { count, error } = await query;
    if (!error) setter(count ?? 0);
  }

  const fetchTotalCommission = async (userId: string) => {
    const { data, error } = await supabase
      .from("leads")
      .select("sale_price, purchase_price")
      .eq("sourcer_id", userId)
      .eq("status", "sold");
    if (!error && data) {
      let total = 0;
      for (const lead of data) {
        const profit = (lead.sale_price ?? 0) - (lead.purchase_price ?? 0);
        if (profit > 0) {
          total += profit * SOURCER_COMMISSION_RATE;
        }
      }
      setTotalCommission(total);
    }
  };

  const handleConnectStripe = async () => {
    setStripeLoading(true);
    try {
      const res = await fetch('/api/stripe-connect-onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email: profile?.email }),
      });
      const { url } = await res.json();
      window.open(url, "_blank");
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
    setIsStripeOnboarded(isOnboarded);
  };

  useEffect(() => {
    if (!userId) return;
    fetchUserProfile(userId);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    fetchTotalSubmissionsCount(userId);
    fetchSubmissionCountByStatus(userId, ['approved', 'picked up', 'pending sold', 'sold'], setTotalApproved);
    fetchSubmissionCountByStatus(userId, 'rejected', settotalRejected);
    fetchSubmissionCountByStatus(userId, 'sold', settotalSold);
    fetchTotalCommission(userId);
  }, [userId]);

  useEffect(() => {
    if (profile?.stripe_account_id) {
      checkStripeOnboarding(profile.stripe_account_id);
    }
  }, [profile?.stripe_account_id]);

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
                {totalApproved !== null ? totalApproved: "0"}
            </div>
            <div>
              <span className="font-semibold">Rejected Count:</span>{" "}
                {totalRejected!== null ? totalRejected: "0"}
            </div>
            <div>
              <span className="font-semibold">Sold Count:</span>{" "}
                {totalSold!== null ? totalSold: "0"}
            </div>
            <div>
              <span className="font-semibold">Total Commission:</span>{" $"}
                {totalCommission !== null ? totalCommission: "0"}
            </div>
            <div>
              <span className="font-semibold">Unpaid Commission:</span>{" "}
                {"-"}
            </div>
            <div>
              <span className="font-semibold">Stripe Account Id:</span>{" "}
                {profile?.stripe_account_id ?? "-"}
            </div>
          </div>
        </CardContent>
        {profile?.stripe_account_id ? (
          isStripeonboarded === null ? (
            <div>Checking Stripe status...</div>
          ) : isStripeonboarded ? (
            <div className="text-green-600 font-semibold">Connected to Stripe</div>
          ) : (
            <div className="text-yellow-600 font-semibold">Stripe onboarding incomplete</div>
          )
        ) : (
          <Button onClick={handleConnectStripe} disabled={stripeLoading}>
            {stripeLoading ? "Loading Stripe..." : "Connect with Stripe"}
          </Button>
        )}
      </Card>
    </div>
  );
}