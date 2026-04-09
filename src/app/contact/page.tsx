import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import {
  contactEmail,
  secondaryAttribution,
  siteDescription,
  siteName,
} from "@/config/site";

export const metadata: Metadata = {
  title: `Contact | ${siteName}`,
  description: `Get in touch with ${siteName} — questions, feedback, or collaboration.`,
};

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 md:px-8 py-12">
      <h1 className="text-2xl font-bold text-accent mb-3">Contact</h1>
      <p className="text-muted mb-12">
        Questions, feedback, or collaboration ideas? Reach out.
      </p>

      <div className="grid md:grid-cols-2 gap-10 items-start">
        <div>
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">
            Send a Message
          </h2>
          <ContactForm />
        </div>

        <div>
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">
            Connect
          </h2>

          <div className="space-y-4">
            <div className="p-5 rounded-lg bg-surface-1 border border-border">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-lg">
                  K
                </div>
                <div>
                  <div className="font-semibold text-foreground">
                    Kate Kondrateva
                  </div>
                  <div className="text-sm text-muted">
                    Founder, {secondaryAttribution.name}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <a
                  href={`mailto:${contactEmail}`}
                  className="flex items-center gap-3 text-sm text-muted hover:text-accent transition-colors"
                >
                  <span className="w-5 text-center">@</span>
                  {contactEmail}
                </a>

                <a
                  href="https://linkedin.com/in/kondratevakate"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-muted hover:text-accent transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </a>

                <a
                  href="https://atelic.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-muted hover:text-accent transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                  </svg>
                  atelic.ai
                </a>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-surface-2 border border-border text-sm text-muted">
              <p>
                {siteName} is a research project published by{" "}
                <a
                  href={secondaryAttribution.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  {secondaryAttribution.name}
                </a>{" "}
                — {siteDescription.toLowerCase()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
