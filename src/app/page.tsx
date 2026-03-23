import Link from 'next/link'

const maps = [
  {
    href: '/oncology',
    title: 'Oncology AI',
    description: 'Comprehensive map of AI companies in oncology — drug discovery, diagnostics, treatment planning, and clinical trials.',
    stats: [
      { label: 'Companies', value: '120+' },
      { label: 'Deal Value', value: '$8B+' },
    ],
    color: 'var(--pink)',
  },
  {
    href: '/ai-automation',
    title: 'AI Automation',
    description: 'Deal flow, products, and geographic analysis of healthcare AI automation vendors.',
    stats: [
      { label: 'Vendors', value: '35+' },
      { label: 'Countries', value: '18' },
    ],
    color: 'var(--blue)',
  },
  {
    href: '/medical-tourism',
    title: 'Medical Tourism',
    description: 'Medical tourism corridors and patient flow analysis — source markets, destinations, and specialty matching.',
    stats: [
      { label: 'Corridors', value: '25+' },
      { label: 'Destinations', value: '8' },
    ],
    color: 'var(--teal)',
  },
]

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-6 md:px-8 py-12">
      {/* Hero */}
      <section className="mb-20">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">
          <span className="text-accent">Health AI Atlas</span>
        </h1>
        <p className="text-muted text-lg max-w-xl leading-relaxed mb-8">
          Curated maps and analysis of AI in healthcare — oncology, patient management,
          and medical tourism. Explore the landscape of companies, deals, and opportunities.
        </p>
        <div className="flex gap-3 flex-wrap">
          <span className="text-xs px-3 py-1 rounded-full bg-surface-2 text-muted border border-border">
            Updated March 2026
          </span>
          <span className="text-xs px-3 py-1 rounded-full bg-surface-2 text-muted border border-border">
            Research-backed
          </span>
        </div>
      </section>

      {/* Map Cards */}
      <section className="mb-20">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mt-2 mb-8">
          Explore the Maps
        </h2>
        <div className="grid gap-5 grid-cols-1 md:grid-cols-3">
          {maps.map((map) => (
            <Link
              key={map.href}
              href={map.href}
              className="group block p-5 rounded-lg bg-surface-1 border border-border hover:border-accent transition-all no-underline"
            >
              <div
                className="w-2 h-2 rounded-full mb-4"
                style={{ backgroundColor: map.color }}
              />
              <h3 className="text-foreground font-semibold mb-2 group-hover:text-accent transition-colors">
                {map.title}
              </h3>
              <p className="text-muted text-sm leading-relaxed mb-4">
                {map.description}
              </p>
              <div className="flex gap-5">
                {map.stats.map((stat) => (
                  <div key={stat.label}>
                    <div className="text-accent font-bold text-lg">{stat.value}</div>
                    <div className="text-muted text-[11px] uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="p-6 rounded-lg bg-surface-1 border border-border mb-8">
        <h2 className="text-accent font-semibold mb-4">About This Project</h2>
        <p className="text-muted text-sm leading-relaxed mb-5">
          Health AI Atlas is a research project mapping the intersection of artificial intelligence
          and healthcare. We track companies, funding, partnerships, and market dynamics across
          oncology, patient management, and medical tourism sectors.
        </p>
        <p className="text-muted text-sm leading-relaxed">
          Data is sourced from public filings, press releases, and industry databases.
          Have feedback or suggestions? <Link href="/contact" className="text-accent hover:underline">Get in touch</Link>.
        </p>
      </section>
    </div>
  )
}
