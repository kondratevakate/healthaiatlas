"use client";

"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, Eye, ExternalLink } from "lucide-react";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCategoryLabel, getTagLabel, resources } from "@/data/resources";

interface ResourcesProps {
  resourceId?: string;
}

function formatDate(date: string, language: "en" | "ar") {
  return new Date(date).toLocaleDateString(language === "ar" ? "ar-AE" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function Resources({ resourceId }: ResourcesProps) {
  const { language } = useLanguage();
  const resource = resourceId
    ? resources.find((entry) => entry.id === resourceId) ?? null
    : null;

  if (resourceId && !resource) {
    return (
      <div className="container py-16 md:py-24">
        <div className="max-w-2xl">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Resources
          </p>
          <h1 className="heading-lg mb-4">Resource not found</h1>
          <p className="mb-8 text-body text-muted-foreground">
            The requested resource entry is missing from the current civic import.
          </p>
          <Link
            href="/resources"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground/72 hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to resources
          </Link>
        </div>
      </div>
    );
  }

  if (resource) {
    return (
      <div className="container py-16 md:py-24">
        <Link
          href="/resources"
          className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-foreground/72 hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to resources
        </Link>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_18rem] lg:items-start">
          <div className="max-w-3xl">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <Badge
                variant="secondary"
                className="rounded-none border border-border bg-secondary text-foreground"
              >
                {getCategoryLabel(resource.category, language)}
              </Badge>
              {resource.featured ? (
                <Badge className="rounded-none bg-primary text-primary-foreground">
                  Featured
                </Badge>
              ) : null}
            </div>

            <h1 className="heading-display mb-6">{resource.title[language]}</h1>
            <p className="mb-8 text-body-lg text-muted-foreground">
              {resource.description[language]}
            </p>

            <div className="grid gap-3 border border-border bg-secondary/20 p-6 md:grid-cols-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 shrink-0" />
                {formatDate(resource.date, language)}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Eye className="h-4 w-4 shrink-0" />
                {resource.views} views
              </div>
            </div>

            {resource.keyFindings?.en?.length ? (
              <section className="mt-10 border-t border-border pt-10">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Key findings
                </p>
                <ul className="space-y-3">
                  {resource.keyFindings[language].map((finding) => (
                    <li
                      key={finding}
                      className="border border-border bg-background px-4 py-3 text-sm text-foreground/82"
                    >
                      {finding}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {resource.tags.length ? (
              <section className="mt-10 border-t border-border pt-10">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Topics
                </p>
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="rounded-none text-xs">
                      {getTagLabel(tag, language)}
                    </Badge>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="border border-border bg-background p-6 lg:sticky lg:top-24">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Asset status
            </p>
            <p className="text-sm leading-7 text-muted-foreground">
              This civic import currently includes metadata and commentary, but no
              attached PDF or external asset URL.
            </p>
            {resource.pdfUrl ? (
              <a
                href={resource.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                Open source file
              </a>
            ) : null}
          </aside>
        </div>
      </div>
    );
  }

  const featuredResources = resources.filter((entry) => entry.featured);
  const remainingResources = resources.filter((entry) => !entry.featured);

  return (
    <div className="container py-16 md:py-24">
      <div className="max-w-3xl mb-14">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Resources
        </p>
        <h1 className="heading-display mb-6">Research assets and field notes</h1>
        <p className="text-body-lg text-muted-foreground">
          Editorial resources referenced across the civic import: case studies,
          infographics, and lightweight research notes.
        </p>
      </div>

      {featuredResources.length ? (
        <section className="mb-16">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Featured
          </p>
          <div className="grid gap-6">
            {featuredResources.map((entry) => (
              <ResourceCard key={entry.id} resource={entry} featured />
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Full library
        </p>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {remainingResources.map((entry) => (
            <ResourceCard key={entry.id} resource={entry} />
          ))}
        </div>
      </section>
    </div>
  );
}
