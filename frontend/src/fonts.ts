// Self-hosted brand fonts (bundled by Vite into /assets). Replaces the Google
// Fonts @imports that used to sit at the top of index.css: those were a chain
// of render-blocking third-party requests on first load, needed CSP
// exceptions, and sent every visitor's IP to Google.
// Same families and weights as before. Each file declares unicode-range
// subsets, so the browser only downloads the faces and scripts a page uses.
import "@fontsource/space-grotesk/300.css";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/lora/400.css";
import "@fontsource/lora/500.css";
import "@fontsource/lora/600.css";
import "@fontsource/lora/700.css";
import "@fontsource/space-mono/400.css";
import "@fontsource/space-mono/400-italic.css";
import "@fontsource/space-mono/700.css";
import "@fontsource/space-mono/700-italic.css";
import "@fontsource/ibm-plex-sans-arabic/400.css";
import "@fontsource/ibm-plex-sans-arabic/500.css";
import "@fontsource/ibm-plex-sans-arabic/600.css";
import "@fontsource/ibm-plex-sans-arabic/700.css";
