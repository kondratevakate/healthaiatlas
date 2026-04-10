import { permanentRedirect } from "next/navigation";
import { sections } from "@/config/sections";

export default function MedicalTourismRedirectPage() {
  permanentRedirect(sections.medicalTourism.canonicalPath);
}
