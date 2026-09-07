import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Pencil } from 'lucide-react';

import { Layout } from '@/components/layout';
import { PageHeader } from '@/components/shared/PageHeader';
import { WikiMarkdown } from '@/components/wiki';
import { getWikiArticle, wikiArticles, wikiEditUrl } from '@/lib/wiki';

// Single wiki article ───────────────────────────────────────────────────────
//
// A missing slug renders an explicit not-found state rather than a blank page.
// The "Edit this page" affordance is the section's contribution funnel: it is
// placed at the end of the article, where a reader who has just spotted an
// error is standing.

export default function WikiArticle() {
  const { slug = '' } = useParams();
  const article = getWikiArticle(slug);

  // Related = shares at least one tag, ranked by overlap. Cheap and adequate
  // at this corpus size; revisit if the wiki passes ~100 articles.
  const related = useMemo(() => {
    if (!article) return [];
    return wikiArticles
      .filter((a) => a.slug !== article.slug)
      .map((a) => ({ a, overlap: a.tags.filter((t) => article.tags.includes(t)).length }))
      .filter(({ overlap }) => overlap > 0)
      .sort((x, y) => y.overlap - x.overlap)
      .slice(0, 4)
      .map(({ a }) => a);
  }, [article]);

  if (!article) {
    return (
      <Layout>
        <div className="container py-12 md:py-16">
          <PageHeader
            eyebrow="Atlas Wiki"
            title="Article not found"
            subtitle={`No wiki article is filed under "${slug}".`}
          />
          <Link to="/wiki" className="tag-label inline-flex items-center gap-2 hover:bg-muted transition-colors">
            <ArrowLeft className="h-3 w-3" aria-hidden="true" />
            Back to the wiki
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-12 md:py-16">
        <Link
          to="/wiki"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-3 w-3" aria-hidden="true" />
          Atlas Wiki
        </Link>

        <PageHeader eyebrow="Atlas Wiki" title={article.title} subtitle={article.summary} />

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-muted-foreground border-y border-border py-3 mb-10">
          <span>Updated {article.updated}</span>
          {article.authors.length > 0 && <span>· {article.authors.join(', ')}</span>}
          {article.tags.length > 0 && <span>· {article.tags.join(' · ')}</span>}
        </div>

        <article className="max-w-2xl">
          <WikiMarkdown>{article.body}</WikiMarkdown>
        </article>

        <div className="max-w-2xl mt-12 border-t border-border pt-6">
          <a
            href={wikiEditUrl(article.slug)}
            target="_blank"
            rel="noopener noreferrer"
            className="tag-label inline-flex items-center gap-2 hover:bg-muted transition-colors"
          >
            <Pencil className="h-3 w-3" aria-hidden="true" />
            Edit this page
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
          <p className="text-small text-muted-foreground mt-3">
            Opens the source file in GitHub's editor. Your change becomes a pull request for review —
            nothing publishes without it.
          </p>
        </div>

        {related.length > 0 && (
          <div className="max-w-2xl mt-12">
            <h2 className="heading-md mb-4">Related</h2>
            <div className="grid gap-px bg-border border border-border">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  to={`/wiki/${r.slug}`}
                  className="bg-background p-5 hover:bg-muted/50 transition-colors"
                >
                  <div className="font-medium mb-1">{r.title}</div>
                  <div className="text-small text-muted-foreground">{r.summary}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
