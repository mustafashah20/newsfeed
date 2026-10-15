import { NewspaperIcon, SearchIcon } from 'lucide-react';

const FEED = { to: '/', label: 'Feed', icon: NewspaperIcon, exact: true } as const;
const SEARCH = { to: '/search', label: 'Search', icon: SearchIcon, exact: false } as const;

// The bottom tab bar (below md). From md up the header's wordmark and search bar do this job.
// Preferences is a button on the feed, beside the chips.
export const NAV_ITEMS = [FEED, SEARCH] as const;
