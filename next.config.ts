import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Use this if deploying to https://<USERNAME>.github.io/<REPO_NAME>
  // basePath: '/alfred-analysis-site',
};

export default nextConfig;
