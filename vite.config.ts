import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  server: {
    port: 9876,
    strictPort: false, // Allow Vite to try another port if 9876 is in use
    host: true, // Listen on all addresses, including LAN and public addresses
  },
});
