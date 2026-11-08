'use client';
import Link from 'next/link';
import { useState } from 'react';
import { LogOut, UserRound, Bookmark, ArrowUpRight, Settings2 } from 'lucide-react';
import { useAuth } from '@/lib/auth/useAuth';
import { signOut } from '@/lib/data/profiles';
export function UserMenu({onSignIn}:{onSignIn:()=>void}){
 const {session}=useAuth();const [error,setError]=useState('');
 async function leave(){try{await signOut();setError('');}catch{setError('Sign-out failed. Please try again.');}}
 if(!session)return <button className="btn btn-primary sign-in" onClick={onSignIn}>Sign in <ArrowUpRight size={15}/></button>;
 return <details className="user-menu"><summary className="btn btn-secondary sign-in"><UserRound size={16}/><span>Account</span></summary><div><Link href="/profile/"><UserRound size={15}/> My profile</Link><Link href="/values/?saved=1"><Bookmark size={15}/> Saved items</Link><button onClick={()=>void leave()}><LogOut size={15}/> Sign out</button>{error&&<p role="alert">{error}</p>}</div></details>;
}
