/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@excalidraw/excalidraw"],
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };
    return config;
  },
};

module.exports = nextConfig;
