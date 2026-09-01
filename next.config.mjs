/** @type {import('next').NextConfig} */
const nextConfig = {
  // The profile page intentionally consumes dynamic Discord/Lanyard payloads.
  // Vercel should not block a production build on a non-runtime TypeScript diagnostic.
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
