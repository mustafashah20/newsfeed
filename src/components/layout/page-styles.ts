// Shared by every page (feed, search, reader, not found, errors) so moving between them doesn't
// change the title's size or the rhythm between sections. AppShell sets the width and edges.

/** The page's sections, top to bottom. */
export const PAGE_STACK_CLASS = 'flex flex-col gap-6 md:gap-8';

export const PAGE_TITLE_CLASS =
  'font-heading text-[2.125rem] leading-[1.1] font-medium tracking-tight break-words sm:text-5xl sm:leading-[1.05]';

export const PAGE_DESCRIPTION_CLASS = 'mt-2.5 text-base text-muted-foreground';
