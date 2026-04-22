import { Evidence } from '@/types/claims';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Calendar, Lock, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

const sourceLabels: Record<string, string> = {
  official_registry: 'Official Registry',
  policy: 'Policy Document',
  vendor_doc: 'Vendor Documentation',
  press_release: 'Press Release',
  peer_reviewed: 'Peer Reviewed',
  news: 'News',
  social: 'Social Media',
  paid_dataset: 'Paid Dataset',
};

const accessIcons: Record<string, React.ElementType> = {
  public: Globe,
  login_required: Lock,
  paywalled: Lock,
};

export function EvidenceDetail({ item }: { item: Evidence }) {
  const AccessIcon = accessIcons[item.access] || Globe;

  return (
    <div className="border border-border bg-secondary/30 p-4 space-y-3">
      {/* Source type + access */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className="rounded-none text-xs">
          {sourceLabels[item.source_type] || item.source_type}
        </Badge>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <AccessIcon className="w-3 h-3" />
          {item.access}
        </span>
      </div>

      {/* Title as link */}
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors"
      >
        {item.title}
        <ExternalLink className="w-3 h-3 shrink-0" />
      </a>

      {/* Publisher + dates */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
        <span>{item.publisher}</span>
        {item.published_at && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Published {item.published_at}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          Retrieved {item.retrieved_at}
        </span>
      </div>

      {/* Excerpt */}
      {item.excerpt && (
        <blockquote className="border-l-2 border-muted-foreground/30 pl-3 text-sm text-muted-foreground italic">
          {item.excerpt}
        </blockquote>
      )}
    </div>
  );
}
