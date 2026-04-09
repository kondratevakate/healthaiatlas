import { permanentRedirect } from "next/navigation";
import { sections } from "@/config/site";

export default function AIAutomationPage() {
  permanentRedirect(sections.processMining.href);
}
