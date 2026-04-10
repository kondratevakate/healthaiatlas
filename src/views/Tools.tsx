'use client';

import Link from 'next/link';
import { ArrowRight, ArrowLeft, BookOpen, Lightbulb, CheckCircle2 } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { analysisTools } from '@/data/tools';
import { cn } from '@/lib/utils';

const toolColors: Record<string, { bg: string; text: string; border: string }> = {
  coral: { bg: 'bg-pink', text: 'text-white', border: 'border-pink' },
  gold: { bg: 'bg-yellow', text: 'text-foreground', border: 'border-yellow' },
  sage: { bg: 'bg-primary', text: 'text-primary-foreground', border: 'border-primary' },
  sky: { bg: 'bg-blue', text: 'text-white', border: 'border-blue' },
  amber: { bg: 'bg-orange', text: 'text-white', border: 'border-orange' },
};

interface ToolsProps {
  toolId?: string;
}

const Tools = ({ toolId }: ToolsProps) => {
  const { t, language, isRTL } = useLanguage();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;
  const selectedTool = toolId ? analysisTools.find((tool) => tool.id === toolId) : null;

  if (selectedTool) {
    const colorConfig =
      toolColors[selectedTool.color as keyof typeof toolColors] || toolColors.sage;

    return (
      <div className="container py-16 md:py-24">
        <Link
          href="/tools"
          className="mb-12 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowIcon className="h-4 w-4 rotate-180" />
          {t('section.analysisMethods')}
        </Link>

        <div className="mb-16 max-w-3xl">
          <Badge className={cn('mb-6 rounded-none', colorConfig.bg, colorConfig.text)}>
            <BookOpen className="mr-2 h-3 w-3" />
            Analysis Tool
          </Badge>
          <h1 className="heading-display mb-6">{selectedTool.name[language]}</h1>
          <p className="text-body-lg text-muted-foreground">
            {selectedTool.description[language]}
          </p>
        </div>

        <div className="mb-16 max-w-3xl">
          <h2 className="heading-serif-sm mb-8">
            {language === 'en' ? 'Steps' : 'Ð¨Ð°Ð³Ð¸'}
          </h2>
          <Accordion type="single" collapsible className="space-y-4">
            {selectedTool.steps.map((step, index) => (
              <AccordionItem
                key={step.id}
                value={step.id}
                className="border border-border bg-background px-6"
              >
                <AccordionTrigger className="py-5 hover:no-underline">
                  <div className="flex items-center gap-4">
                    <span
                      className={cn(
                        'flex h-10 w-10 items-center justify-center text-sm font-semibold',
                        colorConfig.bg,
                        colorConfig.text,
                      )}
                    >
                      {index + 1}
                    </span>
                    <span className="text-left font-semibold">
                      {step.title[language]}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-6 pl-14">
                  <p className="mb-4 text-muted-foreground">
                    {step.description[language]}
                  </p>
                  {step.tips && step.tips.length > 0 ? (
                    <div className="border border-border bg-secondary/50 p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-yellow" />
                        <span className="text-sm font-semibold">
                          {language === 'en' ? 'Tips' : 'Ð¡Ð¾Ð²ÐµÑ‚Ñ‹'}
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {step.tips.map((tip, tipIndex) => (
                          <li
                            key={tipIndex}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            {tip[language]}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {selectedTool.examples.length > 0 ? (
          <div className="max-w-3xl">
            <h2 className="heading-serif-sm mb-8">
              {language === 'en' ? 'Examples' : 'ÐŸÑ€Ð¸Ð¼ÐµÑ€Ñ‹'}
            </h2>
            <div className="space-y-6">
              {selectedTool.examples.map((example) => (
                <div key={example.id} className="border border-border bg-background p-6">
                  <h3 className="mb-4 text-lg font-semibold">
                    {example.title[language]}
                  </h3>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        {language === 'en' ? 'Context' : 'ÐšÐ¾Ð½Ñ‚ÐµÐºÑÑ‚'}
                      </p>
                      <p className="text-sm text-foreground">
                        {example.context[language]}
                      </p>
                    </div>
                    <div>
                      <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        {language === 'en' ? 'Application' : 'ÐŸÑ€Ð¸Ð¼ÐµÐ½ÐµÐ½Ð¸Ðµ'}
                      </p>
                      <p className="text-sm text-foreground">
                        {example.application[language]}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="container py-16 md:py-24">
      <div className="mb-16 max-w-3xl">
        <h1 className="heading-display mb-6">{t('entry.tools.title')}</h1>
        <p className="text-body-lg text-muted-foreground">{t('entry.tools.desc')}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {analysisTools.map((tool) => {
          const colorConfig =
            toolColors[tool.color as keyof typeof toolColors] || toolColors.sage;

          return (
            <Link key={tool.id} href={`/tools/${tool.id}`}>
              <div className="group h-full border border-border bg-background p-6 transition-all hover:shadow-lg">
                <Badge className={cn('mb-4 rounded-none', colorConfig.bg, colorConfig.text)}>
                  {tool.steps.length} {language === 'en' ? 'steps' : 'ÑˆÐ°Ð³Ð¾Ð²'}
                </Badge>
                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold transition-colors group-hover:text-primary">
                  {tool.name[language]}
                  <ArrowIcon className="h-4 w-4 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
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
  );
};

export default Tools;
