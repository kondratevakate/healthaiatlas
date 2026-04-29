# Security Policy

HealthAI Atlas is a public information platform with a paid professional tier built on top. We take security and data integrity seriously.

## Reporting a vulnerability

If you discover a security issue in HealthAI Atlas, please **do not open a public GitHub issue**. Instead:

1. Email **security@healthaiatlas.com** (or, until that mailbox is provisioned, send a direct message to the founder via the email listed at the bottom of the public site About page).
2. Include:
   - A description of the vulnerability.
   - Steps to reproduce.
   - The affected URL or component.
   - Your assessment of severity (low / medium / high / critical).
   - Whether you have already attempted any disclosure publicly.
3. We will acknowledge receipt within **3 business days** and provide an initial assessment within **7 business days**.

We commit to:

- Confirming the issue or explaining why we believe it is not a vulnerability
- Keeping you informed of progress on a fix
- Crediting you publicly (if you wish) once the fix is shipped

We ask in return:

- Give us reasonable time to fix before public disclosure (90 days standard, longer for complex issues)
- Do not exfiltrate data beyond what is necessary to demonstrate the issue
- Do not pivot from one finding into broader unauthorized access
- Do not perform DoS-style testing

## Scope

**In scope:**

- Public site (`https://healthaiatlas.com` and any subdomains, when live)
- Public API (when live)
- Paid-tier API (auth bypass, watermark stripping, rate-limit bypass, IDOR, injection)
- Data integrity issues (claims that misrepresent organizations in ways that could damage reputations)

**Out of scope:**

- Third-party services we use (Cloudflare, Stripe, Supabase, etc.) — report directly to those vendors
- Issues requiring physical access to a user's device
- Social engineering of HealthAI Atlas team members
- Self-XSS that requires the user to paste arbitrary code into their own browser console
- Best-practice findings without demonstrable security impact

## Sensitive data handling

HealthAI Atlas stores:

- **Public-layer data:** publicly available information about organizations and their AI products.
- **Paid-layer data:** structured exports including principal contact information for individuals in their professional capacity.
- **Customer account data:** name, email, organization, payment method (via Stripe), API access logs.

We do **not** store:

- Patient-level clinical data
- Health records
- Government-issued IDs

Personal contact information in the paid tier is subject to PDPL (UAE), GDPR (EU), and equivalent regulations. See our [Privacy Policy](https://healthaiatlas.com/privacy) (forthcoming) and [`docs/strategy/ip-and-legal.md`](docs/strategy/ip-and-legal.md) for our compliance posture.

## Security defenses summary

- HTTPS / TLS enforced on every endpoint
- Rate limiting on public pages and authenticated API
- Cloudflare Bot Management in front of the site
- Per-user JWT authentication tokens with embedded watermarks
- Database-level encryption at rest for personal contact info fields
- Audit log for all paid-tier data mutations (12-month retention, monthly anomaly review)

For full architecture, see [`docs/strategy/anti-scraping.md`](docs/strategy/anti-scraping.md).

## Right to erasure

If you are listed in the public layer and want your information removed, see the data-correction process in [`CONTRIBUTING.md`](CONTRIBUTING.md). For paid-tier removal requests, email **privacy@healthaiatlas.com** (or the founder address until that mailbox is provisioned).
