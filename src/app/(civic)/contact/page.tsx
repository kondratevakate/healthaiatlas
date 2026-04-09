import type { Metadata } from "next";
import { createCivicPage } from "@/app/(civic)/_shared/page-factories";
import { siteName } from "@/config/site-content";

export const metadata: Metadata = {
  title: `Contact | ${siteName}`,
  description: `Get in touch with ${siteName} - questions, feedback, or collaboration.`,
};

export default createCivicPage("/contact");
