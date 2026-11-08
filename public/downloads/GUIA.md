# FASE 1 — WIREFRAME TEXTUAL, DECISIONES Y ESQUEMA SQL

## 1.1 Wireframe y criterios de aceptación

```text
ESCRITORIO >=1280                       MÓVIL <=390
[NAV: TSV | Values Trading Calculator]  [TSV] [Menu]
[HERO: Know the value. Trade smarter.]  [Título]
[Browse values] [Open calculator]       [Dos acciones apiladas]
[Explorar categorías / catálogo]        [Buscar] [Filtros]
[Item | Rarity | Value | Demand]        [Tarjeta de ítem]
[Wiki: imagen | origen | señales]       [Imagen]
[Valor e historial | mercado]           [Datos y mercado apilados]
[Trading board | Create listing]        [Trading board]
[Have -> Want | W/F/L]                  [Have]
[Offer / abrir anuncio]                 [Want]
[Calculator: Have | Want]               [Have]
[Resultado + Share URL]                [Want] [Resultado] [Share]
[Footer: safety / disclaimer / legal]   [Safety y enlaces apilados]
```

Navbar/Footer: `src/components/layout`; navegación semántica, foco visible, objetivos táctiles y skip link. No requieren datos remotos.
Valores: `src/components/values`; consulta `items`; búsqueda y filtros compartibles, tabla/rejilla, orden y links de detalle. Seed con estados desconocidos; carga, vacío, fallo con Retry y modo sin conexión diferenciados.
Wiki: `src/components/items` y `src/app/items/[slug]/page.tsx`; metadatos estáticos, origen documentado, datos vivos cuando se configura Supabase. Sin historial disponible se muestra ausencia, nunca una gráfica inventada.
Trading: `src/components/trading`; RPC `create_listing`, `create_offer`; tablón real solo tras conexión. Un mercado no configurado muestra indisponibilidad, no anuncios simulados.
Calculadora: `TradeCalculator`, `TradeSide`, `ItemPicker`, `FairnessMeter`; sin cuenta, monedas y cantidades validadas, compartir URL y resultado accesible. Medidor desconocido si algún valor es NULL.
Cuenta y staff: `/profile/` permite editar campos propios, confirmar edad, exportar el perfil y datos locales, borrar favoritos/borrador y solicitar borrado permanente de cuenta. `/admin/` comprueba el rol antes de editar valores mediante RPC. `/u/?name=` lee el perfil público real. `/trade/?id=` gestiona las ofertas visibles mediante RLS. No se simulan perfiles ni reputación.
Movimiento: transiciones breves y `prefers-reduced-motion`; no se afirma una auditoría AA completa sin verificación de navegador.

## 1.2 Decisiones y supuestos

D1. Next.js 16 exporta HTML estático con barra final e imágenes sin optimizador; no hay servidor Next ni Pages Functions.
D2. Supabase nuevo es opcional para la primera publicación; el snapshot permite consultar nombres reales sin inventar valores. Escrituras mediante RPC y RLS.
D3. Se entrega cron de GitHub Actions cada seis horas; aún no está habilitado en una cuenta GitHub de destino.
D4. La publicación solicitada se hace con Sites. Se entrega una ruta portable adicional a Cloudflare Pages Direct Upload; no se ha creado un proyecto Pages en la cuenta del usuario.
D5. OAuth Discord/Google usa PKCE; requiere activar proveedores y redirects en el proyecto nuevo.
ASSUMPTION-1. Ocho ítems distintos por lado es un límite del producto, no una regla verificada del juego.
ASSUMPTION-2. Edad mínima 16 es una decisión conservadora del producto; no constituye asesoramiento legal.
ASSUMPTION-3. El sitio puede arrancar sin Supabase para no fingir credenciales o escribir en producción.
ASSUMPTION-4. La semántica de categorías provisionales requiere revisión por el propietario; las rarezas no documentadas permanecen NULL.
ASSUMPTION-5. Los assets no identificados del sitio anterior no se asignan a nombres por inferencia.
ASSUMPTION-6. El instalador opera sobre el código completo ya entregado; no genera otra copia del mismo andamiaje.
ASSUMPTION-7. Geist se autoaloja en WOFF2 con su licencia OFL; el build no depende de descargar fuentes.
Unidad: coins enteros seguros no negativos; Credits y Robux no son unidades de valoración.
NULL indica desconocido y aparece como “—”, nunca como cero.
Cada ítem conserva categoría, rareza desconocida cuando corresponde, origen, demanda y tradabilidad.
Solo admin/owner cambian valor y demanda; el trigger registra historial y auditoría.
El cálculo se expresa desde quien acepta: recibe have, entrega want.
`diff = (sumHave - sumWant) / max(sumHave, sumWant, 1)`; ±10 % inclusive es fair.
Cualquier ítem sin valor produce unknown y sumas parciales identificadas.
Tendencia compara con el historial más reciente de al menos siete días; sin referencia, unknown.
Las estadísticas del mercado cuentan solo anuncios abiertos no caducados.
Límites: 8 ítems/lado; 10 anuncios/usuario; 30 s de cooldown; 25 ofertas pendientes; TTL 7 días; coins máximo 10^12.

