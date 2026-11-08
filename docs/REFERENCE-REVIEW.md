# Referencia principal y diferencias de la importación

La referencia indicada por el usuario es [sacharevet39-dotcom/turbo-soccer-values](https://github.com/sacharevet39-dotcom/turbo-soccer-values). Se revisó su código en el commit **`c6b2c80cef8c06b100347a598f9f3aac8f1835de`**, correspondiente al `main` leído durante esta importación. El destino del código nuevo es **`0311z/TurboSoccer`**, un repositorio privado distinto. Esta revisión no consulta ni modifica la base de datos ni la instalación Cloudflare del proyecto original.

El código de referencia demuestra cómo funciona ese sitio; no verifica por sí solo las reglas actuales dentro del juego Roblox. Las diferencias siguientes se mantienen visibles para no presentar la v2 como una migración de datos o una copia con paridad completa.

## Qué se conserva y qué cambia

| Área | Evidencia del repositorio de referencia | Código importado en este repositorio | Decisión y consecuencia |
|---|---|---|---|
| Frontend | [`package.json`](https://github.com/sacharevet39-dotcom/turbo-soccer-values/blob/c6b2c80cef8c06b100347a598f9f3aac8f1835de/package.json): Vite 6, React 19, TypeScript | `next.config.ts`, `src/app/`: Next.js 16 con `output: 'export'` | Se entrega una aplicación estática nueva; no se ejecuta la configuración Vite anterior. |
| Publicación | `README.md`, `public/_routes.json`: salida `dist` y Pages Functions | `.github/workflows/deploy.yml`: salida `out` y Direct Upload; `.openai/hosting.json` conserva la identidad del Site | No copiar a ciegas el comando/output de la referencia ni cambiar la producción anterior. GitHub no configura automáticamente una cuenta Cloudflare. |
| Catálogo | `src/App.tsx`, `src/lib/supabase.ts`: consulta de las primeras 1.000 filas, filtros, imágenes, valores y demanda | `src/components/values/`, `src/lib/data/`: snapshot estático, hidratación, filtros compartibles y CSV | Se conserva la unidad coins y la distinción entre `NULL` y cero. El snapshot contiene doce nombres documentados, no los registros de producción. |
| Esquema de ítems | `supabase/migrations/202610260001_initial_schema.sql`: categoría y rareza como texto; UUID sin slug | `supabase/migrations/20261108000100_schema.sql`: FKs de categorías/rarezas, slug y campos de procedencia/tradabilidad | Los dos esquemas no son intercambiables. Las seis migraciones de noviembre requieren un proyecto **nuevo**. |
| Administración | `src/admin/AdminManagement.tsx`, `functions/api/admin/`: allowlist privada, roles `OWNER`/`ADMIN`, contraseñas, primer cambio, sesiones y presencia | `src/components/admin/`, `src/lib/data/staff.ts`: perfiles con roles `owner`/`admin` y RPC de valoración | El editor nuevo no sustituye el sistema previo de provisión y contraseñas. No se copian usuarios, contraseñas, tokens ni roles por metadatos de OAuth. |
| Identidad pública | `src/NavIdentityMenu.tsx`, `src/lib/supabase.ts`: Roblox custom OAuth y Discord; sesiones de trading y admin separadas | `src/components/auth/`, `src/lib/auth/`: Discord/Google, email por enlace opcional, un cliente PKCE | El formulario de nombre Roblox nuevo no demuestra propiedad de la cuenta. La conexión Roblox verificada de la referencia no está implementada en v2. |
| Historial | `supabase/migrations/20261027130000_item_price_history.sql`: `item_price_history(value, recorded_at)` y comparación de los dos registros más recientes | `item_value_history(value, demand, reason, changed_by, created_at)` e `item_trends` con referencia de al menos siete días | No convertir `updated_at` del CSV en una serie histórica. El historial antiguo necesita una exportación independiente y aprobación del mapeo. |
| Demanda | `supabase/migrations/20261027120000_item_demand_half_stars.sql`: de 0,5 a 5, en incrementos de media estrella | `src/config/limits.ts`, esquema nuevo: enteros de 1 a 5 o `NULL` | No redondear 0,5/1,5/2,5/3,5/4,5 silenciosamente. El conversor las preserva en `legacy` y deja la propuesta nueva desconocida. |
| Límite de ítems | `src/TradeHub.tsx` y `20261031223544_add_trade_currency_and_ten_item_limit.sql`: diez ítems distintos por lado | `MAX_ITEMS_PER_SIDE=8`, validación y SQL nuevos | Ocho es un límite deliberado del producto v2 solicitado previamente, no una regla verificada del juego ni una réplica del límite diez de la referencia. |
| Monedas de trading | Misma migración y `TradeHub.tsx`: Coins y Gems, cada cantidad entre 0 y 50.000 | Calculadora/listados nuevos: solo coins; máximo de coins definido en `src/config/limits.ts` | Gems no se convierten en coins, Credits o Robux. Añadir soporte requiere decisión de producto, esquema, RPC y pruebas coordinadas. |
| Modelo de ofertas | `trade_offer_acceptances`, `trade_notifications` y `accept_trade_offer` en `20261101202117_trade_offer_notifications_and_rate_limit.sql` | `trade_offers`, `trade_offer_items`, `respond_offer`, `withdraw_offer`, cancelación y finalización | No importar directamente tablas o estados antiguos. El historial de transacciones no está migrado. |
| Chat y notificaciones | `src/TradeHub.tsx`, `src/TradeNotifications.tsx`, migraciones `20261101001539_*` y `20261101*`: mensajes privados, filtros y notificaciones | Mensajes acotados de notas/ofertas, sin chat embebido ni centro de notificaciones | Estas funciones de la referencia no forman parte de la v2. No se presenta un contador ficticio. |
| Variantes y códigos | `20261027055702_color_variants_and_promo_codes.sql`, `App.tsx`: variantes con parent UUID/color y tabla `promo_codes` | Sin modelo de variantes ni catálogo de códigos promocionales | Se conservan esos campos en el JSON de revisión, sin crear relaciones o recompensas nuevas por inferencia. |
| Imágenes | `src/catalogImages.ts`, `public/catalog/`, Storage y `itemImage()` aceptan rutas `/catalog/...` y URLs | `src/lib/utils/itemImageUrl.ts`: claves relativas con variantes de tamaño o prefijo `storage:` | Los formatos no coinciden. Cada asociación ítem↔imagen y el derecho de uso necesitan revisión; no basta renombrar una miniatura. |
| Visitas | `functions/api/visitors.ts`, `20261027061105_site_visit_counter.sql` | Sin contador público de visitantes | No se importan contadores ni se inventan métricas. |

## CSV: contrato comprobado en el código original

El exportador está en [`src/App.tsx`, función `exportCsv()`](https://github.com/sacharevet39-dotcom/turbo-soccer-values/blob/c6b2c80cef8c06b100347a598f9f3aac8f1835de/src/App.tsx#L806). Genera **`turbo-soccer-items.csv`**, con comillas dobles, escape `""` y filas CRLF. Sus doce cabeceras son:

```text
name,value,image_path,category,rarity,description,demand,variant_parent_id,variant_color_name,variant_color_hex,created_at,updated_at
```

El exportador **no incluye `items.id`**. Por ello `variant_parent_id` no puede reconstruir por sí solo la relación padre/hijo a partir de ese archivo. Tampoco incluye historial de valores, cuentas, anuncios, ofertas, notificaciones, códigos promocionales ni archivos binarios de Storage.

| Campo CSV | Tratamiento en la revisión v2 |
|---|---|
| `name` | Se conserva en `legacy`; propuesta con espacios exteriores recortados y aviso si cambió. No se inventa un nombre a partir de una imagen. |
| `value` | Vacío → `null`; `0` → cero real; solo entero no negativo seguro. Un valor importado requiere confirmar la tasación, no se vuelve oficial por aparecer en el CSV. |
| `category` | Texto original preservado. `categorySlug` queda `null`; coincidencias exactas con las categorías nuevas aparecen solo como candidatos. Por ejemplo `Car`, `Title`, `Plate` o `Border` requieren decisión explícita. |
| `rarity` | Original preservado. Una de las cinco rarezas conocidas puede aparecer como candidata; la propuesta sigue desconocida hasta revisar evidencia. |
| `description` | Texto preservado, incluidas comillas y saltos de línea, sin ejecución ni render HTML. |
| `image_path` | Se preserva sin descargarla. La imagen de la propuesta queda `null` hasta migrar y comprobar el archivo. |
| `demand` | Se valida el dominio legacy de medias estrellas. Solo los enteros compatibles se proponen; los fraccionarios quedan pendientes sin redondeo. |
| `variant_*` | Se preservan; se marca la incompatibilidad con el modelo actual. No se fabrican IDs padre ni colores. |
| `created_at`, `updated_at` | Se exigen timestamps con zona y se preservan en la fuente. No generan puntos ficticios del historial nuevo. |

El conversor [`scripts/import-legacy-csv.mjs`](../scripts/import-legacy-csv.mjs) genera un **JSON de revisión**, nunca SQL ni escrituras remotas. Rechaza cabeceras repetidas/desconocidas, CSV mal formado, fórmulas de hoja de cálculo, archivos mayores de 5 MiB, más de 10.000 filas y valores no seguros. No sobrescribe el CSV ni un JSON de revisión existente.

```bash
node scripts/import-legacy-csv.mjs turbo-soccer-items.csv work/legacy-review.json
node --test scripts/import-legacy-csv.test.mjs
```

## Alcance de lo realmente observado

Se inspeccionó una copia del código y de sus archivos estáticos. Los seeds originales contienen datos preparados y nombres provisionales; no se ejecutaron y no constituyen por sí solos verificación del contenido vigente en Roblox. Las aproximadamente setenta miniaturas iniciales descritas por el README son parte de una carpeta que contiene más archivos añadidos después: el inventario de `public/catalog/` de este commit tiene 259 archivos. Ese número no es un catálogo de 259 ítems verificados.

No se ha leído un export real de producción, ni se conocen sus valores actuales, sus cuentas o el contenido vivo de Storage. La nueva importación no modifica el repositorio de referencia, la base anterior ni el dominio `turbo-soccer-values.pages.dev`.
