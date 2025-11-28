/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 16 optimizations
  reactStrictMode: true,
  
  // Enable experimental features
  experimental: {
    optimizePackageImports: ['framer-motion', 'lenis'],
    scrollRestoration: true,
    viewTransition: true,
  },
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    minimumCacheTTL: 60,
  },
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;
