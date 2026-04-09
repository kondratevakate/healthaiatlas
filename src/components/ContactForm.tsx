'use client'

import { useState } from 'react'
import { contactEmail, siteName } from '@/config/site'

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('submitting')

    const form = e.currentTarget
    const formData = new FormData(form)

    try {
      // FormSubmit.co — no registration needed, sends to email directly
      const response = await fetch(`https://formsubmit.co/ajax/${contactEmail}`, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      })

      if (response.ok) {
        setStatus('success')
        form.reset()
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="p-4 rounded-lg bg-green/10 border border-green/30 text-green text-sm">
        Thanks for your message! We&apos;ll get back to you soon.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="text" name="_honey" style={{ display: 'none' }} />
      <input type="hidden" name="_captcha" value="false" />
      <input type="hidden" name="_subject" value={`${siteName} — New Contact`} />

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-muted mb-2">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="w-full px-3 py-2 text-sm bg-surface-1 border border-border rounded-lg text-foreground focus:outline-none focus:border-accent"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-muted mb-2">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          className="w-full px-3 py-2 text-sm bg-surface-1 border border-border rounded-lg text-foreground focus:outline-none focus:border-accent resize-none"
          placeholder="Your message..."
        />
      </div>

      {status === 'error' && (
        <p className="text-red text-xs">Something went wrong. Please try again.</p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="px-5 py-2.5 text-sm font-medium bg-accent text-background rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {status === 'submitting' ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  )
}
