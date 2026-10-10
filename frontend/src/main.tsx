import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { installLeadTracking } from "./lib/leadTracking";
import "./index.css";

installLeadTracking();

createRoot(document.getElementById("root")!).render(<App />);
