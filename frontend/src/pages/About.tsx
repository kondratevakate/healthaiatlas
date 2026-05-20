import { Layout } from '@/components/layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { BookOpen, Heart, Mail, ExternalLink } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { ATLAS_NOTES_SUBSCRIBE_URL, MANIFUND_PROJECT_URL } from '@/data/constants';

const RETHINKING_SYSTEMS_URL = 'https://www.rethinkingsystems.design/';

const LinkedInMark = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.95v5.66H9.35V9h3.42v1.57h.05c.48-.9 1.64-1.85 3.38-1.85 3.62 0 4.29 2.38 4.29 5.48v6.25zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.21 0 22.23 0z" />
  </svg>
);

const GitHubMark = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 .3a12 12 0 0 0-3.79 23.38c.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.6-4.04-1.6-.55-1.4-1.34-1.77-1.34-1.77-1.09-.74.08-.73.08-.73 1.21.09 1.85 1.25 1.85 1.25 1.08 1.84 2.83 1.31 3.52 1 .11-.78.42-1.31.77-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.25 2.88.12 3.18a4.66 4.66 0 0 1 1.24 3.22c0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.82.58A12 12 0 0 0 12 .3" />
  </svg>
);

const About = () => {
  const { t } = useLanguage();

  return (
    <Layout>
      <div className="container py-12 md:py-16">
        <PageHeader
          title={t('nav.about')}
          subtitle="Research and code by Kate Kondratieva — an independent mapping of the global healthcare AI ecosystem, built on the shoulders of the Thinking Systems tradition at IIT Institute of Design."
        />

        {/* 1. Contacts first */}
        <section id="contact" className="mb-16 max-w-2xl">
          <h2 className="heading-lg mb-6">{t('about.contact')}</h2>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="pt-6 space-y-5">
              <div className="flex flex-wrap gap-3">
                <a
                  href="mailto:kondratevakate@gmail.com"
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-border hover:border-foreground/60 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  kondratevakate@gmail.com
                </a>
                <a
                  href="https://linkedin.com/in/kondratevakate"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-border hover:border-foreground/60 transition-colors"
                >
                  <LinkedInMark className="w-4 h-4" />
                  LinkedIn
                </a>
              </div>

              <div className="pt-4 border-t border-border/60">
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-2">
                  Contribute
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  Spotted a gap or a wrong entry? Open a PR or suggest an addition on GitHub.
                </p>
                <a
                  href="https://github.com/kondratevakate"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <GitHubMark className="w-4 h-4" />
                  github.com/kondratevakate
                </a>
              </div>

              <p className="text-xs text-muted-foreground pt-2">
                Full contact list: <Link to="/contact" className="text-primary hover:underline">/contact</Link>
                {' · '}
                Privacy: <Link to="/privacy" className="text-primary hover:underline">/privacy</Link>
              </p>
            </CardContent>
          </Card>
        </section>

        {/* 2. Methodological grounding — Thinking Systems tradition */}
        <section className="mb-16 max-w-3xl">
          <h2 className="heading-lg mb-3">Methodological grounding</h2>
          <p className="text-body text-muted-foreground">
            The Atlas builds on the{' '}
            <a
              href={RETHINKING_SYSTEMS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              ReThinking Systems
              <ExternalLink className="w-3 h-3" />
            </a>{' '}
            tradition from IIT Institute of Design — treating an ecosystem as a system of actors,
            affordances and feedback loops, then mapping it with evidence rather than vibes.
          </p>
        </section>

        {/* 3. Atlas Notes — editorial companion newsletter on LinkedIn.
            Was previously a top-level nav item; demoted to a contextual
            link inside About so the primary nav stays directory-focused
            and Atlas Notes lives next to the authorship context that
            explains why it exists. */}
        <section className="mb-16 max-w-3xl">
          <h2 className="heading-lg mb-3">Atlas Notes — the newsletter</h2>
          <p className="text-body text-muted-foreground mb-5">
            Atlas Notes is the editorial companion to this directory — long-form analysis of where
            healthcare AI is moving, what the methods can and cannot do clinically, and the read-
            across between regulatory shifts and founder strategy. Author voice (Kate Kondratieva),
            with named takes you can argue with. Published on LinkedIn for distribution; cited back
            into Atlas entries where the analysis becomes structured data.
          </p>
          <a
            href={ATLAS_NOTES_SUBSCRIBE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-border hover:border-foreground/60 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Subscribe on LinkedIn
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
        </section>

        {/* 4. Mission — canonical About copy (independent project statement) */}
        <section className="max-w-3xl space-y-5 text-body text-foreground/90">
          <h2 className="heading-lg mb-6">{t('about.mission')}</h2>

          <p>
            HealthAI Atlas is an independent project founded by Dr. Ekaterina Kondrateva to provide open,
            structured knowledge about the global healthcare AI ecosystem. The project exists to make
            ecosystem intelligence accessible to those who need it most: students and researchers
            building evidence-based judgment about medical AI, founders navigating an increasingly
            complex landscape, businesses searching for talent and partnerships, and job seekers
            finding their lane in the ecosystem.
          </p>

          <p>
            The Atlas operates as a personal research and educational initiative, separate from any other
            professional affiliations or commercial ventures the founder is associated with. All
            public-facing content is freely accessible under an open-knowledge license, and the project
            welcomes contributions, corrections, and feedback from the global community.
          </p>

          <p>
            To sustain ongoing development — including continuous data verification, geographic
            expansion, and methodology refinement — HealthAI Atlas offers professional tooling for
            institutional users: structured data exports, programmatic access via API, and custom
            analytical services. These commercial offerings serve enterprise users (investment firms,
            healthcare organizations, consultancies, government bodies) whose work benefits from
            decision-ready data infrastructure.
          </p>

          <p className="border-l-4 border-primary/60 pl-4 italic text-foreground">
            The principle guiding HealthAI Atlas: the knowledge stays open; the tooling for professional
            use sustains the work.
          </p>

          <p className="text-sm text-muted-foreground pt-4">
            See also: <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
            {' · '}
            <Link to="/privacy" className="text-primary hover:underline">Privacy</Link>
          </p>
        </section>

        {/* Support — sits at the bottom rather than the top so it doesn't
            dilute the analytical/B2B positioning of the project. Funding
            flows through Manifund — their 501(c)(3) acts as fiscal sponsor,
            so the Atlas doesn't need to spin up its own legal entity or
            payment stack. Enterprise needs go through the commercial path
            described in the mission section above. */}
        <section className="mt-16 max-w-3xl">
          <h2 className="heading-lg mb-3">Support the Atlas</h2>
          <p className="text-body text-muted-foreground mb-5">
            The directory and Atlas Notes are free to read. If the work has helped you and you'd like
            to contribute toward continued source verification and geographic expansion, funding flows
            through Manifund — a fiscal-sponsorship platform for AI-ecosystem projects, where their
            registered 501(c)(3) receives funds and disburses them as grants.
          </p>
          <a
            href={MANIFUND_PROJECT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-border hover:border-foreground/60 transition-colors"
          >
            <Heart className="w-4 h-4" />
            Fund on Manifund
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
          <p className="text-xs text-muted-foreground mt-3">
            Enterprise users (investment firms, healthcare organizations, consultancies) — see the
            commercial-tooling note above and reach out via <Link to="/contact" className="text-primary hover:underline">/contact</Link>.
          </p>
        </section>
      </div>
    </Layout>
  );
};

export default About;
