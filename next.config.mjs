/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    resolveAlias: {
      '@': './',
    },
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig


 