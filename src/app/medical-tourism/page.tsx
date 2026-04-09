import type { Metadata } from "next";
import MedicalTourism from "./MedicalTourism";
import { sections, siteName } from "@/config/site";

const section = sections.medicalTourism;

export const metadata: Metadata = {
  title: `${section.title} | ${siteName}`,
  description: section.description,
};

export default function MedicalTourismPage() {
  return <MedicalTourism />;
}
