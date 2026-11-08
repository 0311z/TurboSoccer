import type { Metadata } from 'next';
import { TradeDetail } from '@/components/trading/TradeDetail';
export const metadata:Metadata={title:'Trade Details',description:'Review a Turbo Soccer listing and manage your offers.',robots:{index:false,follow:false}};
export default function TradePage(){return <div className="container page-content"><TradeDetail/></div>}
