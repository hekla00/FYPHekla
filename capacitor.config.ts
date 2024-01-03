import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.fyp.app",
  appName: "LibraryMate",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
};

export default config;
