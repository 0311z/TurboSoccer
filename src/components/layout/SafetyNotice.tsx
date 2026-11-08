import { ShieldCheck, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
export function SafetyNotice(){return <aside className="safety-notice"><ShieldCheck size={23}/><div><strong>A great trade is a safe trade.</strong><p>Never trade for real money, accounts or items outside Roblox. Never send first.</p></div><Link href="/disclaimer/">Stay safe <ArrowUpRight size={16}/></Link></aside>}
