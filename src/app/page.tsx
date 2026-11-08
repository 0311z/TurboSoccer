import { Hero } from '@/components/layout/Hero';
import { QuickTools } from '@/components/layout/QuickTools';
import { ValuesExplorer } from '@/components/values/ValuesExplorer';
import { SafetyNotice } from '@/components/layout/SafetyNotice';
import { CategoryShowcase } from '@/components/layout/CategoryShowcase';
import { FairnessSandbox } from '@/components/layout/FairnessSandbox';
import { HomeFaq } from '@/components/layout/HomeFaq';
import { getBuildItems } from '@/lib/data/items.build';
import { site } from '@/config/site';
export default async function Home(){const items=await getBuildItems();const json={'@context':'https://schema.org','@type':'WebSite',name:'Turbo Soccer Values',url:site.url};return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(json).replace(/</g,'\\u003c')}}/><div className="announcement"><span className="beta-inline">BETA SEASON</span> A new game. A smarter way to trade. <span className="announcement-end">Welcome to Turbo Soccer Values <span>↗</span></span></div><div className="container"><Hero itemCount={items.length}/><QuickTools/><ValuesExplorer home initialData={items}/><CategoryShowcase items={items}/><FairnessSandbox/><HomeFaq/><SafetyNotice/></div></>}