## 1.3 Esquema SQL

Aplica los seis archivos íntegros de `supabase/migrations/` en orden lexicográfico, exclusivamente en un proyecto Supabase nuevo. No son un script de actualización del proyecto antiguo. La migración 006 añade endurecimiento de concurrencia, visibilidad para participantes y retirada de ofertas. La fuente SQL es la autoridad sobre tablas, restricciones y RPC; no se ha aplicado a una base Supabase durante esta entrega.

## 1.4 Contrato de módulos

`docs/MODULES.md` inventaría los archivos y sus exports/imports finales. El contrato consolida primitivas visuales sencillas mediante clases CSS y componentes orientados a función; no se generan wrappers vacíos para igualar una lista de nombres. El shell mantiene páginas de composición y los módulos cliente contienen la interacción.

| Archivos del manifiesto original | Resolución de esta entrega |
|---|---|
| `UserMenu` y primitivas `ui/` | Interacción integrada en Navbar; estilos reutilizables CSS sin wrappers vacíos |
| `DemandStars` y `TrendBadge` | Presentación integrada en tabla y detalle de ítem |
| Hooks y datos de anuncios/ofertas | Consulta en `TradeBoard` y `lib/trade/listings.ts`; mutaciones en `ListingComposer` y `OfferDialog` |
| `validation/schemas.ts` | Validación cerca de cada frontera y estado de trade en `lib/trade/state.ts` |
| Tres JSON de seed | Catálogo tipado consolidado en `lib/data/seed.ts`; catálogo SQL en migración de seed |
| `src/instrumentation-client.ts` | Telemetría cliente opcional, SDK diferido y privacidad explícita de Sentry 11 |

## 1.5 Verificación RLS

`docs/RLS-verification.sql` contiene consultas de lectura y denegación con resultado esperado. Deben ejecutarse en el proyecto nuevo después de las migraciones; las comprobaciones que requieren un usuario autenticado necesitan una sesión real y su UUID. No se han verificado OAuth, permisos remotos ni escritura real sin esa infraestructura.

# FASE 2 — `.cursorrules`

La raíz incluye `.cursorrules` con reglas operativas de arquitectura, tipos, datos, seguridad, SEO, accesibilidad y Git. Para usar el mismo contrato en los editores:

```bash
cp .cursorrules AGENTS.md
mkdir -p .cursor/rules
{ printf -- '---\nalwaysApply: true\n---\n'; cat .cursorrules; } > .cursor/rules/project.mdc
```

Los espejos no se crean automáticamente durante la construcción para evitar cambiar instrucciones locales a mitad de trabajo.

# FASE 3 — `setup.sh`

El archivo ejecutable se entrega en `scripts/setup.sh`. Prepara el checkout existente, copia `.env.example` solo si no existe `.env.local`, instala desde lockfile, comprueba TypeScript y pruebas nativas, regenera el inventario, empaqueta el código, construye y verifica la exportación estática. La creación de repositorio privado es optativa con `CREATE_GITHUB_REPOSITORY=1`; no se ejecutó durante esta entrega. Un checkout Sites ya versionado conserva su historia e identidad y no se convierte automáticamente en otro repositorio.

```bash
bash scripts/setup.sh
npm run dev
npm run build
npm run preview
```

En Windows usa Git Bash o WSL y guarda el archivo con LF. Node 22 LTS, versión 22.12 o posterior, es la versión recomendada y el mínimo del checkout actualizado. El script no aplica migraciones remotas ni solicita claves privadas. El modo portable exige ejecutar los comandos de configuración del runbook.

# FASE 4 — FRONTEND (core modular)

