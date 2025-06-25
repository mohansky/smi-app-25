/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    resolveAlias: {
      '@': './src',
    },
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig


 