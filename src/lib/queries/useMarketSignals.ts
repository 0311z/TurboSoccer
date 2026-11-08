'use client';
import { useQuery } from '@tanstack/react-query';
import { publicEnv as env } from '@/config/publicEnv';
import { fetchMarketSignals } from '@/lib/data/marketSignals';
export function useMarketSignals(){return useQuery({queryKey:['market-signals'],queryFn:fetchMarketSignals,enabled:env.configured,staleTime:60_000,refetchInterval:60_000,retry:1});}
