/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lovely-flamingo-139.convex.cloud" },
      { protocol: "https", hostname: "posh-greyhound-772.convex.cloud" },
      { protocol: "https", hostname: "img.clerk.com" },
    ],
  },
  // Enable optimizations
  experimental: {
    optimizeCss: true
  },
  // This setting enables proper loading.tsx behavior
  reactStrictMode: true,
};

export default nextConfig;
