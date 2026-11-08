import type {Item} from '@/types/domain';
import {catalogCoverage} from '@/lib/catalog/compare';
export function CatalogCoverage({items}:{items:Item[]}) {
 const {total,valued,demand,tradability}=catalogCoverage(items);
 return <p className="catalog-coverage">{`Recorded data: ${valued}/${total} values · ${demand}/${total} demand · ${tradability}/${total} trading status.`}</p>;
}
