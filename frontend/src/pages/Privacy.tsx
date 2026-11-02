import { Layout } from '@/components/layout';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';

const LAST_UPDATED = 'November 2, 2026';

const Privacy = () => {
  return (
    <Layout>
      <div className="container py-12 md:py-16 [&>*]:max-w-3xl">
        <PageHeader
          eyebrow="Legal"
          title="Privacy Policy"
          subtitle={<span className="text-sm">Last updated: {LAST_UPDATED}</span>}
        />

        <div className="space-y-10 text-body text-foreground">
          <section>
            <h2 className="heading-lg mb-3">The short version</h2>
            <p className="text-muted-foreground">
              HealthAI Atlas is a static website with no user accounts. Two features are being built
              and are <strong>not live yet</strong>: an optional &ldquo;Una&rdquo; chat and an optional
              email subscription. This page explains what is true today and what will be true when those
              go live.
            </p>
          </section>

          <section>
            <h2 className="heading-lg mb-3">Who we are</h2>
            <p className="text-muted-foreground">
              HealthAI Atlas is an independent research and educational project owned and operated
              by Dr. Ekaterina Kondrateva in personal capacity. The project is not affiliated with,
              owned by, or operated under the authority of any other organisation, employer, or
              commercial entity. See also <Link to="/about" className="text-primary hover:underline">About</Link> and{' '}
              <Link to="/terms" className="text-primary hover:underline">Terms</Link>.
            </p>
          </section>

          <section>
            <h2 className="heading-lg mb-3">Live today: a static site, no accounts</h2>
            <p className="text-muted-foreground">
              The public site is a static single-page application. There are no user accounts, no
              sign-in, and no profile of you. It does not store health information and does not hold
              protected health information (PHI).
            </p>
          </section>

          <section>
            <h2 className="heading-lg mb-3">Live today: analytics</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-2">
              <li>
                <strong>Google Analytics 4</strong> — loaded only if it is configured for the build.
                It records page views, referrer, device/browser category and country-level location
                derived from IP (Google derives the country from your IP and does not retain the IP
                itself). It runs in Consent Mode v2: all storage starts
                denied, and analytics storage is enabled only after you accept in the cookie banner.
                Advertising storage, ad user data and ad personalisation are denied.
              </li>
              <li>
                <strong>Cloudflare Web Analytics</strong> — a cookieless beacon, loaded only if it is
                configured for the build. It counts page views with referrer, device/browser category
                and country. No cookies, no local storage, no fingerprinting, no identified visitors.
              </li>
              <li>
                <strong>Outbound link clicks</strong> — when you click a contact, newsletter or email
                link, one event is sent to Google Analytics recording which kind of link it was and
                which page you were on. Nothing about you personally is attached to it.
              </li>
              <li>
                <strong>Your own browser storage</strong> — your cookie choice, saved preferences and
                any self-assessment result you save or share are kept in your browser&apos;s
                localStorage. They stay on your device unless you share a link yourself.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="heading-lg mb-3">Coming soon: the &ldquo;Una&rdquo; chat</h2>
            <p className="text-muted-foreground mb-2">
              Not live yet. When it launches it will be optional: you type free text about yourself
              and it returns an assessment. Here is exactly what will happen to that text:
            </p>
            <ul className="list-disc pl-5 text-muted-foreground space-y-2">
              <li>
                What you type is sent to a <strong>third-party AI model provider</strong> so it can
                produce the assessment. It is processed to answer you, and that is the only reason it
                is sent.
              </li>
              <li>
                Your message is <strong>not kept as a transcript</strong>. We do not store the
                conversation.
              </li>
              <li>
                Only <strong>token counts and error codes</strong> are logged, to control abuse and
                cost. If those logs are kept at all, they are deleted within <strong>72 hours</strong>.
              </li>
              <li>
                Chat text is <strong>never relayed to Telegram</strong>, never used for advertising,
                and never sold.
              </li>
              <li>
                We ask for no name, email or phone number in the chat, and the chat never receives
                anything from the founder&apos;s private research databases — those never reach the
                browser or the model.
              </li>
              <li>
                To hold back abuse we keep <strong>a salted, rotating hash of your IP, kept for 48
                hours or less</strong>, purely to enforce rate limits. Your IP itself is never
                stored and never written to a log, and it is never sent to the model provider; the
                hash is made with a secret salt that we rotate, so it cannot be reversed or looked
                up.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="heading-lg mb-3">Coming soon: email subscription</h2>
            <p className="text-muted-foreground mb-2">Not live yet. When it launches:</p>
            <ul className="list-disc pl-5 text-muted-foreground space-y-2">
              <li>It is optional, and sign-up uses <strong>double opt-in</strong> — nothing is added to a list until you confirm from the email we send.</li>
              <li>Every email carries a <strong>one-click unsubscribe link</strong> with its own token.</li>
              <li>Unsubscribe requests are honoured. Your address is kept <strong>until you unsubscribe, plus 30 days</strong>, and then deleted.</li>
              <li>Your address is used to send the subscription and nothing else. It is never sold and never shared with advertisers.</li>
            </ul>
          </section>

          <section>
            <h2 className="heading-lg mb-3">Health-data caution</h2>
            <p className="text-muted-foreground">
              The chat is an information tool, not a clinician. It does <strong>not</strong> give
              medical advice and does <strong>not</strong> diagnose, treat, or rule out any condition.
              Please do not paste personal health data, medical records, or identifiers (your own or
              anyone else&apos;s) into it. For anything medical, talk to a qualified professional.
            </p>
          </section>

          <section>
            <h2 className="heading-lg mb-3">Who processes data for us</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-2">
              <li>
                <strong>Cloudflare</strong> — hosts the site and runs the small server function
                (worker) that receives a subscription sign-up and forwards a chat message to the model
                provider.
              </li>
              <li>
                <strong>The AI model provider</strong> behind the chat — receives the text you type in
                order to generate the answer. The specific provider may change.
              </li>
              <li>
                <strong>The email delivery provider</strong> — stores your address and sends the
                subscription email when the feature is live.
              </li>
              <li>
                <strong>Google Analytics</strong> and <strong>Cloudflare Web Analytics</strong> —
                analytics, as described above.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="heading-lg mb-3">Retention</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-2">
              <li>Chat text: not stored as a transcript.</li>
              <li>Rate-limit IP hash: a salted, rotating hash, deleted within 48 hours.</li>
              <li>Chat operational logs (token counts, error codes): at most 72 hours.</li>
              <li>Subscriber address: until you unsubscribe, plus 30 days.</li>
              <li>
                Analytics: held by the analytics providers under their own retention settings. We keep
                no separate copy of it.
              </li>
              <li>Browser storage on your device: until you clear it.</li>
            </ul>
          </section>

          <section>
            <h2 className="heading-lg mb-3">Legal basis (GDPR)</h2>
            <p className="text-muted-foreground">
              Analytics cookies and the chat and subscription features rely on your
              <strong> consent</strong>, which you can withdraw at any time (unsubscribe, clear your
              browser storage, or decline in the cookie banner). Keeping the site available and secure
              relies on <strong>legitimate interest</strong> in running a free public research
              resource. There is no sale of data and no sharing with advertisers.
            </p>
          </section>

          <section>
            <h2 className="heading-lg mb-3">Your rights</h2>
            <p className="text-muted-foreground mb-2">
              Under GDPR and equivalent regulations you have the right to access, rectify, erase,
              restrict processing, object, and port your data. Because the live site holds no personal
              data, most requests today are satisfied by clearing your browser storage and declining
              analytics (browser Do-Not-Track, an ad-blocker, or the{' '}
              <a
                href="https://tools.google.com/dlpage/gaoptout"
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Analytics opt-out add-on
              </a>
              ). Once the chat and subscription are live, you can ask us what we hold, and we will
              delete it.
            </p>
            <p className="text-muted-foreground">
              Send any request through the{' '}
              <Link to="/contact" className="text-primary hover:underline">Contact</Link> page and we
              will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="heading-lg mb-3">Security</h2>
            <p className="text-muted-foreground">
              All traffic is served over HTTPS. The public site itself is static: no user accounts and
              no database behind the pages. When the chat and subscription go live they add a small
              server function that handles a message or an address and stores nothing beyond what is
              described above.
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
              We will update this page before the chat or the subscription go live, and whenever the
              facts change. The &ldquo;Last updated&rdquo; date above reflects the most recent revision.
            </p>
          </section>

          <section>
            <h2 className="heading-lg mb-3">Contact</h2>
            <p className="text-muted-foreground">
              For any privacy or data question, use the{' '}
              <Link to="/contact" className="text-primary hover:underline">Contact</Link> page.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Privacy;
