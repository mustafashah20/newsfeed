// The Search page's filter look (design/Search.dc.html), shared by every filter control so they
// can't drift: pills that turn dark once set, and menus with a small heading and 44px rows.

const FOCUS_RING =
  'focus-visible:border-transparent focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

/** A filter pill with nothing set: white, thin border, the default label. */
export const PILL = `h-11 gap-1.5 rounded-full border border-input bg-background pr-3 pl-4 text-sm font-medium text-foreground shadow-none hover:bg-muted hover:text-foreground aria-expanded:bg-muted ${FOCUS_RING}`;

/** A filter pill with a value set: dark, showing that value. */
export const PILL_ACTIVE =
  'border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground aria-expanded:bg-primary/90 aria-expanded:text-primary-foreground';

/** The text-only "Clear filters" / "Clear all" action beside the pills. */
export const CLEAR_ACTION = `h-11 px-3 text-sm font-semibold text-link hover:text-link ${FOCUS_RING}`;

/** A filter's dropdown panel. */
export const MENU_PANEL =
  'w-65 gap-0 rounded-[14px] border border-border bg-popover p-2 text-popover-foreground shadow-xl shadow-foreground/10 ring-0';

/** The small uppercase heading at the top of a menu. */
export const MENU_HEADING =
  'px-3 pt-2 pb-1.5 text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase';

/** A 44px option row (the date panel's quick ranges); `group` lets its indicator react to hover. */
export const MENU_OPTION =
  'group h-11 gap-3 rounded-lg px-3 text-[0.9375rem] text-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground';
