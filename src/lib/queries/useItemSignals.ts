'use client';
import { useQuery } from '@tanstack/react-query';
import { fetchItemSignals } from '@/lib/data/itemSignals';
export function useItemSignals(itemId: string) {
  return useQuery({ queryKey: ['item-signals', itemId], queryFn: () => fetchItemSignals(itemId), staleTime: 60_000, refetchInterval: 60_000, retry: 1 });
}
