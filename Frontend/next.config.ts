import type { NextConfig } from "next";
import os from "os";

// ดึง IP จริงของเครื่องอัตโนมัติ
function getLocalIPs(): string[] {
  const interfaces = os.networkInterfaces();
  const ips: string[] = [];
  
  for (const nets of Object.values(interfaces)) {
    for (const net of nets ?? []) {
      if (net.family === "IPv4" && !net.internal) {
        ips.push(net.address);
      }
    }
  }
  return ips;
}

const nextConfig: NextConfig = {
  turbopack: {},
  allowedDevOrigins: getLocalIPs(),
};

export default nextConfig;