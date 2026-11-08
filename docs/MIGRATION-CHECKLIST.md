# Checklist de migración revisable

Esta guía usa como referencia el commit `c6b2c80cef8c06b100347a598f9f3aac8f1835de` de [sacharevet39-dotcom/turbo-soccer-values](https://github.com/sacharevet39-dotcom/turbo-soccer-values). La comparación completa está en [REFERENCE-REVIEW.md](REFERENCE-REVIEW.md). Importar los archivos a `0311z/TurboSoccer` no traslada datos de Supabase ni cambia un despliegue Cloudflare.

## 1. Código y procedencia

- [ ] Conservar la URL y el commit de referencia en la revisión; no tratar `main` como una versión inmutable.
- [ ] Verificar que este repositorio contiene la aplicación Next.js nueva, sus tests, las seis migraciones nuevas, documentación, assets propios y lockfile.
- [ ] Mantener las credenciales reales y los exports de datos fuera de Git. `work/`, `.env.local`, dependencias y builds son locales.
- [ ] No copiar los secretos, `.env` reales ni las sesiones del sitio original.
- [ ] No ejecutar las migraciones antiguas ni las seis nuevas en el Supabase de producción existente.

## 2. Confirmar diferencias antes de migrar datos

- [ ] Aceptar o rediseñar explícitamente el límite v2 de ocho ítems por lado: el repositorio de referencia implementa diez; no equivale a una regla confirmada del juego.
- [ ] Resolver el alcance de Gems: la referencia ofrece Coins y Gems; v2 compara solo coins. No hay tipo de cambio autorizado.
- [ ] Decidir cómo representar demanda en medias estrellas frente al entero 1–5 nuevo; no redondear automáticamente.
- [ ] Decidir qué hacer con variantes padre/color, códigos promocionales, notificaciones, chat, login Roblox verificado y contador de visitas. V2 no tiene paridad con esas funciones.
- [ ] Mantener la autenticación anterior y sus roles separados. Un perfil `owner` nuevo se autoriza en el proyecto nuevo, no por copiar `user_metadata` o contraseñas.

## 3. Obtener un export autorizado y local

- [ ] El operador del sitio anterior exporta **Admin → Export CSV**, produciendo `turbo-soccer-items.csv`. Esta entrega no inicia sesión ni exporta producción automáticamente.
- [ ] Guardar el CSV original en un lugar privado y conservar una copia sin modificar.
- [ ] Recordar que el CSV estándar no contiene IDs. Si se necesitan relaciones de variantes, historial, listados u otras entidades, el operador debe obtener una exportación adicional con IDs de las tablas correspondientes.
- [ ] Obtener por separado los binarios del bucket `item-images` si se pretende migrarlos. Las rutas de un CSV no son una copia de los archivos.

## 4. Convertir para revisar, sin tocar ninguna base

Desde la raíz del checkout, con Node 22 LTS:

```bash
node --test scripts/import-legacy-csv.test.mjs
node scripts/import-legacy-csv.mjs turbo-soccer-items.csv work/legacy-review.json
```

- [ ] Confirmar `purpose: "offline-review-only"` y `readyForDatabaseImport: false` en el JSON.
- [ ] Revisar cada entrada marcada `reviewRequired: true`, sus `issues`, el bloque original `legacy` y los candidatos.
- [ ] Corregir datos inválidos en una copia del CSV, no en el original. El conversor falla antes de crear salida si encuentra un error.
- [ ] Elegir otro nombre de JSON para una revisión posterior: el comando se niega a sobrescribir un archivo existente.
- [ ] No ejecutar el JSON como SQL ni enviarlo directamente a una RPC: no es un formato de importación ejecutable.

## 5. Aprobar correspondencias de catálogo

- [ ] Asignar un ID nuevo y un slug único para cada ítem aprobado; registrar un mapa separado de IDs antiguos y nuevos cuando haya IDs disponibles.
- [ ] Confirmar categorías contra `src/lib/catalog/categories.ts` y las FKs de `public.categories`; no convertir `Title`, `Border` o categorías parecidas por una similitud de nombre.
- [ ] Confirmar rareza y procedencia con evidencia. Los doce ítems del snapshot nuevo siguen sin tasación; no añadir valores solo para rellenar la UI.
- [ ] Revisar y aprobar cada `value` no nulo y demanda importada. Mantener `NULL` cuando el dato no sea fiable.
- [ ] Conservar el vínculo del registro fuente en una revisión privada. No atribuir a un usuario nuevo los cambios históricos realizados por otra persona.

## 6. Migrar imágenes solo después de identificar cada archivo

- [ ] Crear un manifiesto revisado con `legacy_image_path`, nombre real del ítem, slug nuevo, ruta del archivo fuente, SHA-256, permiso de uso y clave destino.
- [ ] Confirmar el vínculo usando el registro de ítem original y una revisión visual; nunca usar el orden de una hoja de miniaturas para asignar nombres o precios.
- [ ] Descargar Storage solo mediante el acceso autorizado del operador. No reutilizar URLs con tokens ni el origen de producción como nueva configuración.
- [ ] Para assets locales aprobados, generar variantes `-128.webp`, `-256.webp` y `-512.webp` y usar una clave sin extensión, por ejemplo la estructura `items/<categoría>/<slug>`.
- [ ] Para Storage nuevo, usar `storage:<ruta-relativa>` del bucket nuevo. El resolvedor actual rechaza URLs externas, query strings y traversal.
- [ ] Revisar el caso GIF: el proyecto anterior permite GIF; el bucket nuevo admite WEBP/PNG/JPEG/AVIF. Decidir una conversión aprobada o mantener la imagen pendiente.
- [ ] No presentar el arte conceptual de portada ni los iconos de categoría como una imagen real del cosmético.

## 7. Preparar el proyecto Supabase nuevo

- [ ] Crear y configurar un proyecto diferente del usado por la referencia.
- [ ] Aplicar los seis SQL de `supabase/migrations/` en orden y revisar `docs/RLS-verification.sql` con dos cuentas de prueba.
- [ ] Configurar OAuth Discord/Google y las URLs de retorno nuevas. Email por enlace solo después de configurar y probar SMTP propio.
- [ ] Copiar únicamente la URL y la clave publishable del proyecto nuevo a las variables públicas de build.
- [ ] Crear el primer perfil mediante login y autorizar al owner mediante el procedimiento revisado en `docs/DELIVERY.md`.
- [ ] Importar únicamente las filas aprobadas mediante un proceso separado que se revise antes de ejecutarlo. Este conversor no escribe datos.
- [ ] No crear historia de precios a partir de `updated_at`: migrar puntos reales por separado o comenzar un historial nuevo explícito.

## 8. Publicar y verificar sin sustituir el sitio anterior por accidente

- [ ] Ejecutar `npm run typecheck`, `node --test`, `npm run build` y `node scripts/verify-export.mjs`.
- [ ] Para un proyecto Pages nuevo, usar salida `out` y el flujo Direct Upload documentado; no reutilizar `dist` ni las Pages Functions del Vite anterior.
- [ ] Mantener vacías las variables de despliegue hasta elegir un proyecto de destino nuevo y revisar sus permisos. Un push a GitHub no debe migrar producción por inferencia.
- [ ] Revisar catálogo, filtros, rutas de categorías, imágenes, NULL/cero, teclado, responsive y fallos de red.
- [ ] Probar lectura pública, escritura prohibida a usuarios normales, roles, cooldown, caducidad, ofertas privadas y borrado de cuenta en el proyecto nuevo.
- [ ] Verificar OAuth/email y las acciones reales con sesiones nuevas antes de anunciar el mercado como operativo.
- [ ] Completar identidad legal, contacto y permisos de imágenes antes de abrir el servicio al público.

No se ha aplicado este checklist a una base remota. Los tests del conversor y la revisión del código no equivalen a migrar producción ni a validar permisos RLS en un Supabase real.
