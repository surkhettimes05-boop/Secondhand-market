import type { NextConfig } from "next";
const config: NextConfig = { poweredByHeader: false, images: { remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }] } };
export default config;
