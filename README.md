# TurboSoccer · Turbo Soccer Values

Catálogo independiente, wiki y herramientas de trading para Turbo Soccer. Next.js 16, React 19, TypeScript estricto y Tailwind CSS 4; HTML estático exportado en `out/`.

```bash
bash scripts/setup.sh
npm run dev
```

Usa Node 22 LTS (22.12 o posterior). En Windows usa Git Bash/WSL y saltos LF. `npm run build && npm run preview` sirve la exportación con Node, sin paquetes adicionales.

## Incluido

- Doce ítems documentados y trece categorías con rutas indexables, filtros compartibles, favoritos locales y exportación CSV.
- Fichas con histórico y señales del mercado; los valores/demanda desconocidos permanecen desconocidos.
- Calculadora compartible, cantidades y coins validados, borrador versionado y deshacer.
- Mercado con anuncios/ofertas reales por RPC; gestión de acciones autorizadas en `/trade/?id=`.
- Cuenta con edición de perfil, exportación limitada de datos, limpieza local y borrado permanente confirmado.
- Editor de appraisals para admin/owner con razón, confirmación e historial atómico.
- OAuth Discord/Google y email por enlace opcional; importación diferida del SDK y validación de filas.
- Búsqueda global, tema persistente, tipografía Geist local, guía de valores y ejemplo interactivo de fairness.
- Telemetría Sentry opcional con SDK diferido y filtros de privacidad; desactivada sin DSN.
- Seis migraciones SQL con RLS, límites, auditoría y endurecimiento de concurrencia.

Sin Supabase configurado, el catálogo y la calculadora funcionan con el snapshot. Las cuentas y el mercado explican que falta la conexión: no se presentan anuncios o perfiles ficticios. No se ha tocado el proyecto Supabase anterior.

## Comprobar y empaquetar

```bash
npm run typecheck
node --test
node scripts/module-inventory.mjs
node scripts/package-source.mjs
npm run build
node scripts/verify-export.mjs
```

El ZIP fuente se crea en `public/downloads/turbo-soccer-values-source.zip`, junto a su checksum SHA-256 y `GUIA.md`. Incluye un manifiesto de integridad; excluye dependencias, compilación, Git y archivos locales de entorno. El enlace del sitio publicado es `/downloads/turbo-soccer-values-source.zip`.

[Entrega y runbook](docs/DELIVERY.md) · [Revisión v2](docs/RELEASE-V2.md) · [Contratos de módulos](docs/MODULES.md) · [Modelo de seguridad](docs/SECURITY.md) · [Comprobaciones RLS](docs/RLS-verification.sql).

La publicación solicitada usa Sites. El workflow adicional de Pages usa Direct Upload cuando se configuran Variables y Secrets de GitHub/Cloudflare; conserva la audiencia del sitio Sites. Las credenciales públicas se incrustan durante el build: reconstruye al cambiarlas.

Las pruebas locales y el parseo SQL no demuestran la integración remota. El responsable debe crear/configurar el proyecto Supabase nuevo, aplicar las seis migraciones, completar textos legales y verificar RLS/RPC y OAuth/email con sesiones reales. El reporte v2 distingue los checks ejecutados de las verificaciones pendientes.

Independent fan project. Not affiliated with, endorsed by, or sponsored by Roblox Corporation or the developers of Turbo Soccer. Values are community estimates, not official prices.

## Referencia principal e importación

Este repositorio privado `0311z/TurboSoccer` contiene la versión 2 completa creada para el sitio. La referencia principal es [sacharevet39-dotcom/turbo-soccer-values](https://github.com/sacharevet39-dotcom/turbo-soccer-values), revisada en el commit `c6b2c80cef8c06b100347a598f9f3aac8f1835de`. La arquitectura y las diferencias reales se documentan en [REFERENCE-REVIEW.md](docs/REFERENCE-REVIEW.md) y la migración en [MIGRATION-CHECKLIST.md](docs/MIGRATION-CHECKLIST.md).

El proyecto original y su Supabase de producción no se han modificado. Esta versión usa un proyecto Supabase nuevo; no pegues estas migraciones en la base anterior. Importar código a GitHub no transfiere filas de producción ni configura OAuth o secretos. La identidad `.openai/hosting.json` enlaza con el sitio privado existente, sin cambiar su audiencia.

## Skills solicitadas

La colección de [composio-community/awesome-codex-skills](https://github.com/composio-community/awesome-codex-skills) queda fijada por commit y manifiesto en `skills.lock.json`. Consulta [SKILLS.md](docs/SKILLS.md) para instalarla en este proyecto. Los directorios instalados se ignoran en Git, igual que las dependencias; se entregan el instalador y el lock reproducible. Reinicia Codex después de instalarlas para cargar sus metadatos. Instalar skills no conecta servicios ni ejecuta sus automatizaciones.

## Validación en GitHub

`validate.yml` comprueba instalación limpia, tipos, tests, exportación estática y enlaces con el snapshot sin credenciales. Los workflows de despliegue y keepalive permanecen condicionados a configuración explícita; no apuntan a la base de producción anterior.

Instalación de las skills en un clon nuevo:

```bash
python3 scripts/install-codex-skills.py
python3 scripts/install-codex-skills.py --check
```

En Windows con Python instalado como `python`, usa `python` en lugar de `python3`. La conversión del CSV anterior es local y necesita revisión humana: consulta el checklist antes de ejecutar `node scripts/import-legacy-csv.mjs`.
