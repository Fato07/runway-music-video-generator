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

  }
}

module.exports = nextConfig
