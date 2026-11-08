import Link from 'next/link';
import {catalogCategories} from '@/lib/catalog/categories';
export function CategoryDirectory({selected}:{selected?:string}){return <nav className="category-directory" aria-label="All item categories"><h2>Explore every corner of the garage.</h2><div>{catalogCategories.map(category=><Link href={`/values/${category.slug}/`} key={category.slug} aria-current={category.slug===selected?'page':undefined}>{category.name}</Link>)}</div></nav>;}
