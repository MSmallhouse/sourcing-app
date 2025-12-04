import type { NextConfig } from "next";
const supabaseDomain = process.env.NEXT_PUBLIC_SUPABASE_DOMAIN || "";

const nextConfig: NextConfig = {
  images: {
    domains: [
      supabaseDomain,
    ]
  }
};

export default nextConfig;
