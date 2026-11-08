#!/usr/bin/env bash
set -Eeuo pipefail
trap 'echo "✖ Error en línea $LINENO. No se muestran argumentos para proteger credenciales." >&2' ERR
# WHY: El código completo ya se entrega; el instalador prepara este checkout sin sobrescribirlo.
REPO_NAME="${REPO_NAME:-turbo-soccer-values-v2}"
CF_PAGES_PROJECT="${CF_PAGES_PROJECT:-turbo-soccer-values-v2}"
ISADEV_SUBDOMAIN="${ISADEV_SUBDOMAIN:-}"
GH_VISIBILITY="${GH_VISIBILITY:-private}"
SITE_URL="${SITE_URL:-https://${CF_PAGES_PROJECT}.pages.dev}"
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd -- "$SCRIPT_DIR/.."
for bin in git node npm curl; do
  command -v "$bin" >/dev/null 2>&1 || { echo "Falta $bin" >&2; exit 1; }
done
node -e 'const [major, minor] = process.versions.node.split(".").map(Number); if (major < 22 || (major === 22 && minor < 12)) { process.stderr.write("Se requiere Node >=22.12; usa Node 22 LTS para el SDK Sentry actual.\n"); process.exit(1); }'
test -f package-lock.json || { echo 'Falta package-lock.json del código entregado.' >&2; exit 1; }
if test ! -f .env.local; then cp .env.example .env.local; fi
npm ci --no-audit --no-fund
npm run typecheck
node --test
node scripts/module-inventory.mjs
node scripts/package-source.mjs
npm run build
node scripts/verify-export.mjs
if test "${CREATE_GITHUB_REPOSITORY:-0}" = 1; then
  command -v gh >/dev/null 2>&1 || { echo 'Instala GitHub CLI.' >&2; exit 1; }
  gh auth status
  git config user.name >/dev/null
  git config user.email >/dev/null
  OWNER="$(gh api user --jq .login)"
  if gh repo view "$OWNER/$REPO_NAME" >/dev/null 2>&1; then
    echo 'El repositorio de destino ya existe; se conserva sin cambios.' >&2
    exit 1
  fi
  test "$GH_VISIBILITY" = private || { echo 'Este instalador crea solo repositorios privados.' >&2; exit 1; }
  test ! -e .git || { echo 'El checkout ya tiene Git; usa el runbook para conservar su historial.' >&2; exit 1; }
  git init -b main
  git add package.json package-lock.json tsconfig.json next.config.ts postcss.config.mjs .gitignore .gitattributes .nvmrc .env.example .cursorrules README.md src public data supabase scripts docs .github
  git commit -m 'feat(core): Build Turbo Soccer Values static foundation'
  gh repo create "$OWNER/$REPO_NAME" --private --source=. --remote=origin --push --description 'Independent Turbo Soccer item catalog and trade calculator'
  gh variable set CF_PAGES_PROJECT --body "$CF_PAGES_PROJECT"
  gh variable set NEXT_PUBLIC_SITE_URL --body "$SITE_URL"
  if test -n "${NEXT_PUBLIC_SUPABASE_URL:-}" && test -n "${NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:-}"; then
    gh variable set NEXT_PUBLIC_SUPABASE_URL --body "$NEXT_PUBLIC_SUPABASE_URL"
    gh variable set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY --body "$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
  fi
  if test -n "${CLOUDFLARE_API_TOKEN:-}" && test -n "${CLOUDFLARE_ACCOUNT_ID:-}"; then
    npx wrangler@4 pages project create "$CF_PAGES_PROJECT" --production-branch=main
    printf '%s' "$CLOUDFLARE_API_TOKEN" | gh secret set CLOUDFLARE_API_TOKEN
    printf '%s' "$CLOUDFLARE_ACCOUNT_ID" | gh secret set CLOUDFLARE_ACCOUNT_ID
  fi
fi
if test -n "$ISADEV_SUBDOMAIN"; then
  echo 'El registro is-a.dev es manual: sigue docs/DELIVERY.md y valida el esquema actual.'
fi
printf '\nSIGUIENTES PASOS\n1. Crea un proyecto Supabase NUEVO; aplica las seis migraciones en orden.\n2. Configura OAuth, URL y clave publishable según docs/DELIVERY.md.\n3. Ejecuta npm run build tras cambiar variables públicas.\n4. Para Cloudflare Pages, configura Variables/Secrets y ejecuta gh workflow run deploy.yml.\n5. El sitio Sites ya creado se publica por su flujo Sites; este script no cambia su acceso.\n'
