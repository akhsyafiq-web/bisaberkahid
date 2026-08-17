import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  // Pin the workspace root (multiple lockfiles exist in the parent folder).
  turbopack: { root: path.resolve(__dirname) },
};

export default nextConfig;
