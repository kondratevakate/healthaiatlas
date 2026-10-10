// Lead tracking: one delegated click listener that reports every outbound
// "lead" link (newsletter, LinkedIn, Airtable form, email) to GA4 as a
// `generate_lead` event. Lives in one place so new CTAs anywhere on the site
// are tracked without per-component wiring.
//
// GA4 attributes the event to the session's source / medium / campaign
// (UTM tags included), which is what answers "where do leads come from".
// Mark `generate_lead` as a key event in GA Admin to see it in acquisition
// reports.
//
// Consent: gtag is called the same way regardless of the cookie choice.
// Consent Mode v2 (index.html) decides whether cookies are used.

export type LeadMethod = 'newsletter' | 'linkedin' | 'airtable_form' | 'email';

type Gtag = (...args: unknown[]) => void;

export function classifyLeadHref(href: string): LeadMethod | null {
  if (href.startsWith('mailto:')) return 'email';
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, '');
  if (host === 'linkedin.com') {
    return url.pathname.startsWith('/build-relation/newsletter-follow') ? 'newsletter' : 'linkedin';
  }
  if (host === 'airtable.com' && url.pathname.startsWith('/shr')) return 'airtable_form';
  return null;
}

export function installLeadTracking(doc: Document = document): () => void {
  const onClick = (e: MouseEvent) => {
    const anchor = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
    if (!anchor) return;
    const href = anchor.getAttribute('href') ?? '';
    const method = classifyLeadHref(href);
    if (!method) return;
    const gtag = (window as unknown as { gtag?: Gtag }).gtag;
    if (typeof gtag !== 'function') return;
    gtag('event', 'generate_lead', {
      lead_method: method,
      link_url: href,
      page_path: window.location.pathname,
      // Opening the link in a new tab keeps this page alive; for same-tab
      // navigation (mailto) beacon makes sure the hit is not dropped.
      transport_type: 'beacon',
    });
  };
  // Capture phase so a handler that stops propagation can't hide the click.
  doc.addEventListener('click', onClick, true);
  return () => doc.removeEventListener('click', onClick, true);
}
