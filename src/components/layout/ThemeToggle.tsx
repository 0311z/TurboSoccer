'use client';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { trace } from '@/lib/logger';
export function ThemeToggle(){
 const [light,setLight]=useState(false);
 useEffect(()=>{setLight(document.documentElement.classList.contains('light'));},[]);
 function toggle(){const next=!light;setLight(next);document.documentElement.classList.toggle('light',next);document.documentElement.classList.toggle('dark',!next);const t=trace('theme.save');try{localStorage.setItem('tsv-theme',next?'light':'dark');t.ok();}catch(error){t.fail(error);}}
 return <button className="icon-button theme-button" onClick={toggle} aria-label={`Switch to ${light?'dark':'light'} theme`} title={`Switch to ${light?'dark':'light'} theme`}>{light?<Moon size={18}/>:<Sun size={18}/>}</button>;
}
