# Revisión v2 · Turbo Soccer Values

Esta revisión mantiene el sitio y su audiencia privada en Sites. Conserva Next.js como exportación estática y el proyecto Supabase nuevo como única conexión de datos permitida.

## Cambios entregados

| Área | Mejora |
|---|---|
| Identidad y navegación | Jerarquía visual y tipografía más legibles, navegación móvil, tema y accesibilidad revisados |
| Catálogo | Trece categorías indexables; filtros de URL validados; selección de rareza, valoración y favoritos; orden y CSV |
| Wiki | Origen documentado, histórico disponible, señales del mercado y enlaces a ítems relacionados |
| Calculadora | Texto de coins estricto, cantidades, deshacer, estado compartible, borrador versionado y migración local |
| Mercado | Medidor de fairness por anuncio y gestión de acciones de ofertas mediante RPC y RLS |
| Cuenta | Perfil propio/público, edad, exportación limitada de datos, limpieza local y borrado confirmado |
| Staff | Appraisals con valor/demanda NULL explícitos, razón y confirmación antes de mutar |
| Autenticación | SDK diferido, callbacks con errores seguros y email opcional por enlace con SMTP propio |
| Seguridad SQL | Acceso de participantes tras cierre, bloqueo consistente, retirada de ofertas y reset de verificación Roblox |
| Mantenimiento | ZIP portable de fuente, manifiesto SHA-256, checksum, inventario y verificador estático automatizados |

Solo se conservan los doce nombres documentados. No se añaden valores, rarezas no documentadas, demanda, anuncios, perfiles, reputación ni gráficas inventados. El icono de una categoría no se presenta como arte exacto del ítem. El contador de anuncios marcados completos es una declaración del propietario, no una verificación de Roblox.

## Verificación disponible

- Las seis migraciones y dieciocho definiciones de cuerpos PL/pgSQL pasan el parser pglast. Se han revisado las consultas RLS entregadas. No se ha ejecutado SQL remoto.
- El empaquetador Node genera un ZIP válido comprobado con zipfile, con CRC y manifiesto de hashes. No requiere bibliotecas de archivo adicionales.
- Las cinco pruebas del verificador estático cubren salida válida, enlaces/recursos ausentes, IDs duplicados, H1, noindex privado y JSON-LD inválido.
- El conjunto completo `node --test` pasa 43/43 casos: cinco del verificador de exportación, nueve de filtros/CSV/favoritos, cuatro de perfil/appraisals, siete de datos/entorno, seis de redacción de datos y doce de cálculo/estado de trades. TypeScript y la compilación final pasan: 42 entradas generadas y 41 archivos HTML verificados, sin errores ni avisos del verificador.
- `node scripts/verify-export.mjs` comprueba la exportación real; un error detiene CI. La suma de JavaScript se informa por separado para navegadores modernos, scripts inline y polyfills legacy.

El verificador detectó en la base anterior la ausencia de H1 en `/values/` y la duplicación de IDs en diálogos de autenticación. Los componentes se han corregido en esta revisión; el build final permite comprobar el HTML resultante.

## Comprobaciones de rendimiento

El objetivo es 170 KiB gzip para JavaScript moderno inicial de `/values/`, contando de forma conservadora los scripts inline. La base anterior sumaba 252.580 bytes de scripts externos modernos y una estimación de 3.345 bytes inline; los 39.627 bytes legacy se descargan solo en navegadores que los requieren. Estos tamaños proceden del mismo verificador local; no son una sesión de red ni una auditoría Lighthouse.

La revisión separa el SDK y las validaciones pesadas en imports diferidos. Resultado de la exportación nueva: 169.247 bytes gzip de scripts externos modernos + 4.377 bytes estimados de scripts inline = 173.624 bytes (169,6 KiB). El umbral operativo del verificador es 170 KiB (174.080 bytes), que se cumple por 456 bytes. La reducción frente a los 255.925 bytes modernos+inline de la base es aproximadamente 32%. Los polyfills legacy suman 39.627 bytes adicionales solo en navegadores antiguos. No se afirma cumplir un límite más estricto de 170.000 bytes ni presupuestos reales de red. LCP, CLS, INP, puntuaciones Lighthouse, consumo real de red y auditoría visual completa siguen sin medirse porque no está disponible el helper de navegador `cua_repl.js` requerido por el flujo Sites de este entorno.

## Pendientes de servicio

Crear el proyecto Supabase nuevo, aplicar las seis migraciones en orden, activar proveedores y redirects OAuth, configurar SMTP si se habilita email y probar permisos reales con dos usuarios. La cuenta de producción anterior permanece sin cambios.

Sentry cliente está integrado bajo demanda, pero permanece desactivado sin DSN y no se ha comprobado envío remoto. El SDK 11 sustituye sendDefaultPii por dataCollection; se desactiva cada categoría de datos personales y beforeSend elimina contexto, solicitudes, usuario y campos extra. Las pruebas verifican redacción, URLs, acceso a propiedades y estructuras cíclicas. Analítica, captcha, realtime, reseñas/reportes, importación legacy y dominio is-a.dev siguen pendientes. Las plantillas legales requieren identidad del responsable, contacto y revisión antes de abrir el servicio a otras personas.

La guía operativa y sus comandos se encuentran en [DELIVERY.md](DELIVERY.md). El modelo de autorización y sus límites se documenta en [SECURITY.md](SECURITY.md).

## Correcciones de integración

La restauración inicial bloquea temporalmente la edición para no sobrescribir borradores. Los diálogos de ofertas usan IDs únicos. Borrar datos locales elimina también el borrador y su estado de deshacer en memoria; los favoritos se sincronizan entre pestañas. El tema se conserva sin destello y tiene acceso en el menú móvil. Geist se sirve localmente con licencia OFL. La guía /guide/ explica fuentes, desconocidos, fórmula y seguridad. Node 22.12+ es el mínimo del checkout actualizado; Node 22 LTS está fijado en CI y .nvmrc.
