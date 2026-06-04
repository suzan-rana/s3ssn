/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@veyra/types', 'geist'],
  experimental: {
    typedRoutes: false,
  },
};
export default nextConfig;
