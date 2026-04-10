import { permanentRedirect } from "next/navigation";
import { sections } from "@/config/sections";

export default function ProcessMiningRedirectPage() {
  permanentRedirect(sections.processMining.canonicalPath);
}
