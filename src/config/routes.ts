import { sections } from "./sections";

type RedirectConfig = {
  source: string;
  destination: string;
  permanent: boolean;
};

export const legacyRedirects = [
  {
    source: sections.oncology.topLevelPath,
    destination: sections.oncology.canonicalPath,
    permanent: true,
  },
  {
    source: sections.processMining.topLevelPath,
    destination: sections.processMining.canonicalPath,
    permanent: true,
  },
  {
    source: sections.medicalTourism.topLevelPath,
    destination: sections.medicalTourism.canonicalPath,
    permanent: true,
  },
  {
    source: "/healthcare-pm",
    destination: sections.processMining.canonicalPath,
    permanent: true,
  },
  {
    source: "/ai-automation",
    destination: sections.processMining.canonicalPath,
    permanent: true,
  },
  {
    source: "/funnel",
    destination: sections.medicalTourism.canonicalPath,
    permanent: true,
  },
  {
    source: "/maps/ai-automation.html",
    destination: "/maps/process-mining.html",
    permanent: true,
  },
] as const satisfies readonly RedirectConfig[];
