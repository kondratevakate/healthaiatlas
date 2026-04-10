import type { Metadata } from "next";
import Contact from "@/views/Contact";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact",
  description: "Get in touch with AI Health Directory - questions, feedback, or collaboration.",
});

export default function ContactPage() {
  return <Contact />;
}
