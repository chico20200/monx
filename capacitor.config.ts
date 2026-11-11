import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // Identificador único de la app (no cambiar después de publicar)
  appId: 'io.github.chico20200.monx',
  appName: 'Monx',
  webDir: 'www/browser',
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: false, // la oculta AppComponent cuando Angular termina de cargar
      backgroundColor: '#3a5ca6',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
  },
};

export default config;
