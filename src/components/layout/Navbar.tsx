'use client';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X, Zap, Search } from 'lucide-react';
import { UserMenu } from './UserMenu';
import { ThemeToggle } from './ThemeToggle';
const AuthDialog=dynamic(()=>import('@/components/auth/AuthDialog').then(m=>m.AuthDialog));
const SearchDialog=dynamic(()=>import('./SearchDialog').then(m=>m.SearchDialog));
export function Navbar(){
 const path=usePathname();const [auth,setAuth]=useState(false),[menu,setMenu]=useState(false),[search,setSearch]=useState(false);
 useEffect(()=>{setMenu(false);setSearch(false);},[path]);
 useEffect(()=>{function key(e:KeyboardEvent){if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setSearch(v=>!v);}if(e.key==='Escape')setMenu(false);}document.addEventListener('keydown',key);return()=>document.removeEventListener('keydown',key);},[]);
 const links=[{href:'/',name:'Overview'},{href:'/values/',name:'Values'},{href:'/trading/',name:'Trading'},{href:'/calculator/',name:'Calculator'},{href:'/compare/',name:'Compare'}];
 return <><header className="site-header"><div className="header-inner"><Link className="brand" href="/" aria-label="Turbo Soccer Values home"><span className="brand-symbol"><Zap fill="currentColor" size={25}/></span><span>TURBO SOCCER<span className="brand-bottom">VALUES <span className="beta">BETA</span></span></span></Link><nav id="primary-navigation" className={menu?'main-nav nav-open':'main-nav'} aria-label="Main navigation">{links.map(link=>{const current=link.href==='/'?path==='/':path.startsWith(link.href);return <Link key={link.href} href={link.href} onClick={()=>setMenu(false)} aria-current={current?'page':undefined}>{link.name}{current&&<span className="nav-dot"/>}</Link>;})}<div className="mobile-nav-tools"><span>Appearance</span><ThemeToggle/></div></nav><div className="header-actions"><button className="command-search" onClick={()=>setSearch(true)} aria-label="Search items. Control or Command K"><Search size={16}/><span>Search items</span><kbd>⌘ K</kbd></button><ThemeToggle/><UserMenu onSignIn={()=>setAuth(true)}/><button className="icon-button mobile-menu" aria-label={menu?'Close navigation':'Open navigation'} aria-expanded={menu} aria-controls="primary-navigation" onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button></div></div></header>{auth&&<AuthDialog open={auth} onClose={()=>setAuth(false)}/>} {search&&<SearchDialog onClose={()=>setSearch(false)}/>}</>;
}
