import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {ChevronRight} from 'lucide-react';
import {catalogCategories,findCategory} from '@/lib/catalog/categories';
import {getBuildItems} from '@/lib/data/items.build';
import {ValuesExplorer} from '@/components/values/ValuesExplorer';
import {CategoryDirectory} from '@/components/values/CategoryDirectory';
import {SafetyNotice} from '@/components/layout/SafetyNotice';
const origin=process.env.NEXT_PUBLIC_SITE_URL??'https://turbo-soccer-values-hub.civilmarmot8.chatgpt.site';
export function generateStaticParams(){return catalogCategories.map(category=>({category:category.slug}));}
export async function generateMetadata({params}:{params:Promise<{category:string}>}):Promise<Metadata>{const {category:slug}=await params;const category=findCategory(slug);return {title:category?`${category.name} · Item Values`:'Category not found',description:category?.description??'Browse documented Turbo Soccer cosmetic items.',alternates:{canonical:`/values/${slug}/`}};}
export default async function CategoryPage({params}:{params:Promise<{category:string}>}){
 const {category:slug}=await params,category=findCategory(slug);if(!category)notFound();
 const items=await getBuildItems(),included=items.filter(item=>item.categorySlug===slug);
 const data={'@context':'https://schema.org','@type':'CollectionPage',name:`Turbo Soccer ${category.name}`,url:`${origin}/values/${slug}/`,mainEntity:{'@type':'ItemList',numberOfItems:included.length,itemListElement:included.map((item,index)=>({'@type':'ListItem',position:index+1,name:item.name,url:`${origin}/items/${item.slug}/`}))}};
 return <div className="container inner-page category-page"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(data).replace(/</g,'\\u003c')}}/><div className="category-page-intro"><nav className="category-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><ChevronRight size={13}/><Link href="/values/">Items</Link><ChevronRight size={13}/><span aria-current="page">{category.name}</span></nav><p>{category.description} This category is provisional; missing values and item availability remain unverified.</p></div><ValuesExplorer initialData={items} initialCategory={slug} title={`${category.name}, decoded.`}/><CategoryDirectory selected={slug}/><SafetyNotice/></div>;
}
