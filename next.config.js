/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/**',
      },
    ],
  },
  // pdf-parse must run in Node.js runtime, not the Edge runtime
  serverExternalPackages: ['pdf-parse'],
}

module.exports = nextConfig