## 4.1 Shell, layout, interfaz y autenticación

Se entrega interfaz inglesa con modo oscuro, layout adaptable, navegación, footer de independencia y advertencias antiestafa. Se incluyen `/`, `/values/`, `/trading/`, `/calculator/`, `/items/[slug]/`, `/auth/callback/`, `/privacy/`, `/terms/`, `/disclaimer/`, 404, robots y sitemap. Los tres textos legales son plantillas con `[COMPLETAR]`, no documentos legales terminados. La autenticación presenta proveedores configurables y un estado explícito cuando no hay conexión; una apertura de diálogo no representa una cuenta creada. Los componentes y rutas concretos aparecen en el manifiesto de módulos.

## 4.2 Ítems y valores

El catálogo contiene doce nombres documentados y doce fichas prerenderizadas. `ItemImage` resuelve recursos locales o Storage y conserva un fallback de categoría cuando falta el archivo. El seed entrega `image = null`: los iconos de categoría no se presentan como fotografías de los ítems.

Las trece categorías tienen rutas estáticas propias y metadatos. Los filtros de búsqueda, categoría, rareza, estado de valoración, favoritos, vista y orden son compartibles. El catálogo permite exportar los resultados a CSV y mantiene navegación de teclado. Las fichas incluyen señales del mercado, histórico disponible y enlaces a ítems relacionados. El catálogo contiene solo nombres documentados. Los precios, la demanda y la tradabilidad no se completan por imaginación. Las fichas prerenderizadas permiten navegación y SEO sin depender de una SPA; el cliente puede hidratar el snapshot al conectar un proyecto nuevo. Los assets visuales propios no certifican su equivalencia a cosméticos reales del juego.

## 4.3 Trading

La calculadora funciona sin registro, admite cantidades/coins, intercambia lados y comparte el estado por URL validada. El tablero no fabrica anuncios ni métricas. Los controles de creación/oferta dependen de sesión, onboarding y RPC; la seguridad real se aplica en SQL, no en el botón. La gestión de cada anuncio ofrece las acciones autorizadas para propietario y ofertante mediante RLS. La calculadora añade deshacer, cantidades accesibles, validación del texto de coins, borrador versionado y migración del formato local anterior.

# FASE 5 — LÓGICA SUPABASE Y ESTADO

## 5.1 Entorno, trazas, tipos y cálculo

Las variables públicas se leen mediante acceso estático; la pareja URL/clave debe estar completa y tener formato permitido. Los logs usan `trace`, redactan material sensible y entregan mensajes seguros al usuario. La calculadora mantiene unknown ante ítems sin valor y rechaza estados corruptos o importes no seguros.

## 5.2 Clientes, autenticación y datos

El cliente de navegador usa PKCE y persistencia de sesión; el cliente de build no persiste sesión. La base de datos nueva implementa RLS y RPC; no se conoce ni se necesita una clave privada para el cliente. El SDK se importa de forma diferida, después de comprobar la configuración. La validación de filas externas también se separa en módulos de carga diferida; el catálogo sin conexión no necesita descargar esas dependencias al inicio. El callback maneja errores del proveedor y espera la sesión del SDK. El formulario de email está detrás del flag y usa enlaces de acceso PKCE; requiere SMTP propio. Las actualizaciones de usuario y mercado requieren configurar el servicio antes de su validación real.

## 5.3 Queries, borrador y seed

TanStack Query mantiene los datos de consulta. El seed versionado contiene solo ítems documentados y valores NULL. El estado compartido de calculadora se valida antes de usarlo. Sentry se integra bajo demanda solo si hay DSN, con filtros de datos personales; no se ha probado envío remoto. Web Analytics y Turnstile permanecen pendientes y desactivados.

# CIERRE — MANIFIESTO Y RUNBOOK

## Manifiesto de alcance

