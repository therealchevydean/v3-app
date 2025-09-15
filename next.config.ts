import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["https://3006-firebase-v3-app-1757400344191.cluster-r7kbxfo3fnev2vskbkhhphetq6.cloudworkstations.dev"],
    },
  },
};

export default nextConfig;
