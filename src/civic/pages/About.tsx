import { Layout } from '@/civic/components/layout';
import { useLanguage } from '@/civic/contexts/LanguageContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/civic/components/ui/card';
import { analysisTools } from '@/civic/data/tools';
import { Link } from 'react-router-dom';

const About = () => {
  const { t, language } = useLanguage();

  return (
    <Layout>
      <div className="container py-12 md:py-20">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <div className="w-12 h-px bg-primary mb-6" />
          <h1 className="heading-serif mb-4">{t('nav.about')}</h1>
          <p className="text-body text-muted-foreground">
            {t('about.missionText')}
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-16">
          <h2 className="heading-lg mb-6">{t('about.mission')}</h2>
          <div className="grid md:grid-cols-2 gap-8">
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

        {/* Methodology Section */}
        <section id="methodology" className="mb-16">
          <h2 className="heading-lg mb-6">{t('about.methodology')}</h2>
          <p className="text-body text-muted-foreground mb-8 max-w-2xl">
            Our analysis is grounded in frameworks developed by the ReThinking Systems 
            initiative at IIT Institute of Design, adapted for the AI health ecosystem.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analysisTools.slice(0, 3).map((tool) => (
              <Link key={tool.id} to={`/tools/${tool.id}`}>
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

        {/* Contact Section */}
        <section id="contact">
          <h2 className="heading-lg mb-6">{t('about.contact')}</h2>
          <Card className="border-border/50 bg-card/50 max-w-md">
            <CardContent className="pt-6">
              <p className="text-muted-foreground mb-4">
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
    </Layout>
  );
};

export default About;

