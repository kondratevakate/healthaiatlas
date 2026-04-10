import type { Metadata } from "next";
import { siteDescription, siteKeywords, siteName } from "@/config/site";

type PageMetadataInput = {
  title?: string;
  description?: string;
};

export function buildSiteMetadata(): Metadata {
  return {
    title: siteName,
    description: siteDescription,
    keywords: siteKeywords,
    authors: [{ name: siteName }],
    openGraph: {
      title: siteName,
      description: siteDescription,
      type: "website",
    },
  };
}

export function buildPageMetadata({
  title,
  description = siteDescription,
}: PageMetadataInput): Metadata {
  const resolvedTitle = title ? `${title} | ${siteName}` : siteName;

  return {
    title: resolvedTitle,
    description,
    openGraph: {
      title: resolvedTitle,
      description,
      type: "website",
    },
  };
}
