import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'my-cannon',
  brand: {
    displayName: '대포뽑기', 
    primaryColor: '#3182F6', 
    icon: process.env.VITE_CANNON_ICON || "/public/myCannon.png", 
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
});

