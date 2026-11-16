import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
export default defineConfig({
  base: "/knightup/",
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["knight.svg", "icon-192.png", "icon-512.png"],
      manifest: {
        name: "KnightUp",
        short_name: "KnightUp",
        description: "Learn smarter. Play stronger.",
        start_url: "/knightup/",
        scope: "/knightup/",
        display: "standalone",
        background_color: "#f6f5f1",
        theme_color: "#f6f5f1",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
      workbox: {
        navigateFallback: "index.html",
        globPatterns: ["**/*.{js,css,html,svg,png,webmanifest,txt,md}"],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
});
