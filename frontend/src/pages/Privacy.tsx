import { Layout } from '@/components/layout';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';

const LAST_UPDATED = 'April 22, 2026';

const Privacy = () => {
  return (
    <Layout>
      <div className="container py-12 md:py-16 max-w-3xl">
        <PageHeader
          title="Privacy Policy"
          subtitle={<span className="text-sm">Last updated: {LAST_UPDATED}</span>}
        />

        <div className="space-y-10 text-body text-foreground">
          <section>
            <h2 className="heading-lg mb-3">Who we are</h2>
            <p className="text-muted-foreground">
              HealthAI Atlas is an independent research and educational project owned and operated
              by Dr. Ekaterina Kondrateva in personal capacity. The project is not affiliated with,
              owned by, or operated under the authority of any other organisation, employer, or
              commercial entity. Contact for any data or privacy inquiry:{' '}
              <a href="https://airtable.com/shrkedcsqRIdT60o3" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                the project contact form
              </a>
              . See also <Link to="/about" className="text-primary hover:underline">About</Link> and{' '}
              <Link to="/terms" className="text-primary hover:underline">Terms</Link>.
            </p>
          </section>

          <section>
            <h2 className="heading-lg mb-3">What data we collect</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-2">
              <li>
                <strong>Anonymous analytics via Google Analytics 4</strong> — page views, referrer,
                device/browser category, and country-level geolocation derived from IP
                (IP itself is not stored). No user profiles, no cross-site tracking, no advertising IDs.
              </li>
              <li>
                <strong>Local browser storage</strong> — when you complete a self-assessment and save or share
                the result, the response is stored in your own browser&apos;s localStorage. It never leaves your device
                unless you explicitly share the link.
              </li>
              <li>
                We do <strong>not</strong> collect accounts, names, emails, health information, or any other
                personally identifiable information (PII).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="heading-lg mb-3">Legal basis (GDPR)</h2>
            <p className="text-muted-foreground">
              Processing is based on legitimate interest in maintaining and improving a free public
              research resource. No profiling, no automated decision-making, no data sales or sharing
              with advertisers.
            </p>
          </section>

          <section>
            <h2 className="heading-lg mb-3">Retention</h2>
            <p className="text-muted-foreground">
              Google Analytics data is retained for 14 months (the minimum configurable). Local browser
              storage persists until you clear it in your browser settings.
            </p>
          </section>

          <section>
            <h2 className="heading-lg mb-3">Your rights</h2>
            <p className="text-muted-foreground mb-2">
              Under GDPR and equivalent regulations you have the right to access, rectify, erase,
              restrict processing, object, and port your data. Since we don&apos;t store PII, most requests
              can be satisfied by clearing your browser storage and opting out of analytics (browser
              Do-Not-Track, an ad-blocker, or the{' '}
              <a
                href="https://tools.google.com/dlpage/gaoptout"
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Analytics opt-out add-on
              </a>
              ).
            </p>
            <p className="text-muted-foreground">
              For any other request, email {' '}
              <a href="https://airtable.com/shrkedcsqRIdT60o3" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                the project contact form
              </a>{' '}
              and we will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="heading-lg mb-3">Third-party processors</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-2">
              <li>Google Analytics (Google LLC) — analytics processor</li>
              <li>Amazon Web Services — static hosting (EU/US regions)</li>
            </ul>
          </section>

          <section>
            <h2 className="heading-lg mb-3">Security</h2>
            <p className="text-muted-foreground">
              All traffic is served over HTTPS. The site is a static single-page application with no
              server-side data stores; there is no database, no user accounts, and no protected health
              information (PHI).
            </p>
          </section>

          <section>
            <h2 className="heading-lg mb-3">Breach notification</h2>
            <p className="text-muted-foreground">
              In the unlikely event of a data breach affecting EU/UK data subjects, we will notify the
              relevant supervisory authority within 72 hours of becoming aware, in line with GDPR Art. 33.
            </p>
          </section>

          <section>
            <h2 className="heading-lg mb-3">Changes</h2>
            <p className="text-muted-foreground">
              We may update this policy as the project evolves. The &ldquo;Last updated&rdquo; date above
              reflects the most recent revision.
            </p>
          </section>

          <section>
            <h2 className="heading-lg mb-3">Contact</h2>
            <p className="text-muted-foreground">
              Kate Kondratieva · {' '}
              <a href="https://airtable.com/shrkedcsqRIdT60o3" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                the project contact form
              </a>{' '}
              · See also <Link to="/contact" className="text-primary hover:underline">Contact</Link>.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Privacy;
