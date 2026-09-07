// Atlas-wide search modal. cmdk handles fuzzy filtering against the
// concatenated `value` per CommandItem, so we only need to assemble the
// index and render results grouped by entity type.

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  buildSearchIndex,
  SEARCHABLE_TYPE_LABELS,
  type SearchableEntity,
  type SearchableType,
} from '@/lib/searchIndex';

// Order chosen by traffic priority: Open Calls leads (largest inventory),
// Players + Domains anchor the analytical surface, Events trail (lower
// volume, time-bound). Same logic as Header navLinks.
const RENDER_ORDER: SearchableType[] = ['opencall', 'domain', 'wiki', 'player', 'conference', 'launch'];

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const { language } = useLanguage();
  const navigate = useNavigate();

  // Rebuilds only when language toggles — players/domains/etc are
  // module-load constants, so the index is stable otherwise.
  const grouped = useMemo(() => {
    const index = buildSearchIndex(language);
    const out: Record<SearchableType, SearchableEntity[]> = {
      opencall: [],
      player: [],
      domain: [],
      conference: [],
      launch: [],
      wiki: [],
    };
    for (const item of index) out[item.type].push(item);
    return out;
  }, [language]);

  const handleSelect = (url: string) => {
    onOpenChange(false);
    navigate(url);
  };

  const placeholder =
    language === 'en'
      ? 'Search Atlas — open calls, players, domains, events…'
      : 'ابحث في الأطلس — دعوات، لاعبون، مجالات، فعاليات…';

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder={placeholder} />
      <CommandList>
        <CommandEmpty>
          {language === 'en' ? 'No matches found.' : 'لا توجد نتائج.'}
        </CommandEmpty>
        {RENDER_ORDER.map((type, idx) => {
          const items = grouped[type];
          if (items.length === 0) return null;
          const heading = `${SEARCHABLE_TYPE_LABELS[type][language]} · ${items.length}`;
          return (
            <div key={type}>
              {idx > 0 && <CommandSeparator />}
              <CommandGroup heading={heading}>
                {items.map((item) => (
                  <CommandItem
                    key={item.id}
                    // cmdk filters on this concatenated value — title +
                    // subtitle + keywords gives the matcher every signal
                    // we have, while the rendered output stays compact.
                    value={[item.title, item.subtitle ?? '', ...item.keywords].join(' ')}
                    onSelect={() => handleSelect(item.url)}
                    className="rounded-none flex flex-col items-start gap-0.5 cursor-pointer aria-selected:bg-secondary"
                  >
                    <div className="flex items-baseline justify-between w-full gap-2">
                      <span className="text-sm font-medium truncate">{item.title}</span>
                      {item.meta && (
                        <span className="text-[10px] text-muted-foreground font-mono shrink-0 uppercase tracking-wider">
                          {item.meta}
                        </span>
                      )}
                    </div>
                    {item.subtitle && (
                      <span className="text-xs text-muted-foreground truncate w-full">
                        {item.subtitle}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </div>
          );
        })}
      </CommandList>
    </CommandDialog>
  );
}
