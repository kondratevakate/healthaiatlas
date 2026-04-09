import type { NextConfig } from "next";
import { legacyRedirects } from "./src/config/site";

const nextConfig: NextConfig = {
  async redirects() {
    return legacyRedirects.map((redirect) => ({ ...redirect }));
  },
};

export default nextConfig;
