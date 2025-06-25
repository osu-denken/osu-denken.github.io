import type { NextConfig } from "next";
import { env } from "process";

const nextConfig: NextConfig = {
  allowedDevOrigins: [env.REPLIT_DOMAINS.split(",")[0]],
  //basePath: ""
  distDir: "docs",
  output: "export",
};

module.exports = nextConfig;
