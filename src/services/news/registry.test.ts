import { describe, expect, it } from 'vitest';

import { providerList, providers } from './registry';
import { PROVIDER_IDS } from './types';

describe('provider registry', () => {
  it('registers every provider id once, keyed by its own id, in PROVIDER_IDS order', () => {
    expect(providerList.map((p) => p.id)).toEqual([...PROVIDER_IDS]);
    for (const id of PROVIDER_IDS) expect(providers[id].id).toBe(id);
  });
});
