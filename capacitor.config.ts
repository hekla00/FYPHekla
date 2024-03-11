import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fyp.app',
  appName: 'LibraryVault',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // Remove the follwoing line when the app is ready for production
    url: 'http://127.0.0.1:8100',
  },
};

export default config;
