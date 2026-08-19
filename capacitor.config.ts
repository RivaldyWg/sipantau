import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Konfigurasi Capacitor — pembungkus Android untuk SiPANTAU.
 *
 * Arsitektur: APK ini bukan aplikasi statis. Ia memuat aplikasi
 * web dari server Vercel (server.url) di dalam WebView. Semua
 * Server Component, Server Action, dan RLS tetap berjalan di server.
 *
 * webDir berisi satu halaman HTML fallback yang ditampilkan
 * kalau server belum tersambung (misalnya saat pertama pasang
 * dan URL belum dikonfigurasi, atau saat tidak ada internet).
 *
 * Setelah Vercel terpasang, ganti server.url dengan URL asli.
 */
const config: CapacitorConfig = {
  appId: "id.polri.sipantau",
  appName: "SiPANTAU",
  webDir: "cap-fallback",

  server: {
    // URL Vercel produksi — diisi setelah deploy berhasil (Langkah 5/6).
    url: "https://sipantau-six.vercel.app",
    androidScheme: "https",
  },

  android: {
    // Izinkan mixed content untuk development
    allowMixedContent: false,
    // Warna status bar sesuai palet SiPANTAU
    backgroundColor: "#0F1C32",
  },

  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: "#0F1C32",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
