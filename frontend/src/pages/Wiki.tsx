import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, FileText, Plus } from 'lucide-react';

import { Layout } from '@/components/layout';
import { PageHeader } from '@/components/shared/PageHeader';
import { cn } from '@/lib/utils';
import { wikiArticles, wikiTags, WIKI_NEW_ARTICLE_URL } from '@/lib/wiki';

// Wiki index ────────────────────────────────────────────────────────────────
//
// Lists every article in `src/content/wiki/` newest-first, filterable by tag.
// The corpus is a build-time constant, so filtering is pure client-side state
// with no fetch and no loading condition to fail silently.

const ALL = '__all__';

export default function Wiki() {
  const [activeTag, setActiveTag] = useState<string>(ALL);
  const tags = useMemo(() => wikiTags(), []);

  const visible = useMemo(
    () => (activeTag === ALL ? wikiArticles : wikiArticles.filter((a) => a.tags.includes(activeTag))),
    [activeTag],
  );

  return (
    <Layout>
      <div className="container py-12 md:py-16">
        <PageHeader
          eyebrow="Atlas Wiki"
          title="The explanatory layer"
          subtitle={
            <>
              The directory answers who and what. The wiki answers why a field is shaped the way it
              is — concept explainers, landscape notes, and method notes, each carrying its evidence.
              Written openly: every page has an edit link.
            </>
          }
        />

        {/* Tag filter — flat chips, no dropdown. The corpus is small enough that
            every tag is worth showing at once. */}
        <div className="flex flex-wrap gap-2 mb-10">
          <button
            type="button"
            onClick={() => setActiveTag(ALL)}
            className={cn(
              'transition-colors',
              activeTag === ALL ? 'tag-filled' : 'tag-label hover:bg-muted',
            )}
          >
            All <span className="font-mono ml-1 opacity-60">{wikiArticles.length}</span>
          </button>
          {tags.map(({ tag, count }) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(tag)}
              className={cn(
                'transition-colors',
                activeTag === tag ? 'tag-filled' : 'tag-label hover:bg-muted',
              )}
            >
              {tag} <span className="font-mono ml-1 opacity-60">{count}</span>
            </button>
          ))}
        </div>

        <div className="grid gap-px bg-border border border-border">
          {visible.map((article) => (
            <Link
              key={article.slug}
              to={`/wiki/${article.slug}`}
              className="group bg-background p-6 md:p-8 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <FileText
                  className="h-4 w-4 mt-1 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <h2 className="heading-md mb-2">{article.title}</h2>
                  <p className="text-body-sm text-muted-foreground mb-3">{article.summary}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-muted-foreground">
                    <span>Updated {article.updated}</span>
                    {article.authors.length > 0 && <span>· {article.authors.join(', ')}</span>}
                    {article.tags.length > 0 && <span>· {article.tags.join(' · ')}</span>}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {visible.length === 0 && (
          <p className="text-body text-muted-foreground py-12">
            No articles carry this tag yet.
          </p>
        )}

        {/* Contribution CTA — the whole point of the section is that a reader
            can become an author without a local checkout. */}
        <div className="mt-12 border border-border p-6 md:p-8">
          <h2 className="heading-md mb-2">Write for the Atlas</h2>
          <p className="text-body-sm text-muted-foreground mb-5 max-w-2xl">
            Articles are Markdown files in the repository. Editing one opens a pull request from your
            browser — no local setup. Read the standard first: every factual claim carries a link to
            primary evidence, and invented URLs are the one unforgivable error here.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/wiki/how-to-contribute" className="tag-filled inline-flex items-center gap-2">
              Read the contributor guide
            </Link>
            <a
              href={WIKI_NEW_ARTICLE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="tag-label inline-flex items-center gap-2 hover:bg-muted transition-colors"
            >
              <Plus className="h-3 w-3" aria-hidden="true" />
              Propose an article
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}
