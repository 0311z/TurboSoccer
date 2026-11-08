<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:6a5a243b89633311f8bb69f278f85e124d50cf0fa2ce61198901511a1eae97eb -->

# Mejoras de Turbo Soccer Values

## Referencias consultadas

Inspección en Chromium el 8 de noviembre de 2026, sin iniciar sesión ni interactuar con cuentas o bases remotas. Son observaciones de la interfaz visible, no una auditoría completa de los competidores.

| Referencia | Observación directa | Aplicación en este proyecto |
|---|---|---|
| [Turbo Soccer Values](https://turbo-soccer-values.pages.dev/) | Navegación para valores, calculadora, trades, chat, notificaciones y códigos; filtros por categoría y rareza. | Comparación de propiedades de cuatro ítems desde catálogo y fichas. No afirmar paridad con chat, códigos o autenticación Roblox. |
| [Rolimon’s](https://www.rolimons.com/) | Catálogo y estadísticas de Roblox, datos de precios y guías de trading. Referencia para otra economía. | Mostrar qué datos están documentados y preservar los desconocidos. No reutilizar precios ni datos de otra economía. |

El buscador web devolvió errores; Google presentó un CAPTCHA. Se consultaron directamente ambas páginas en Chromium. No se puede demostrar liderazgo del mercado ni que otras plataformas carezcan de comparación.

## Cambios

- Comparador público de cuatro ítems: valor, demanda, rareza, categoría, origen, descripción y disponibilidad.
- Selección en URL, atrás/adelante, búsqueda, eliminación y compartir con alternativa al portapapeles.
- Enlace uno a uno a la calculadora: recibir el primer ítem, dar el segundo.
- Cobertura visible de datos, distinguiendo cero, desconocido y disponibilidad negativa.
- Navegación integrada y controles del catálogo modificados de al menos 44 px.

## Criterios de aceptación

- [x] Añadir/eliminar sin duplicados, límite de cuatro.
- [x] Compartir restaura orden; atrás/adelante restaura selecciones.
- [x] Enlaces con desconocidos, duplicados, exceso o longitud inválida se recuperan con aviso.
- [x] Desconocido no se convierte en cero; cobertura incluye cero real.
- [x] Dos ítems abren calculadora con cantidades uno y coins cero, en la perspectiva existente.
- [x] Ocultar ese acceso si un ítem está documentado como no intercambiable.
- [x] Tabla desplazable dentro de su región en móvil, sin desbordamiento del documento.
- [x] Etiquetas, tabla semántica, región enfocada por teclado y estados anunciados.
- [x] Tipos, pruebas y exportación estática pasan los controles del repositorio.

## Límites conservados

El snapshot contiene doce ítems y no incluye valoraciones verificadas. Un enlace compartido no es un histórico de precios. Cuentas, mercado, RPC, RLS y OAuth requieren el proyecto Supabase nuevo y su verificación independiente, según SECURITY.md. No se modifican esquemas, reglas de trading ni la producción anterior.


<!-- /coderabbit-ai-generated:v1 -->