import type { NextConfig } from "next";
import { env } from "process";

const isExport: boolean = process.env.NEXT_PHASE === "phase-export";
const isDev: boolean = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  //allowedDevOrigins: [env.REPLIT_DOMAINS.split(",")[0]],
  //basePath: ""
  distDir: isExport ? "docs" : ".next",
  output: isExport ? "export" : undefined,
};

module.exports = nextConfig;
