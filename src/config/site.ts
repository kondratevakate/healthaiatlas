export const siteName = "Health AI Atlas";
export const siteDescription =
  "Curated maps and analysis of AI in healthcare — oncology, process mining, and medical tourism.";
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

type SectionStat = {
  label: string;
  value: string;
};

type SectionConfig = {
  href: string;
  legacyHrefs?: readonly string[];
  label: string;
  title: string;
  description: string;
  landingDescription: string;
  subtitle?: string;
  stats: readonly SectionStat[];
  color: string;
  embedPath?: string;
  artifactPath?: string;
};

export const sections = {
  oncology: {
    href: "/oncology",
    label: "Oncology",
    title: "Oncology",
    description:
      "Comprehensive map of AI companies in oncology — drug discovery, diagnostics, treatment planning, and clinical trials.",
    landingDescription:
      "Comprehensive map of AI companies in oncology — drug discovery, diagnostics, treatment planning, and clinical trials.",
    subtitle: "Pharma benchmark, swimlane timeline, and company analysis",
    stats: [
      { label: "Companies", value: "120+" },
      { label: "Deal Value", value: "$8B+" },
    ],
    color: "var(--pink)",
    embedPath: "/maps/oncology.html?embed",
    artifactPath: "public/maps/oncology.html",
  },
  processMining: {
    href: "/process-mining",
    legacyHrefs: ["/ai-automation", "/healthcare-pm"],
    label: "Process Mining",
    title: "Process Mining",
    description:
      "Healthcare process mining landscape — deal flow, products, and geographic analysis of vendors, tooling, and care pathway opportunities.",
    landingDescription:
      "Healthcare process mining landscape — deal flow, products, and geographic analysis of vendors, tooling, and care pathway opportunities.",
    subtitle:
      "Deal flow, products, open landscape, geography, and timeline",
    stats: [
      { label: "Vendors", value: "35+" },
      { label: "Countries", value: "18" },
    ],
    color: "var(--blue)",
    embedPath: "/maps/process-mining.html?embed",
    artifactPath: "public/maps/process-mining.html",
  },
  medicalTourism: {
    href: "/medical-tourism",
    legacyHrefs: ["/funnel"],
    label: "Medical Tourism",
    title: "Medical Tourism",
    description:
      "Medical tourism corridors and patient flow analysis — source markets, destinations, and specialty matching.",
    landingDescription:
      "Medical tourism corridors and patient flow analysis — source markets, destinations, and specialty matching.",
    stats: [
      { label: "Corridors", value: "25+" },
      { label: "Destinations", value: "8" },
    ],
    color: "var(--teal)",
  },
} satisfies Record<PrimarySectionKey, SectionConfig>;

export const primarySections = primarySectionKeys.map((key) => sections[key]);

export const navigationItems = [
  ...primarySections.map(({ href, label }) => ({ href, label })),
  { href: "/contact", label: "Contact" },
] as const;

export const legacyRedirects = [
  {
    source: "/healthcare-pm",
    destination: sections.processMining.href,
    permanent: true,
  },
  {
    source: "/ai-automation",
    destination: sections.processMining.href,
    permanent: true,
  },
  {
    source: "/funnel",
    destination: sections.medicalTourism.href,
    permanent: true,
  },
  {
    source: "/maps/ai-automation.html",
    destination: "/maps/process-mining.html",
    permanent: true,
  },
] as const;