| Ruta o función | Fase | Estado |
|---|---:|---|
| `supabase/migrations/` | 1 | ✔ Archivos entregados; aplicación y pruebas remotas pendientes |
| `docs/RLS-verification.sql` | 1 | ✔ Consultas entregadas; ejecución remota pendiente |
| `docs/MODULES.md` | 1 | ✔ Inventario del código fuente entregado |
| `.cursorrules` | 2 | ✔ Reglas entregadas; espejos de editor optativos |
| `scripts/setup.sh`, `scripts/preview.mjs` | 3 | ✔ Scripts entregados; shell y JavaScript revisados sintácticamente |
| `.github/workflows/deploy.yml`, `keepalive.yml` | 3 | ✔ CI entregado; requiere configuración GitHub/Cloudflare |
| `.env.example`, `public/_headers` | 3 | ✔ Plantillas; headers se aplican al desplegar en Pages |
| Shell, catálogo, doce fichas, calculadora y tablero | 4 | ✔ Código completo en el inventario; límites de integración declarados |
| `/privacy/`, `/terms/`, `/disclaimer/` | 4 | ✔ Rutas entregadas; textos legales pendientes de completar y revisar por el responsable |
| 404, error global, robots y sitemap | 4 | ✔ Entregados; sitemap solo enlaza rutas publicadas |
| Clientes, env, trazas, tipos, queries y seed | 5 | ✔ Código completo en el inventario |
| Proyecto Supabase nuevo, OAuth y datos vivos | 5 | ✖ PENDIENTE: crear/configurar servicio; aplicar SQL y comprobar RLS/RPC con sesiones reales |
| `/profile/`, `/u/`, `/trade/` | P1 | ✔ Perfil propio/público, controles de datos y gestión de ofertas; integración remota pendiente |
| `/admin/` | P1 | ✔ Editor de valor/demanda con confirmación, razón y autorización real por RPC |
| Reseñas, reportes y moderación operativa | P1 | ✖ PENDIENTE: requiere políticas y workflow operativo; no se inventa reputación |
| Importación CSV y migración de imágenes | P1 | ✖ PENDIENTE: mapear datos reales y derechos sin inferencias; exportación CSV ya entregada |
| Email por enlace de acceso | P0 | ✔ Formulario y mutación entregados detrás del flag; SMTP propio y pruebas de entrega remota pendientes |
| Sentry / `src/instrumentation-client.ts` | P0 | ✔ Entregado: SDK diferido y redacción; DSN vacío, sin prueba de envío remoto |
| Borrador versionado/migración de estado local | P0 | ✔ Persistencia validada, versión explícita, migración del borrador previo y deshacer |
| Analítica, captcha y realtime | P1 | ✖ PENDIENTE: integración completa y verificación antes de habilitar variables |
| Dominio is-a.dev | P1 | ✖ PENDIENTE: elegir subdominio, revisar esquema vigente y registrar dominio |
| Auditoría Lighthouse, navegador y métricas de campo | QA | ✖ PENDIENTE: infraestructura de navegador no disponible en esta sesión |

## Runbook

