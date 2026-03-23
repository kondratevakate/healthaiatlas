import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Automation | Health AI Atlas',
  description: 'Deal flow, products, and geographic analysis of healthcare AI automation vendors.',
}

export default function AIAutomationPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <div className="px-5 py-4 border-b border-border">
        <h1 className="text-accent font-bold text-lg">AI Automation</h1>
        <p className="text-muted text-sm">
          Deal flow, products, open landscape, geography, and timeline
        </p>
      </div>
      <iframe
        src="/maps/ai-automation.html"
        className="flex-1 w-full border-0"
        title="AI Automation"
      />
    </div>
  )
}
