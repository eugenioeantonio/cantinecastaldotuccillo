import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // product photographs are served by Shopify's CDN
    remotePatterns: [{ protocol: "https", hostname: "cdn.shopify.com", pathname: "/**" }],
  },
};

export default nextConfig;
