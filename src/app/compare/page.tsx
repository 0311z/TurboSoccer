import type {Metadata} from 'next';
import {ItemComparison} from '@/components/compare/ItemComparison';
import {getBuildItems} from '@/lib/data/items.build';
export const metadata:Metadata={title:'Compare Items',description:'Compare up to four Turbo Soccer items side by side: values, demand, rarity, trading availability and how to obtain them. Share your shortlist without an account.',alternates:{canonical:'/compare/'}};
export default async function ComparePage() {
 const items=await getBuildItems();
 return <div className="container page-content compare-page"><div className="page-heading"><span className="eyebrow">THE DETAILS BEHIND YOUR NEXT UPGRADE</span><h1>Less guesswork.<br/><span>Compare your options.</span></h1><p>See up to four items side by side. Find the details that matter before you trade.</p></div><ItemComparison initialItems={items}/></div>;
}
