import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { Providers } from './providers';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { site } from '@/config/site';
import '@/lib/env';
import './globals.css';
const geist=localFont({src:[{path:'../../public/fonts/geist-regular.woff2',weight:'400',style:'normal'},{path:'../../public/fonts/geist-bold.woff2',weight:'700',style:'normal'}],variable:'--font-geist',display:'swap'});
export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:[{media:'(prefers-color-scheme: dark)',color:'#0b0c10'},{media:'(prefers-color-scheme: light)',color:'#f5f5f9'}]};
export const metadata:Metadata={metadataBase:new URL(site.url),title:{default:'Turbo Soccer Values · Know the value. Own the trade.',template:'%s | Turbo Soccer Values'},description:'Explore the Turbo Soccer item catalog, compare fair trades, and find your next upgrade. Independent, transparent and built for the community.',applicationName:site.name,icons:{icon:'/brand/favicon.svg'},openGraph:{title:'Turbo Soccer Values',description:'Know the value. Own the trade. Your independent Turbo Soccer companion.',type:'website',locale:'en_US',siteName:site.name,images:[{url:'/brand/turbo-hero.webp',width:1100,height:733,alt:'Purple turbo car and soccer ball original concept artwork'}]},twitter:{card:'summary_large_image',title:site.name,description:site.description,images:['/brand/turbo-hero.webp']},alternates:{canonical:'/'}};
const themeScript="try{var t=localStorage.getItem('tsv-theme');if(t==='light'){document.documentElement.classList.add('light');document.documentElement.classList.remove('dark')}}catch(e){}";
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" className={`dark ${geist.variable}`} suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:themeScript}}/></head><body><a href="#main-content" className="skip-link">Skip to content</a><Providers><Navbar/><main id="main-content" tabIndex={-1}>{children}</main><div className="container"><Footer/></div></Providers></body></html>}
