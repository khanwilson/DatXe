import { ConfigContext, ExpoConfig } from 'expo/config';

// Dynamic config: extends the static app.json and injects the Google Maps API
// keys read from the environment (.env / EAS secrets). react-native-maps@1.20.1
// ships no config plugin — Expo prebuild reads the keys directly from
// ios.config.googleMapsApiKey and android.config.googleMaps.apiKey set here.
// Keys are build-time only, so they are intentionally NOT prefixed with
// EXPO_PUBLIC_ and never committed — see .env.example for the variable names.
export default ({ config }: ConfigContext): ExpoConfig => {
  const androidKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY ?? '';
  const iosKey = process.env.GOOGLE_MAPS_IOS_API_KEY ?? '';

  return {
    ...config,
    // ExpoConfig requires name + slug; app.json always provides them.
    name: config.name ?? 'Dat Xe',
    slug: config.slug ?? 'datxe',
    ios: {
      ...config.ios,
      config: {
        ...config.ios?.config,
        googleMapsApiKey: iosKey,
      },
    },
    android: {
      ...config.android,
      config: {
        ...config.android?.config,
        googleMaps: {
          ...config.android?.config?.googleMaps,
          apiKey: androidKey,
        },
      },
    },
  };
};
