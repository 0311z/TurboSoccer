export function RarityBadge({rarity}:{rarity:string|null}){return <span className={`rarity ${rarity?.toLowerCase()??'unknown'}`}><i/>{rarity??'Unverified'}</span>}
