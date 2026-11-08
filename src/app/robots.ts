import type {MetadataRoute} from 'next';
export const dynamic='force-static';
export default function robots():MetadataRoute.Robots{const origin=process.env.NEXT_PUBLIC_SITE_URL??'https://turbo-soccer-values-hub.civilmarmot8.chatgpt.site';return {rules:{userAgent:'*',allow:'/',disallow:['/auth/','/profile/','/admin/','/u/','/trade/']},sitemap:`${origin}/sitemap.xml`};}
