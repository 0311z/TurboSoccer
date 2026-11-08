'use client';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queries/keys';
import { fetchItems } from '@/lib/data/items';
import { seedItems } from '@/lib/data/seed';
import type { Item } from '@/types/domain';
export function useItems(initialData: Item[] = seedItems) {
  return useQuery({ queryKey: queryKeys.items, queryFn: fetchItems, initialData, initialDataUpdatedAt: 0, staleTime: 60_000, refetchInterval: 60_000, gcTime: 300_000, retry: 1 });
}