1. Descarga el código completo, conserva los LF y ejecuta `bash scripts/setup.sh`; no apliques SQL en el proyecto anterior.
2. En Supabase crea **New project** con nombre diferente; guarda la contraseña de base de datos en tu gestor, no en Git.
3. En SQL Editor pega y ejecuta los seis archivos de `supabase/migrations/` en orden; después abre `docs/RLS-verification.sql` y valida sus resultados esperados.
4. En Project Settings → API copia **Project URL** y **Publishable key**; completa `.env.local`. No cambies el formato a una clave de otro tipo.
5. En Authentication → Providers activa Discord. En el portal Discord, OAuth2 → Redirects añade la URL de callback que muestra Supabase, terminada en `/auth/v1/callback`; copia ID y secreto de Discord solo al panel Supabase.
6. Configura Google de la misma forma si lo vas a ofrecer; cada proveedor necesita su registro real y redirect autorizado.
7. En Authentication → URL Configuration establece Site URL al origen exacto del sitio publicado; añade Redirect URLs para `http://localhost:3000/**` y el origen publicado seguido de `/**`.
8. Si además publicas en Pages o is-a.dev, añade sus orígenes exactos con `/**`; conserva `/auth/callback/` en el redirect de la aplicación.
9. Para email configura SMTP propio en Authentication → Email → SMTP; habilita `NEXT_PUBLIC_AUTH_EMAIL_ENABLED=true`, reconstruye y verifica el enlace de acceso. Sin SMTP propio, mantén el flag desactivado y usa OAuth.
10. Reconstruye con `npm run build` después de cambiar cualquier variable `NEXT_PUBLIC_*`; los valores públicos se incrustan al compilar.
11. Inicia sesión para generar el perfil; obtén tu UUID en Authentication → Users. En SQL Editor, como postgres, actualiza únicamente tu fila con `update public.profiles set role = 'owner' where id = 'TU_UUID_VALIDADO';` sustituyendo el literal antes de ejecutar.
12. Confirma nombre Roblox y edad en onboarding; verifica que un usuario sin ambos pasos no puede crear un anuncio por RPC.
13. Tras asignarte owner, abre `/admin/`, selecciona un ítem, introduce un valor o marca desconocido, establece demanda y una razón verificable y confirma. También puedes localizar el UUID mediante `select id, name, value from public.items order by name;` y llama `set_item_value` desde una sesión admin/owner. Conserva NULL cuando no haya evidencia.
14. Para carga masiva, realiza una transacción revisada como postgres: `update public.items as i set value = v.value from (values ('UUID_REAL'::uuid, VALOR_REAL::bigint)) as v(id,value) where i.id = v.id;` Reemplaza ambos identificadores con datos verificados antes de ejecutar; el trigger registra el historial.
15. Comprueba lecturas públicas, denegación de cambios de rol, lectura privada de ofertas, bloqueo de URL/pagos, cooldown y límites con dos cuentas de prueba.
16. Para Cloudflare Pages crea un API token con Account → Cloudflare Pages → Edit limitado a la cuenta elegida; copia Account ID del panel Cloudflare.
17. En un repositorio GitHub privado configura Secrets `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID`; configura Variables `CF_PAGES_PROJECT`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
18. Crea el proyecto de Direct Upload con `npx wrangler@4 pages project create "$CF_PAGES_PROJECT" --production-branch=main`; no actives integración Git en el panel Pages.
19. Ejecuta `gh workflow run deploy.yml` y revisa el resultado con `gh run list --workflow deploy.yml`; no consideres un job omitido un despliegue válido.
20. Ejecuta `gh workflow run keepalive.yml` y comprueba la respuesta del RPC. El cron diario reduce inactividad pero no garantiza evitar pausas; revisa el estado y los avisos de Supabase.
21. GitHub puede suspender workflows programados por inactividad y los crons pueden retrasarse; revisa la pestaña Actions antes de ausentarte.
22. Para is-a.dev, consulta https://docs.is-a.dev/guides/cloudflare-pages/ y el esquema actual de https://github.com/is-a-dev/register; comprueba disponibilidad antes de crear un PR.
23. Añade el dominio con POST a `/accounts/{account_id}/pages/projects/{project}/domains` usando `{"name":"subdominio-elegido.is-a.dev"}`; los IDs y el dominio deben ser los reales de tu cuenta.
24. El registro utiliza `domains/<subdominio>.json` con `owner.username` real y `records.CNAME` hacia el proyecto real de Pages; no delegues NS. Revisa y envía el PR solo después de validar el esquema vigente.
25. Actualiza URL Configuration y `NEXT_PUBLIC_SITE_URL`, y reconstruye tras activar el dominio.
26. Sentry es opcional: configura NEXT_PUBLIC_SENTRY_DSN solo tras revisar privacidad, reconstruye y verifica un error de prueba. La versión 11 usa dataCollection con todos los campos personales desactivados y beforeSend restrictivo; no utiliza el antiguo sendDefaultPii. Mantén Web Analytics y Turnstile vacíos.
27. Para desarrollo usa `npm run dev`; para verificar HTML estático usa `npm run build && npm run preview` y abre localhost:3000.
28. Para mantener el descargable actualizado ejecuta `node scripts/module-inventory.mjs`, `node scripts/package-source.mjs`, `npm run build` y `node scripts/verify-export.mjs`; el ZIP incluye SOURCE-MANIFEST.json y su checksum externo. Migra imágenes del repositorio previo solo después de identificar cada archivo y comprobar derechos; copia los binarios al catálogo nuevo y actualiza image_path sin deducir nombres.
29. Completa identidad del responsable, contacto, retirada de imágenes y textos legales `[COMPLETAR]` antes de abrir el servicio a otras personas.
30. Verifica navegación móvil/teclado, errores de red, devolución OAuth/email, compartir calculadora, NULL, permisos SQL, caducidad, acciones de ofertas, borrado de cuenta, CSP y ausencia de secretos antes de operar el mercado. Consulta `docs/SECURITY.md` para las fronteras de autorización.

## Checkpoints de mantenimiento

Estos comandos son una receta para un checkout propio; no afirman commits previos con estos nombres. Conserva la identidad Sites y no reemplaces un remote ya configurado.

