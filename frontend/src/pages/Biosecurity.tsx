import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink, ShieldAlert } from 'lucide-react';

import { Layout } from '@/components/layout';
import { PageHeader } from '@/components/shared/PageHeader';
import { wikiArticlesByTag, WIKI_NEW_ARTICLE_URL } from '@/lib/wiki';
import { SUGGEST_ENTRY_URL } from '@/data/constants';

// Biosecurity section entry ─────────────────────────────────────────────────
//
// This page is navigation and scope, NOT data. Structured biosecurity records
// belong in the directory hub once they exist and have been through the
// verification pipeline; duplicating them here would violate the
// no-duplicate-content rule in AGENTS.md.
//
// While the hub is unpopulated the page says so plainly rather than staging a
// "coming soon" banner over an empty grid.

export default function Biosecurity() {
  const reading = wikiArticlesByTag('biosecurity');

  return (
    <Layout>
      <div className="container py-12 md:py-16">
        <PageHeader
          eyebrow="Section"
          title="Biosecurity"
          subtitle={
            <>
              Where AI methods meet biological risk governance. The Atlas tracks the rules, the
              control points, and the bodies that administer them — not threat speculation, and not
              operational detail whose only use is circumvention.
            </>
          }
        />

        <div className="border border-border p-6 md:p-8 mb-12 max-w-2xl">
          <div className="flex items-start gap-4">
            <ShieldAlert className="h-4 w-4 mt-1 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div>
              <h2 className="heading-md mb-2">Status: scope defined, records pending</h2>
              <p className="text-body-sm text-muted-foreground mb-4">
                The boundary of this section is written down and open to argument. Structured records
                are not yet entered — they enter through the same verification pipeline as every
                other Atlas dataset, with primary evidence on each row.
              </p>
              <Link
                to="/wiki/biosecurity-scope"
                className="tag-filled inline-flex items-center gap-2"
              >
                Read the scope note
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

        {reading.length > 0 && (
          <div className="mb-12">
            <h2 className="heading-md mb-4">Background reading</h2>
            <div className="grid gap-px bg-border border border-border max-w-2xl">
              {reading.map((a) => (
                <Link
                  key={a.slug}
                  to={`/wiki/${a.slug}`}
                  className="bg-background p-5 hover:bg-muted/50 transition-colors"
                >
                  <div className="font-medium mb-1">{a.title}</div>
                  <div className="text-small text-muted-foreground mb-2">{a.summary}</div>
                  <div className="text-xs font-mono text-muted-foreground">Updated {a.updated}</div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="max-w-2xl">
          <h2 className="heading-md mb-2">Contribute</h2>
          <p className="text-body-sm text-muted-foreground mb-5">
            Two routes in. Explanatory writing goes to the wiki as a Markdown pull request. A record
            for the directory — an instrument, a body, a control point — goes through the submission
            form so it can be checked against primary evidence before it lands.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={WIKI_NEW_ARTICLE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="tag-label inline-flex items-center gap-2 hover:bg-muted transition-colors"
            >
              Write a wiki article
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
            <a
              href={SUGGEST_ENTRY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="tag-label inline-flex items-center gap-2 hover:bg-muted transition-colors"
            >
              Submit a record
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}
