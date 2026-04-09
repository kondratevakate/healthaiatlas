import Link from "next/link";
import { primarySections, siteDescription, siteName } from "@/config/site";

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-6 md:px-8 py-12">
      <section className="mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
          <span className="text-accent">{siteName}</span>
        </h1>
        <p className="text-muted text-lg max-w-xl leading-relaxed mb-8">
          {siteDescription} Explore the landscape of companies, deals, and
          opportunities.
        </p>
        <div className="flex items-center gap-4 flex-wrap mb-8">
          <Link
            href="/oncology"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent font-semibold rounded-lg hover:opacity-90 transition-opacity no-underline hover:no-underline"
            style={{ color: "#07090f" }}
          >
            Explore the Data
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-border text-foreground font-medium rounded-lg hover:border-accent hover:text-accent transition-colors no-underline hover:no-underline"
          >
            Get in Touch
          </Link>
        </div>
        <div className="flex gap-3 flex-wrap">
          <span className="text-sm px-4 py-1.5 rounded-full bg-surface-2 text-foreground border border-accent/30">
            Updated March 2026
          </span>
          <span className="text-sm px-4 py-1.5 rounded-full bg-surface-2 text-foreground border border-accent/30">
            Research-backed
          </span>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-6">
          Explore the Maps
        </h2>
        <div className="grid gap-5 grid-cols-1 md:grid-cols-3">
          {primarySections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group block p-5 rounded-lg bg-surface-1 border border-border hover:border-accent hover:bg-surface-2 transition-all no-underline"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: section.color }}
                />
                <svg
                  className="w-4 h-4 text-muted group-hover:text-accent group-hover:translate-x-1 transition-all"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
              <h3 className="text-foreground font-semibold mb-2 group-hover:text-accent transition-colors">
                {section.label}
              </h3>
              <p className="text-muted text-sm leading-relaxed mb-4">
                {section.landingDescription}
              </p>
              <div className="flex gap-5">
                {section.stats.map((stat) => (
                  <div key={stat.label}>
                    <div className="text-accent font-bold text-lg">
                      {stat.value}
                    </div>
                    <div className="text-muted text-[11px] uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="p-6 rounded-lg bg-surface-1 border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          About This Project
        </h2>
        <p className="text-muted text-sm leading-relaxed mb-4">
          {siteName} is a research project mapping the intersection of
          artificial intelligence and healthcare. We track companies,
          funding, partnerships, and market dynamics across oncology,
          process mining, and medical tourism.
        </p>
        <p className="text-muted text-sm leading-relaxed">
          Data is sourced from public filings, press releases, and industry
          databases. Have feedback or suggestions?{" "}
          <Link href="/contact" className="text-accent hover:underline">
            Get in touch
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
