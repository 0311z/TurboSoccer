'use client';
import { useEffect } from 'react';
import { trace } from '@/lib/logger';
export default function GlobalError({error,reset}:{error:Error;reset:()=>void}){useEffect(()=>{trace('app.unexpected').fail(error);},[error]);return <html lang="en"><body style={{background:'#0b0c10',color:'#f3f3f6',fontFamily:'Arial',padding:40,lineHeight:1.7}}><h1>The garage needs a quick restart.</h1><p>Something unexpected happened. Your saved comparison stays in this browser.</p><button onClick={reset} style={{background:'#ff8a28',color:'#111',border:0,borderRadius:7,padding:'14px 20px',cursor:'pointer'}}>Try again</button></body></html>}
