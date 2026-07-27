/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  compress: true,

  images: {
    remotePatterns: [
      { hostname: "*.amazonaws.com" },
      { hostname: "*.cloudinary.com" }
    ]
  },

  headers: async () => [
    {
      source: "/api/:path*",
      headers: [
        { key: "Cache-Control", value: "no-store" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" }
      ]
    }
  ],

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
  }
};

export default config;
