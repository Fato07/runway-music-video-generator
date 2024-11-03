/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true,
  },
  env: {
    RUNWAYML_API_SECRET: process.env.RUNWAYML_API_SECRET,
    HUGGINGFACE_HUB_TOKEN: process.env.HUGGINGFACE_HUB_TOKEN,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_ORGANISATION_ID: process.env.OPENAI_ORGANISATION_ID,
  },
  async headers() {
    return [
      {
        source: '/results/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
