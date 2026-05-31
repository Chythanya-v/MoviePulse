export const STREAMING_PROVIDERS = {
  netflix: { id: 8,    name: 'Netflix',      color: '#E50914', watchRegion: 'IN' },
  prime:   { id: 9,    name: 'Amazon Prime', color: '#00A8E1', watchRegion: 'IN' },
  hotstar: { id: 2336, name: 'JioHotstar',   color: '#1F80E0', watchRegion: 'IN' },
} as const;

export type ProviderKey = keyof typeof STREAMING_PROVIDERS;
