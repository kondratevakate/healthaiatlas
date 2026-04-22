import { ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { LastUpdated } from '@/components/shared/LastUpdated';
import { useLanguage } from '@/contexts/LanguageContext';
import { HUB_DOMAIN_IDS } from '@/data/constants';
import { getDomainById } from '@/data/domains';

export type HubDomainId = (typeof HUB_DOMAIN_IDS)[number];

export interface HubShellView {
  id: string;
  label: string;
  render: () => ReactNode;
}

interface HubShellProps {
  domainId: HubDomainId;
  views: HubShellView[];
  defaultView?: string;
  children?: ReactNode;
}

export function HubShell({ domainId, views, defaultView, children }: HubShellProps) {
  const { language } = useLanguage();
  const [active, setActive] = useState<string>(defaultView ?? views[0]?.id ?? '');

  const currentDomain = getDomainById(domainId);
  const neighbors = HUB_DOMAIN_IDS
    .filter((id) => id !== domainId)
    .map((id) => getDomainById(id))
    .filter((d): d is NonNullable<typeof d> => Boolean(d));

  return (
    <div className="border border-border bg-background">
      <div className="border-b border-border p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/directory">Directory</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{currentDomain?.name[language]}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <LastUpdated section={domainId} />
      </div>

      {children && <div className="border-b border-border p-4">{children}</div>}

      <Tabs value={active} onValueChange={setActive} className="p-4">
        <TabsList className="h-auto bg-secondary/30 border border-border rounded-none p-1 mb-4">
          {views.map((v) => (
            <TabsTrigger
              key={v.id}
              value={v.id}
              className="rounded-none px-4 py-1.5 text-xs font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {v.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {views.map((v) => (
          <TabsContent key={v.id} value={v.id} className="mt-0">
            {v.render()}
          </TabsContent>
        ))}
      </Tabs>

      {neighbors.length > 0 && (
        <div className="border-t border-border px-4 py-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
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
      )}
    </div>
  );
}
