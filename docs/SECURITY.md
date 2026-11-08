# Modelo de seguridad y verificación

La autorización vive en PostgreSQL. El cliente estático no contiene un servidor de confianza y sus guards solo organizan la interfaz. Una clave publishable identifica la aplicación: no sustituye las políticas RLS ni el JWT de la sesión.

## Fronteras de datos

| Datos | Lectura | Escritura |
|---|---|---|
| Categorías, rarezas, ítems e historial de valores | Pública | Sin escritura directa desde clientes; `set_item_value` exige admin/owner |
| Perfil público | Pública, sin email | El propietario solo puede actualizar username, roblox_username y bio |
| Edad y restricciones de acceso | Propietario y staff | RPC de edad; administración privilegiada de la base |
| Anuncios abiertos no caducados | Pública | RPC con autenticación, onboarding y límites |
| Anuncios cerrados | Propietario, ofertantes participantes y staff | RPC autorizadas para cada transición |
| Ofertas y sus ítems | Ofertante, propietario del anuncio y staff | RPC; no INSERT/UPDATE/DELETE directos |
| Auditoría | Staff | Trigger atómico de cambios de valor/demanda |
| Imágenes públicas | Pública | Staff en el bucket item-images; tamaño y MIME restringidos |

Todas las once tablas de aplicación tienen RLS habilitada. Los privilegios se revocan explícitamente antes de conceder lo necesario. Los campos role, reputation, trades_completed y verificación Roblox no tienen UPDATE de cliente. Cambiar el nombre Roblox elimina cualquier verificación anterior; la aplicación no verifica cuentas de Roblox automáticamente.

## Límites y concurrencia

Las RPC exigen sesión, perfil con nombre Roblox, confirmación de edad y ausencia de un bloqueo activo. Se validan coins enteros, cantidades, límites de ítems y texto; se bloquean enlaces, términos de pagos reales y compraventa de cuentas.

- La serialización transaccional por usuario protege el límite y cooldown al crear anuncios.
- Las operaciones sobre anuncios bloquean el anuncio antes de modificar sus ofertas.
- Un índice único permite solo una oferta pendiente por usuario y anuncio, y una oferta aceptada por anuncio.
- La aceptación cambia el anuncio a pending y rechaza las restantes ofertas pendientes en la misma transacción.
- Completar un anuncio exige estado pending y oferta aceptada. Los contadores de ambos perfiles se bloquean en orden UUID para evitar inversión de bloqueos.
- La retirada solo permite actuar al ofertante sobre su propia oferta pendiente.
- La visibilidad de anuncios cerrados usa un helper limitado al usuario actual y evita recursión entre políticas de anuncios y ofertas.

Marcar un anuncio como completado es una declaración del propietario. El contador no demuestra que Roblox haya transferido los ítems; no se presenta como verificación del intercambio.

## Cliente y exportación

Los enlaces de calculadora y filtros pasan por validación antes de usarse. Los valores NULL no se convierten en cero y los importes se validan como enteros seguros. Las rutas de imágenes rechazan URLs arbitrarias, escapes y traversal. El CSV neutraliza prefijos interpretables como fórmulas por hojas de cálculo.

La sesión OAuth usa PKCE. El email opcional usa un enlace de acceso y requiere SMTP propio configurado por el operador. Las rutas de cuenta, staff y consultas privadas llevan noindex. Cerrar sesión invalida la sesión local mediante el SDK; el borrado de cuenta elimina auth.users y las filas que dependen de ese usuario por cascada. Historial/auditoría de appraisals conservan el registro con actor NULL cuando corresponde.

El ZIP descargable se genera con una lista de directorios fuente. Excluye .git, node_modules, .next, out, work, assets-src, archivos locales de entorno y claves privadas. Incluye un manifiesto SHA-256 de sus archivos y un checksum externo. No publiques credenciales introduciéndolas dentro de archivos de código.

## Qué se ha comprobado

La revisión estática detectó y corrigió pérdida de acceso RLS para ofertantes en anuncios cerrados, inversión de bloqueos entre perfiles y anuncios, y verificación obsoleta al cambiar nombre Roblox. Las seis migraciones y dieciocho definiciones de cuerpos PL/pgSQL pasan el parser PostgreSQL pglast. Las definiciones incluyen overrides de funciones en la migración de endurecimiento.

`node scripts/verify-export.mjs` comprueba HTML y referencias locales, landmarks, títulos, IDs únicos, noindex de rutas privadas, imágenes y JSON-LD. Este análisis no ejecuta JavaScript en un navegador ni demuestra accesibilidad completa.

## Verificación que requiere el proyecto nuevo

El parser no prueba autorización efectiva ni comportamiento concurrente. Antes de operar el mercado, aplica las seis migraciones en orden y ejecuta `docs/RLS-verification.sql` en el proyecto Supabase nuevo. Usa dos cuentas de prueba para comprobar acceso cruzado, restricciones de roles, onboarding, cooldown concurrente, aceptación/retirada/cancelación, lectura tras cierre, borrado y callbacks OAuth/email.

No se ha aplicado SQL al proyecto de producción anterior ni a un servicio remoto durante esta entrega. El responsable debe completar las plantillas legales y revisar políticas de retención y moderación antes de admitir usuarios reales.
