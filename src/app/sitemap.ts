import type {MetadataRoute} from 'next';
import {getBuildItems} from '@/lib/data/items.build';
import {site} from '@/config/site';
export const dynamic='force-static';
const categories=['car-body','paint','decal','sticker','wheels','boost-trail','topper','horn','license-plate','ball-skin','demolition-effect','goal-explosion','emote'];
export default async function sitemap():Promise<MetadataRoute.Sitemap>{return ['','values/','trading/','calculator/','guide/','privacy/','terms/','disclaimer/',...categories.map(c=>`values/${c}/`),...(await getBuildItems()).map(i=>`items/${i.slug}/`)].map(path=>({url:`${site.url}/${path}`}));}
