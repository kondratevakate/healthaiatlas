import { permanentRedirect } from "next/navigation";
import { sections } from "@/config/sections";

export default function AiAutomationRedirectPage() {
  permanentRedirect(sections.processMining.canonicalPath);
}
