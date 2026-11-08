'use client';
import { useState } from 'react';
import type { Item } from '@/types/domain';
import { itemImageUrl, type ItemImageSize } from '@/lib/utils/itemImageUrl';
import { trace } from '@/lib/logger';
import { ItemArt } from '@/components/items/ItemArt';
import './item-image.css';
export function ItemImage({ item, size = 256, large = false }: { item: Item; size?: ItemImageSize; large?: boolean }) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const source = itemImageUrl(item, size);
  if (!source || failedSource === source) return <ItemArt category={item.categorySlug} name={item.name} large={large}/>;
  return <span className={`item-art item-image ${large ? 'art-large' : ''}`}>
    <img src={source} width={size} height={size} alt={`${item.name} cosmetic item`} loading="lazy" decoding="async" onError={() => {
      trace('items.image').fail(new Error('Item artwork unavailable'), { itemId: item.id });
      setFailedSource(source);
    }}/>
  </span>;
}
