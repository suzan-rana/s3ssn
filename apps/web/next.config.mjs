/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@s3ssn/types', 'geist'],
  experimental: {
    typedRoutes: false,
  },
};
export default nextConfig;