```bash
npm run typecheck
node --test
node scripts/module-inventory.mjs
node scripts/package-source.mjs
npm run build
node scripts/verify-export.mjs
git add src data supabase scripts docs public .github .cursorrules .env.example README.md package.json package-lock.json next.config.ts tsconfig.json postcss.config.mjs .gitignore .gitattributes .nvmrc
git commit -m "feat(core): Complete Turbo Soccer Values foundation"
git push origin main
```

Solo después de validar el resultado y confirmar que no existe esa etiqueta: `git tag v0.1.0` y `git push origin v0.1.0`.
Rollback destructivo, únicamente por decisión consciente del propietario: `git reset --hard HEAD~1` descarta cambios locales del último checkpoint. No lo ejecutes como paso habitual del runbook.

## Rendimiento y verificación

Comprobaciones locales de la base anterior: build estático y siete casos del cálculo aprobados. En esta revisión, `node --test` pasa 43/43 casos de límites de datos/entorno, filtros/CSV, perfil/appraisals, cálculo/estado de trades y verificador de exportación. Las seis migraciones y dieciocho definiciones de cuerpos PL/pgSQL pasan pglast; scripts Bash/Node y YAML pasan revisión sintáctica. El resultado definitivo del build, el número total de pruebas y los bytes del bundle se registran en `docs/RELEASE-V2.md`. El parser no ejecuta funciones ni demuestra RLS, autorización o compatibilidad con una instancia Supabase real.

Objetivos solicitados, sin medición de navegador: LCP ≤2,0 s en 4G, CLS ≤0,05, INP ≤200 ms; JavaScript inicial de `/values/` ≤170 KB gzip; imágenes de ítems WebP ≤40 KB a 256 px; Lighthouse móvil ≥95 en Performance/Accessibility/Best Practices y 100 en SEO. Un build correcto no prueba estos presupuestos. El verificador informa por separado de scripts externos modernos, estimación gzip de los scripts inline y polyfills exclusivos de navegadores antiguos. El presupuesto se contrasta de forma conservadora con moderno + inline; no es una medición de transferencia real ni Lighthouse. Consulta el resultado de la revisión en `docs/RELEASE-V2.md`.

El entorno no dispone del helper de navegador `cua_repl.js`; siguiendo el flujo de Sites no se improvisa otro navegador para afirmar una QA inexistente. La publicación y los checks locales se reportan por separado en el cierre de la conversación.

## Fuera de alcance de este one-shot

No se migra el proyecto Supabase anterior ni se verifican valores del juego. No se crean cuentas OAuth, secretos de proveedores, SMTP, dominio externo ni permisos Cloudflare sin configuración real. No hay valoración oficial, pagos reales, chat, verificación automática de identidad Roblox, reseñas ni moderación operativa. Los contadores de anuncios completados son declarados por su propietario; no demuestran una transferencia en Roblox. Los textos legales son plantillas pendientes de revisión del responsable. El objetivo de coste cero depende de mantenerse dentro de cuotas y de las condiciones de los proveedores.

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:ac4da51531e9e68050ea3b8f9db36cb0e825a38584e959ca06b88eeae04f4566 -->

AUTOAUDITORÍA DOCUMENTAL: ✔ alcance, módulos y pendientes declarados; validaciones reproducibles entregadas; aplicación Supabase remota, OAuth/email, navegador y métricas de campo pendientes de configuración y verificación.

## Comparador de ítems (noviembre 2026)

`/compare/` compara hasta cuatro ítems por slug en `?items=ice-sun,rally`. Se validan contra el catálogo; duplicados, desconocidos y excesos se descartan con aviso. Compartir conserva la selección y usa el catálogo disponible al abrir el enlace; no congela precios. Si falla el portapapeles, se ofrece un campo seleccionable.

Con dos ítems, el acceso a la calculadora recibe el primero y da el segundo. Se oculta si alguno figura como no intercambiable. Disponibilidad desconocida permanece desconocida. Se conservan los límites y validaciones existentes de la calculadora.

El catálogo muestra cobertura de valor, demanda y disponibilidad. Cero es conocido y `false` es disponibilidad registrada. Accesos desde navegación, pie, catálogo y fichas.

Ejecutar los controles del README y comprobar en Chromium enlaces, límite, atrás/adelante, transferencia a calculadora y desbordamiento móvil. Comparación de referencias y criterios: [IMPROVEMENTS.md](IMPROVEMENTS.md).

<!-- /coderabbit-ai-generated:v1 -->
