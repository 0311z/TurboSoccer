'use client';
import { create } from 'zustand';
import { persist, type PersistStorage } from 'zustand/middleware';
import { EMPTY_TRADE, type TradeDraft } from '@/lib/trade/calc';
import { DRAFT_VERSION, parseStoredTrade, parseTrade } from '@/lib/trade/state';
import { trace } from '@/lib/logger';
type Persisted = { draft: TradeDraft };
type Store = Persisted & { previous: TradeDraft | null; setDraft: (draft: TradeDraft) => void; reset: () => void; undo: () => void };
const storage: PersistStorage<Persisted> = {
  getItem(name) { const t=trace('calculator.restore'); try { const raw=localStorage.getItem(name); if(!raw)return null; const draft=parseStoredTrade(JSON.parse(raw)); if(!draft)throw new Error('Invalid stored draft');t.ok();return {state:{draft},version:DRAFT_VERSION}; } catch(error){t.fail(error);return null;} },
  setItem(name,value) {const t=trace('calculator.persist');try{localStorage.setItem(name,JSON.stringify(value));t.ok();}catch(error){t.fail(error);}},
  removeItem(name) {const t=trace('calculator.clear');try{localStorage.removeItem(name);t.ok();}catch(error){t.fail(error);}},
};
export const useTradeDraft = create<Store>()(persist((set)=>({
  draft:EMPTY_TRADE,previous:null,
  setDraft:(draft)=>{if(parseTrade(draft))set(state=>({draft,previous:state.draft}));},
  reset:()=>set(state=>({draft:EMPTY_TRADE,previous:state.draft})),
  undo:()=>set(state=>state.previous?{draft:state.previous,previous:null}:state),
}),{name:'tsv-trade-draft',version:DRAFT_VERSION,storage,skipHydration:true,partialize:state=>({draft:state.draft}),migrate:(value)=>({draft:parseStoredTrade(value)??EMPTY_TRADE})}));
