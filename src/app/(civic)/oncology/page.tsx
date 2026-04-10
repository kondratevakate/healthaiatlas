import { permanentRedirect } from "next/navigation";
import { sections } from "@/config/sections";

export default function OncologyRedirectPage() {
  permanentRedirect(sections.oncology.canonicalPath);
}
