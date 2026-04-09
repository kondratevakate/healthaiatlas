import type { Metadata } from "next";
import EmbeddedMapPage from "@/components/EmbeddedMapPage";
import { sections, siteName } from "@/config/site";

const section = sections.oncology;

export const metadata: Metadata = {
  title: `${section.title} | ${siteName}`,
  description: section.description,
};

export default function OncologyPage() {
  return (
    <EmbeddedMapPage
      title={section.title}
      subtitle={section.subtitle ?? ""}
      iframeSrc={section.embedPath ?? ""}
      iframeTitle={section.title}
    />
  );
}
