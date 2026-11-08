import { CarFront, CircleDot, PartyPopper, Crown, RectangleEllipsis, Megaphone, Flag, Package } from 'lucide-react';
export function ItemArt({category,name,large=false}:{category:string;name:string;large?:boolean}){
 const Icon=category==='car-body'?CarFront:category==='wheels'?CircleDot:category==='topper'?name==='Birthday Cake'?PartyPopper:Crown:category==='horn'?Megaphone:category==='license-plate'?RectangleEllipsis:category==='decal'?Flag:Package;
 return <span className={`item-art art-${category} ${large?'art-large':''}`} aria-label={`${name}, category illustration`} role="img"><Icon size={large?110:32} strokeWidth={large?1.2:1.6}/></span>;
}
