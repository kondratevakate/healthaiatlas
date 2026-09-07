import ReactMarkdown, { type Components } from 'react-markdown';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

// Brand-mapped Markdown renderer ────────────────────────────────────────────
//
// We map every element explicitly instead of registering @tailwindcss/typography.
// `prose` ships its own gray scale and its own dark-mode story, both of which
// would sit beside — and quietly disagree with — the shadcn semantic tokens the
// rest of the Atlas uses. An explicit map is more lines and zero ambiguity.
//
// Markdown `#` (h1) is rendered as an h2: the page already owns exactly one h1
// via the shared PageHeader component, and a second one breaks the document
// outline for screen readers and for the design-system heading rule.

const components: Components = {
  h1: ({ children }) => <h2 className="heading-xl mt-12 mb-4 scroll-mt-24">{children}</h2>,
  h2: ({ children }) => <h2 className="heading-xl mt-12 mb-4 scroll-mt-24">{children}</h2>,
  h3: ({ children }) => <h3 className="heading-md mt-8 mb-3 scroll-mt-24">{children}</h3>,

  p: ({ children }) => <p className="text-body text-muted-foreground mb-5">{children}</p>,

  ul: ({ children }) => <ul className="mb-5 space-y-2 list-disc pl-5 marker:text-border">{children}</ul>,
  ol: ({ children }) => <ol className="mb-5 space-y-2 list-decimal pl-5 marker:text-muted-foreground">{children}</ol>,
  li: ({ children }) => <li className="text-body text-muted-foreground">{children}</li>,

  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,

  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-border pl-5 my-6 text-body text-muted-foreground">
      {children}
    </blockquote>
  ),

  code: ({ children }) => (
    <code className="font-mono text-sm bg-muted px-1.5 py-0.5 rounded">{children}</code>
  ),
  pre: ({ children }) => (
    <pre className="font-mono text-sm bg-muted p-4 rounded-md overflow-x-auto mb-5">{children}</pre>
  ),

  hr: () => <hr className="my-10 border-border" />,

  // Internal routes stay in the SPA; anything else is treated as evidence and
  // opens in a new tab with a visible external marker — the reader should
  // always know when a link leaves the Atlas.
  a: ({ href, children }) => {
    const url = href ?? '';
    if (url.startsWith('/')) {
      return (
        <Link to={url} className="underline underline-offset-2 decoration-border hover:decoration-foreground text-foreground">
          {children}
        </Link>
      );
    }
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 decoration-border hover:decoration-foreground text-foreground inline-flex items-baseline gap-1"
      >
        {children}
        <ExternalLink className="h-3 w-3 shrink-0 self-center" aria-hidden="true" />
      </a>
    );
  },
};

interface WikiMarkdownProps {
  children: string;
}

export function WikiMarkdown({ children }: WikiMarkdownProps) {
  // CommonMark only — remark-gfm is not installed, so tables, strikethrough
  // and bare-URL autolinking are unavailable by design. Contributors write
  // explicit [label](url) links, which is the citation form we want anyway.
  return <ReactMarkdown components={components}>{children}</ReactMarkdown>;
}
