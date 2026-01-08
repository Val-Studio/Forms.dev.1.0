import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Next.js 16 features
  cacheComponents: false, // Disable to allow dynamic route configs
  reactStrictMode: true,
}

export default nextConfig
