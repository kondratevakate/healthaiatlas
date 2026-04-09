import Link from "next/link";
import {
  contactEmail,
  primarySections,
  siteDescription,
  siteName,
} from "@/config/site";

export default function Footer() {
  return (
    <footer className="border-t border-border px-6 md:px-8 py-10 mt-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div>
            <h3 className="text-accent font-bold text-sm mb-3">{siteName}</h3>
            <p className="text-muted text-xs max-w-xs leading-relaxed">
              {siteDescription}
            </p>
          </div>

          <div>
            <h4 className="text-foreground font-semibold text-xs mb-3 uppercase tracking-wider">
              Maps
            </h4>
            <ul className="space-y-2">
              {primarySections.map((section) => (
                <li key={section.href}>
                  <Link
                    href={section.href}
                    className="text-muted text-xs hover:text-accent transition-colors"
                  >
                    {section.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-foreground font-semibold text-xs mb-3 uppercase tracking-wider">
              Contact
            </h4>
            <p className="text-muted text-xs mb-2">Questions or feedback?</p>
            <Link
              href="/contact"
              className="text-accent text-xs hover:underline block mb-1"
            >
              Get in touch
            </Link>
            <a
              href={`mailto:${contactEmail}`}
              className="text-muted text-xs hover:text-accent transition-colors"
            >
              {contactEmail}
            </a>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-border text-center">
          <p className="text-muted text-xs">
            &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
