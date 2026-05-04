import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Also pull env from `03_ai_directory/.env` (the parent of healthaiatlas) so
  // that a single shared HUG_API_KEY can be reused across sibling projects.
  // We accept HUG_ and VITE_ prefixes from that directory.
  const parentEnvDir = path.resolve(__dirname, "../..");
  const parentEnv = loadEnv(mode, parentEnvDir, ["HUG_", "VITE_"]);

  // Pick the HuggingFace token from any of these names (in priority order).
  const hfToken =
    process.env.VITE_HUG_API_KEY ||
    parentEnv.VITE_HUG_API_KEY ||
    parentEnv.HUG_API_KEY ||
    "";

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      // Inline the HF token at build time. import.meta.env.VITE_HUG_API_KEY
      // resolves to this value in the client bundle. Stays empty if not set.
      "import.meta.env.VITE_HUG_API_KEY": JSON.stringify(hfToken),
    },
  };
});
