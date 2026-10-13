import { NewspaperIcon, SearchIcon, SlidersHorizontalIcon } from 'lucide-react';

export const NAV_ITEMS = [
  { to: '/', label: 'Feed', icon: NewspaperIcon, exact: true },
  { to: '/search', label: 'Search', icon: SearchIcon, exact: false },
  { to: '/preferences', label: 'Preferences', icon: SlidersHorizontalIcon, exact: false },
] as const;
