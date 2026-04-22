import { Layout } from '@/components/layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { analysisTools } from '@/data/tools';
import { Link } from 'react-router-dom';
import { Mail, Globe } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';

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
  const { t, language } = useLanguage();

  return (
    <Layout>
      <div className="container py-12 md:py-20">
        <PageHeader title={t('nav.about')} subtitle={t('about.missionText')} className="max-w-2xl" />

        {/* Mission Section */}
        <section className="mb-16">
          <h2 className="heading-lg mb-6">{t('about.mission')}</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="text-lg">Knowledge Bank</CardTitle>
                <CardDescription>
                  We map the ecosystem of AI in healthcare, documenting players, relationships, and the
                  evolution of the industry across regions.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="text-lg">Systems Analysis</CardTitle>
                <CardDescription>
                  We apply design research methodologies from the IIT Institute of Design to understand and
                  visualize complex healthcare infrastructure.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Methodology Section */}
        <section id="methodology" className="mb-16">
          <h2 className="heading-lg mb-6">{t('about.methodology')}</h2>
          <p className="text-body text-muted-foreground mb-8 max-w-2xl">
            Our analysis is grounded in frameworks developed by the ReThinking Systems initiative at IIT
            Institute of Design, adapted for the AI health ecosystem.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analysisTools.slice(0, 3).map((tool) => (
              <Link key={tool.id} to={`/tools/${tool.id}`}>
                <Card className="card-hover h-full border-border/50 bg-card/50">
                  <CardHeader>
                    <CardTitle className="text-base">{tool.name[language]}</CardTitle>
                    <CardDescription className="text-sm">{tool.shortDescription[language]}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Author / Contact */}
        <section id="contact" className="max-w-2xl">
          <h2 className="heading-lg mb-6">{t('about.contact')}</h2>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="pt-6 space-y-5">
              <p className="text-muted-foreground">
                Research and code by <span className="text-foreground">Kate Kondratieva</span>. Health AI
                Atlas is an independent research project.
              </p>

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
                <a
                  href="https://atelic.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-border hover:border-foreground/60 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  atelic.ai
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
      </div>
    </Layout>
  );
};

export default About;
