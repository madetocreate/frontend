import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd()
  },
  
  // Compiler Optimierungen
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },
  
  // Bundle Optimierung
  experimental: {
    optimizePackageImports: ['@heroicons/react', 'framer-motion', 'recharts', 'lucide-react'],
  },
  
  // Disable static optimization for workspace routes (they use localStorage)
  async generateBuildId() {
    return 'build-' + Date.now();
  },
  
  // Image Optimierung
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        pathname: '/**'
      }
    ]
  },

  async redirects() {
    return [
      {
        source: '/integrations',
        destination: '/settings?view=integrations',
        permanent: true,
      },
      {
        source: '/telegram',
        destination: '/settings?view=integrations',
        permanent: true,
      },
      {
        source: '/telephony',
        destination: '/settings?view=integrations',
        permanent: true,
      },
      {
        source: '/website',
        destination: '/settings?view=integrations',
        permanent: true,
      },
      {
        source: '/reviews',
        destination: '/settings?view=integrations',
        permanent: true,
      },
    ]
  },

  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
}

export default nextConfig
