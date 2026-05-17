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

  // Production guard: refuse to inline an HF token into a prod bundle unless
  // an LLM proxy URL is also set (meaning the bundle won't actually call HF
  // directly — the token is dead weight from a previous dev workflow).
  //
  // Anything ending up in `define` is string-substituted into the bundled JS
  // and trivially readable by `curl https://<host>/assets/index-*.js`. The
  // backend risk report flagged this as PB1.
  const proxyUrl = process.env.VITE_AI_INSIGHTS_URL || parentEnv.VITE_AI_INSIGHTS_URL || "";
  const looksLikeProxy = proxyUrl && !/router\.huggingface\.co|api-inference\.huggingface\.co/i.test(proxyUrl);

  if (mode === "production" && hfToken && !looksLikeProxy) {
    throw new Error(
      "[vite.config] Refusing to build: VITE_HUG_API_KEY is set but no LLM proxy URL " +
        "is configured. Inlining the token into the prod bundle exposes it to anyone " +
        "fetching the static JS. Either unset VITE_HUG_API_KEY for the prod build, or " +
        "route through a server-side proxy via VITE_AI_INSIGHTS_URL.",
    );
  }

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
      // resolves to this value in the client bundle. Stays empty if not set,
      // and is rejected outright in production by the guard above.
      "import.meta.env.VITE_HUG_API_KEY": JSON.stringify(hfToken),
    },
  };
});
