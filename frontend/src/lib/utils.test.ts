import { describe, it, expect } from 'vitest';
import { cn } from './utils';

// cn() must know the custom text-* utilities from index.css; otherwise
// tailwind-merge treats them as colours and silently drops them.
describe('cn', () => {
  it.each(['text-body', 'text-body-sm', 'text-small'])('keeps %s next to a text colour', (size) => {
    expect(cn(size, 'text-muted-foreground')).toBe(`${size} text-muted-foreground`);
  });

  it('still lets a later font size override a custom one', () => {
    expect(cn('text-body', 'text-lg')).toBe('text-lg');
  });

  it('still resolves real conflicts', () => {
    expect(cn('items-center', 'items-start')).toBe('items-start');
  });
});
