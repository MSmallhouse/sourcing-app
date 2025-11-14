'use client'

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AccountPage() {
  const { userId, isAdmin } = useCurrentUser();
  const [profile, setProfile] = useState<{
    first_name: string;
    last_name: string;
    email: string;
  } | null>(null);
  const [totalSubmissions, setTotalSubmissions] = useState<number | null>(null);
  const [totalApproved, setTotalApproved] = useState<number | null>(null);
  const [totalRejected, settotalRejected] = useState<number | null>(null);
  const [totalSold, settotalSold] = useState<number | null>(null);

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("first_name, last_name, email")
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
  }, [userId]);

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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}