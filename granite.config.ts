import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'my-cannon',
  brand: {
    displayName: '대포뽑기', 
    primaryColor: '#3182F6', 
    icon: process.env.VITE_CANNON_ICON || 'https://static.toss.im/appsintoss/3897/d3835105-aa16-4500-983a-8dd149dfbb91.png',
  },
  web: {
    host: process.env.VITE_DEV_HOST || 'localhost',
    port: 5173,
    commands: {
      dev: 'vite --host',
      build: 'tsc -b && vite build',
    },
  },
  permissions: [],
  outdir: 'dist',
  webViewProps: {
    type: 'partner',
  },
});

