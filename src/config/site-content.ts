export const siteName = "AI Health Directory";
export const siteDescription =
  "Civic-style directory, research paths, and curated signals for AI in the UAE healthcare ecosystem.";
export const siteKeywords = [
  "healthcare AI",
  "oncology",
  "process mining",
  "medical tourism",
  "digital health",
];
export const contactEmail = "kate@atelic.ai";
export const analyticsEnvVar = "NEXT_PUBLIC_GA_ID";
export const secondaryAttribution = {
  name: "Atelic",
  url: "https://atelic.ai",
  label: "Published by Atelic",
};

export const primarySectionKeys = [
  "oncology",
  "processMining",
  "medicalTourism",
] as const;

export type PrimarySectionKey = (typeof primarySectionKeys)[number];

export type SectionStat = {
  label: string;
  value: string;
};

export type DirectorySection = {
  slug: string;
  href: string;
  canonicalPath: string;
  topLevelPath: string;
  legacyPaths: readonly string[];
  label: string;
  title: string;
  description: string;
  landingDescription: string;
  subtitle?: string;
  stats: readonly SectionStat[];
  color: string;
  artifactType: "embedded-map" | "react-canvas";
  embedPath?: string;
  artifactPath?: string;
};

type RedirectConfig = {
  source: string;
  destination: string;
  permanent: boolean;
};

export const sections = {
  oncology: {
    slug: "oncology",
    href: "/directory/oncology",
    canonicalPath: "/directory/oncology",
    topLevelPath: "/oncology",
    legacyPaths: [],
    label: "Oncology",
    title: "Oncology",
    description:
      "Comprehensive map of AI companies in oncology - drug discovery, diagnostics, treatment planning, and clinical trials.",
    landingDescription:
      "Comprehensive map of oncology AI builders, strategic deals, and program activity across drug discovery, diagnostics, and clinical care.",
    subtitle: "Pharma benchmark, swimlane timeline, and company analysis",
    stats: [
      { label: "Companies", value: "120+" },
      { label: "Deal Value", value: "$8B+" },
    ],
    color: "hsl(var(--pink))",
    artifactType: "embedded-map",
    embedPath: "/maps/oncology.html?embed",
    artifactPath: "public/maps/oncology.html",
  },
  processMining: {
    slug: "process-mining",
    href: "/directory/process-mining",
    canonicalPath: "/directory/process-mining",
    topLevelPath: "/process-mining",
    legacyPaths: ["/ai-automation", "/healthcare-pm"],
    label: "Process Mining",
    title: "Process Mining",
    description:
      "Healthcare process mining landscape - deal flow, products, and geographic analysis of vendors, tooling, and care pathway opportunities.",
    landingDescription:
      "Operational map of healthcare process mining vendors, workflow intelligence, geography, and care-pathway redesign opportunities.",
    subtitle: "Deal flow, products, open landscape, geography, and timeline",
    stats: [
      { label: "Vendors", value: "35+" },
      { label: "Countries", value: "18" },
    ],
    color: "hsl(var(--blue))",
    artifactType: "embedded-map",
    embedPath: "/maps/process-mining.html?embed",
    artifactPath: "public/maps/process-mining.html",
  },
  medicalTourism: {
    slug: "medical-tourism",
    href: "/directory/medical-tourism",
    canonicalPath: "/directory/medical-tourism",
    topLevelPath: "/medical-tourism",
    legacyPaths: ["/funnel"],
    label: "Medical Tourism",
    title: "Medical Tourism",
    description:
      "Medical tourism corridors and patient flow analysis - source markets, destinations, and specialty matching.",
    landingDescription:
      "Corridor analysis for cross-border care demand, destination strengths, vendor tooling, and funnel diagnostics.",
    subtitle: "Corridors, vendor tooling, timeline signals, and funnel diagnostics",
    stats: [
      { label: "Corridors", value: "25+" },
      { label: "Destinations", value: "8" },
    ],
    color: "hsl(var(--teal))",
    artifactType: "react-canvas",
  },
} satisfies Record<PrimarySectionKey, DirectorySection>;

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
