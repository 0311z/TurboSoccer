'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { integerInput } from '@/lib/trade/state';
export function NumberField({value,min,max,label,onChange,onValidity,stepper=false}:{value:number;min:number;max:number;label:string;onChange:(value:number)=>void;onValidity?:(valid:boolean)=>void;stepper?:boolean}){
 const [text,setText]=useState(String(value));const id=useId();const inputRef=useRef<HTMLInputElement>(null);const number=integerInput(text,min,max);const valid=number!==null;
 useEffect(()=>{setText(String(value));},[value]);
 useEffect(()=>{inputRef.current?.setCustomValidity(valid?'':`Enter a whole number from ${min} to ${max}.`);onValidity?.(valid);},[valid,onValidity,min,max]);
 function update(next:string,input:HTMLInputElement){setText(next);const parsed=integerInput(next,min,max);input.setCustomValidity(parsed===null?`Enter a whole number from ${min} to ${max}.`:'');if(parsed!==null)onChange(parsed);}
 return <span className={`number-field ${stepper?'with-stepper':''}`}><span className="number-input">{stepper&&<button type="button" disabled={value<=min} aria-label={`Decrease ${label}`} onClick={()=>{setText(String(value-1));onChange(value-1);}}><Minus size={12}/></button>}<input ref={inputRef} id={id} aria-label={label} aria-invalid={!valid} aria-describedby={!valid?`${id}-error`:undefined} type="text" inputMode="numeric" pattern="[0-9]+" value={text} onChange={e=>update(e.target.value,e.currentTarget)} onBlur={e=>e.currentTarget.reportValidity()}/>{stepper&&<button type="button" disabled={value>=max} aria-label={`Increase ${label}`} onClick={()=>{setText(String(value+1));onChange(value+1);}}><Plus size={12}/></button>}</span>{!valid&&<small id={`${id}-error`} className="number-error">Whole numbers {min}–{max.toLocaleString('en-US')} only.</small>}</span>;
}
