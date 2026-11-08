import type { Metadata } from 'next';
import { TradeBoard } from '@/components/trading/TradeBoard';
export const metadata: Metadata = { title: 'Trading Marketplace', description: 'Browse Turbo Soccer trading listings. Find items, compare values and make safer trades inside Roblox.', alternates: { canonical: '/trading/' } };
export default function TradingPage() { return <div className="container page-content"><TradeBoard/></div>; }
