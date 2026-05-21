import { ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LastUpdated } from '@/components/shared/LastUpdated';
import { useLanguage } from '@/contexts/LanguageContext';
import { HUB_DOMAIN_IDS } from '@/data/constants';
import { getDomainById } from '@/data/domains';
import { cn } from '@/lib/utils';

export type HubDomainId = (typeof HUB_DOMAIN_IDS)[number];

export interface HubShellView {
  id: string;
  label: string;
  render: () => ReactNode;
  /** One-sentence description of what this view shows. Rendered above the
   *  view content as a small subtitle so users know what to expect before
   *  switching tabs. */
  description?: string;
}

interface HubShellProps {
  domainId: HubDomainId;
  views: HubShellView[];
  defaultView?: string;
  /** Top child slot — rendered above the tabs inside the bordered frame. */
  children?: ReactNode;
}

export function HubShell({ domainId, views, defaultView, children }: HubShellProps) {
  const { language } = useLanguage();
  const [active, setActive] = useState<string>(defaultView ?? views[0]?.id ?? '');

  const neighbors = HUB_DOMAIN_IDS
    .filter((id) => id !== domainId)
    .map((id) => getDomainById(id))
    .filter((d): d is NonNullable<typeof d> => Boolean(d));

  return (
    <div className="border border-border bg-background">
      {children && <div className="border-b border-border p-3 sm:p-4">{children}</div>}

      <Tabs value={active} onValueChange={setActive} className="p-3 sm:p-4">
        <TabsList className="h-auto bg-transparent border-b border-border rounded-none p-0 mb-6 w-full justify-start gap-0 flex-wrap">
          {views.map((v, idx) => (
            <TabsTrigger
              key={v.id}
              value={v.id}
              className={cn(
                'rounded-none border-b-2 border-transparent bg-transparent px-5 py-3 -mb-px',
                'text-sm font-semibold tracking-tight',
                'text-muted-foreground hover:text-foreground transition-colors',
                'data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:bg-transparent',
                'data-[state=active]:shadow-none',
                idx === 0 && 'data-[state=active]:font-bold',
              )}
            >
              {v.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {views.map((v) => (
          <TabsContent key={v.id} value={v.id} className="mt-0">
            {v.description && (
              <p className="text-xs text-muted-foreground mb-4 max-w-3xl">{v.description}</p>
            )}
            {v.render()}
          </TabsContent>
        ))}
      </Tabs>

      <div className="border-t border-border px-3 sm:px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs text-muted-foreground">
        {neighbors.length > 0 ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="uppercase tracking-widest font-mono text-[10px]">See also</span>
            {neighbors.map((d, i) => (
              <span key={d.id} className="inline-flex items-center gap-3">
                {i > 0 && <span className="text-border">·</span>}
                <Link
                  to={`/directory?domain=${d.id}`}
                  className="hover:text-foreground transition-colors"
                >
                  {d.name[language]}
                </Link>
              </span>
            ))}
          </div>
        ) : (
          <span />
        )}
        <LastUpdated section={domainId} />
      </div>
    </div>
  );
}
