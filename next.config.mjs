const nextConfig = {
  swcMinify: false, // Uses less memory
  output: "export", // Only if static site export is needed
  env: {
    NEXT_PUBLIC_FLESPI_TOKEN: process.env.NEXT_PUBLIC_FLESPI_TOKEN,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.com",
        pathname: "/**",
      },
    ],
  },
};
export default nextConfig;
