export const queryKeys = { items: ['items'] as const, listings: ['listings'] as const, profile: (id: string) => ['profile', id] as const };
