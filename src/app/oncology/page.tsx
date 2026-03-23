import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Oncology AI Landscape | Health AI Atlas',
  description: 'Comprehensive map of AI companies in oncology — drug discovery, diagnostics, treatment planning, and clinical trials.',
}

export default function OncologyPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <div className="px-5 py-4 border-b border-border">
        <h1 className="text-accent font-bold text-lg">Oncology AI Landscape</h1>
        <p className="text-muted text-sm">
          Pharma benchmark, swimlane timeline, and company analysis
        </p>
      </div>
      <iframe
        src="/maps/oncology.html"
        className="flex-1 w-full border-0"
        title="Oncology AI Landscape"
      />
    </div>
  )
}
