/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    // Skip ESLint during production builds to avoid ESLint issues
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lovely-flamingo-139.convex.cloud" },
      { protocol: "https", hostname: "posh-greyhound-772.convex.cloud" },
      { protocol: "https", hostname: "cheery-wildebeest-522.convex.cloud" },
      { protocol: "https", hostname: "img.clerk.com" },
    ],
  },
  // CSS optimization configuration
  experimental: {
    // Only enable optimizeCss in production and when not on Vercel
    optimizeCss: process.env.NODE_ENV === 'production' && !process.env.VERCEL ? true : false
  },
  // This setting enables proper loading.tsx behavior
  reactStrictMode: true,
};

export default nextConfig;
