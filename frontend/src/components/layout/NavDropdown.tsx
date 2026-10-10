import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Header entry that is both a link and a dropdown:
//   • click / tap / Enter on the label opens the section's overview page (`to`);
//   • hovering with a mouse, or Space / ArrowDown from the keyboard, opens the
//     sub-section menu.
// The whole label + chevron is the Radix trigger, so the menu anchors to the
// label's left edge (AGENTS.md hard rule #4).
//
// Radix toggles a trigger on pointerdown and Enter; both are pre-empted here
// (Radix skips its own handler when the event is defaultPrevented), so a press
// navigates instead of toggling.

const CLOSE_DELAY_MS = 150;

// Shared across instances (the header remounts on every page):
//   • only one hover menu open at a time, so moving from one label to the next
//     doesn't leave two menus overlapping during the close delay;
//   • after a click, the label doesn't reopen its menu just because the pointer
//     is still resting on it on the new page; it waits for the pointer to leave.
let closeCurrent: (() => void) | null = null;
let suppressHoverFor: string | null = null;

interface NavDropdownProps {
  to: string;
  className?: string;
  label: ReactNode;
  children: ReactNode;
}

export function NavDropdown({ to, className, label, children }: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const closeTimer = useRef<number | undefined>(undefined);
  const openedByHover = useRef(false);

  const cancelClose = () => window.clearTimeout(closeTimer.current);
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  };
  const close = () => setOpen(false);
  const openOnHover = () => {
    if (suppressHoverFor === to) return;
    cancelClose();
    if (closeCurrent && closeCurrent !== close) closeCurrent();
    closeCurrent = close;
    openedByHover.current = true;
    setOpen(true);
  };

  useEffect(() => setOpen(false), [pathname, search]);
  useEffect(() => cancelClose, []);

  const isMouse = (e: React.PointerEvent) => e.pointerType === 'mouse';

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(next) => {
        if (next) openedByHover.current = false;
        setOpen(next);
      }}
      modal={false}
    >
      <DropdownMenuTrigger asChild>
        <Link
          to={to}
          className={cn('inline-flex items-center gap-1 outline-none', className)}
          onPointerEnter={(e) => isMouse(e) && openOnHover()}
          onPointerLeave={(e) => {
            if (!isMouse(e)) return;
            if (suppressHoverFor === to) suppressHoverFor = null;
            scheduleClose();
          }}
          onPointerDown={(e) => e.preventDefault()}
          onClick={() => {
            suppressHoverFor = to;
            setOpen(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              setOpen(false);
              navigate(to);
            }
          }}
        >
          {label}
          <ChevronDown className="h-3 w-3 opacity-60" aria-hidden />
        </Link>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={4}
        className="min-w-[260px] rounded-none"
        onPointerEnter={cancelClose}
        onPointerLeave={(e) => isMouse(e) && scheduleClose()}
        // Closed after a hover: don't pull focus back onto the trigger.
        onCloseAutoFocus={(e) => openedByHover.current && e.preventDefault()}
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
