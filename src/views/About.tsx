'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { analysisTools } from '@/data/tools';

const About = () => {
  const { t, language } = useLanguage();

  return (
    <div className="container py-12 md:py-20">
      <div className="mb-16 max-w-2xl">
        <div className="mb-6 h-px w-12 bg-primary" />
        <h1 className="heading-serif mb-4">{t('nav.about')}</h1>
        <p className="text-body text-muted-foreground">{t('about.missionText')}</p>
      </div>

      <section className="mb-16">
        <h2 className="heading-lg mb-6">{t('about.mission')}</h2>
        <div className="grid gap-8 md:grid-cols-2">
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="text-lg">Knowledge Bank</CardTitle>
              <CardDescription>
                We map the ecosystem of AI in healthcare, documenting players,
                relationships, and the evolution of the industry across regions.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="text-lg">Systems Analysis</CardTitle>
              <CardDescription>
                We apply design research methodologies from the IIT Institute of Design
                to understand and visualize complex healthcare infrastructure.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section id="methodology" className="mb-16">
        <h2 className="heading-lg mb-6">{t('about.methodology')}</h2>
        <p className="text-body mb-8 max-w-2xl text-muted-foreground">
          Our analysis is grounded in frameworks developed by the ReThinking Systems
          initiative at IIT Institute of Design, adapted for the AI health ecosystem.
        </p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {analysisTools.slice(0, 3).map((tool) => (
            <Link key={tool.id} href={`/tools/${tool.id}`}>
              <Card className="card-hover h-full border-border/50 bg-card/50">
                <CardHeader>
                  <CardTitle className="text-base">{tool.name[language]}</CardTitle>
                  <CardDescription className="text-sm">
                    {tool.shortDescription[language]}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section id="contact">
        <h2 className="heading-lg mb-6">{t('about.contact')}</h2>
        <Card className="max-w-md border-border/50 bg-card/50">
          <CardContent className="pt-6">
            <p className="mb-4 text-muted-foreground">
              Interested in contributing to the directory or collaborating on research?
            </p>
            <a
              href="mailto:contact@aihealthdirectory.com"
              className="text-primary hover:underline"
            >
              contact@aihealthdirectory.com
            </a>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default About;
