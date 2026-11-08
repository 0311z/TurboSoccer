import type { Metadata } from 'next';
import { ValuesExplorer } from '@/components/values/ValuesExplorer';
import { CategoryDirectory } from '@/components/values/CategoryDirectory';
import { SafetyNotice } from '@/components/layout/SafetyNotice';
export const metadata:Metadata={title:'Item Values & Wiki',description:'Browse documented Turbo Soccer items, filter the catalog and discover their origins. Unknown values are clearly marked.',alternates:{canonical:'/values/'}};
import { getBuildItems } from '@/lib/data/items.build';
export default async function ValuesPage(){const items=await getBuildItems();return <div className="container inner-page"><ValuesExplorer initialData={items}/><CategoryDirectory/><SafetyNotice/></div>}
