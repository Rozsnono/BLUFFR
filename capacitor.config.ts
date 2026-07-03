import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourcompany.impostorgame',
  appName: 'impostor-game',
  webDir: 'out', // Change this line
  server: {
    androidScheme: 'https'
  }
};

export default config;