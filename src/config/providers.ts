export const STREAMING_PROVIDERS = {
  netflix: { id: 8, name: "Netflix", color: "#E50914" },
  prime: { id: 9, name: "Amazon Prime", color: "#00A8E1" },
  hotstar: { id: 351, name: "Hotstar", color: "#1F80E0" },
} as const;

export type ProviderKey = keyof typeof STREAMING_PROVIDERS;
