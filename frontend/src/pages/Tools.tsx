import { Layout } from '@/components/layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { analysisTools } from '@/data/tools';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useParams } from 'react-router-dom';
import { ArrowRight, ArrowLeft, BookOpen, Lightbulb, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const toolColors: Record<string, { bg: string; text: string; border: string }> = {
  coral: { bg: 'bg-pink', text: 'text-white', border: 'border-pink' },
  gold: { bg: 'bg-yellow', text: 'text-foreground', border: 'border-yellow' },
  sage: { bg: 'bg-primary', text: 'text-primary-foreground', border: 'border-primary' },
  sky: { bg: 'bg-blue', text: 'text-white', border: 'border-blue' },
  amber: { bg: 'bg-orange', text: 'text-white', border: 'border-orange' },
};

const Tools = () => {
  const { t, language, isRTL } = useLanguage();
  const { id } = useParams();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const selectedTool = id ? analysisTools.find(tool => tool.id === id) : null;

  if (selectedTool) {
    const colorConfig = toolColors[selectedTool.color as keyof typeof toolColors] || toolColors.sage;
    
    return (
      <Layout>
        <div className="container py-16 md:py-24">
          {/* Back link */}
          <Link 
            to="/tools" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-12 font-medium"
          >
            <ArrowIcon className="h-4 w-4 rotate-180" />
            {t('section.analysisMethods')}
          </Link>

          {/* Tool Header */}
          <div className="max-w-3xl mb-16">
            <Badge className={cn("rounded-none mb-6", colorConfig.bg, colorConfig.text)}>
              <BookOpen className="w-3 h-3 mr-2" />
              Analysis Tool
            </Badge>
            <h1 className="heading-display mb-6">{selectedTool.name[language]}</h1>
            <p className="text-body-lg text-muted-foreground">
              {selectedTool.description[language]}
            </p>
          </div>

          {/* Steps */}
          <div className="max-w-3xl mb-16">
            <h2 className="heading-serif-sm mb-8">
              {language === 'en' ? 'Steps' : 'Шаги'}
            </h2>
            <Accordion type="single" collapsible className="space-y-4">
              {selectedTool.steps.map((step, index) => (
                <AccordionItem 
                  key={step.id} 
                  value={step.id}
                  className="border border-border bg-background px-6"
                >
                  <AccordionTrigger className="hover:no-underline py-5">
                    <div className="flex items-center gap-4">
                      <span className={cn(
                        "w-10 h-10 flex items-center justify-center text-sm font-semibold",
                        colorConfig.bg, colorConfig.text
                      )}>
                        {index + 1}
                      </span>
                      <span className="font-semibold text-left">{step.title[language]}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pl-14 pb-6">
                    <p className="text-muted-foreground mb-4">
                      {step.description[language]}
                    </p>
                    {step.tips && step.tips.length > 0 && (
                      <div className="bg-secondary/50 border border-border p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Lightbulb className="w-4 h-4 text-yellow" />
                          <span className="text-sm font-semibold">{language === 'en' ? 'Tips' : 'Советы'}</span>
                        </div>
                        <ul className="space-y-2">
                          {step.tips.map((tip, tipIndex) => (
                            <li key={tipIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                              {tip[language]}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Examples */}
          {selectedTool.examples.length > 0 && (
            <div className="max-w-3xl">
              <h2 className="heading-serif-sm mb-8">
                {language === 'en' ? 'Examples' : 'Примеры'}
              </h2>
              <div className="space-y-6">
                {selectedTool.examples.map((example) => (
                  <div key={example.id} className="border border-border bg-background p-6">
                    <h3 className="font-semibold text-lg mb-4">{example.title[language]}</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                          {language === 'en' ? 'Context' : 'Контекст'}
                        </p>
                        <p className="text-sm text-foreground">{example.context[language]}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                          {language === 'en' ? 'Application' : 'Применение'}
                        </p>
                        <p className="text-sm text-foreground">{example.application[language]}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-16 md:py-24">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <h1 className="heading-display mb-6">{t('entry.tools.title')}</h1>
          <p className="text-body-lg text-muted-foreground">
            {t('entry.tools.desc')}
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {analysisTools.map((tool) => {
            const colorConfig = toolColors[tool.color as keyof typeof toolColors] || toolColors.sage;
            
            return (
              <Link key={tool.id} to={`/tools/${tool.id}`}>
                <div className="border border-border bg-background p-6 hover:shadow-lg transition-all group h-full">
                  <Badge className={cn("rounded-none mb-4", colorConfig.bg, colorConfig.text)}>
                    {tool.steps.length} {language === 'en' ? 'steps' : 'шагов'}
                  </Badge>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 group-hover:text-primary transition-colors">
                    {tool.name[language]}
                    <ArrowIcon className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {tool.shortDescription[language]}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default Tools;
