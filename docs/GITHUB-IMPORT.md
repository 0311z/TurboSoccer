# Importación a GitHub

Destino: https://github.com/0311z/TurboSoccer, privado y vacío antes de esta importación. Se inicializa main con README y se incorpora el proyecto completo mediante un commit de árbol Git con comprobación del SHA esperado. No se modifica ningún repositorio de sacharevet39-dotcom.

Origen del sitio: versión 2 de Turbo Soccer Values, commit `c909b235bc50e8205965f493235756c0c69a9a02`. Sitio publicado: https://turbo-soccer-values-hub.civilmarmot8.chatgpt.site. El GitHub importado es una copia fuente; publicar futuros cambios de GitHub requiere configurar su pipeline o sincronizar con Sites. Esta importación no despliega cambios del sitio ni cambia su audiencia.

Referencia principal: https://github.com/sacharevet39-dotcom/turbo-soccer-values, commit `c6b2c80cef8c06b100347a598f9f3aac8f1835de`. Consulta REFERENCE-REVIEW.md para las diferencias comprobadas. No se afirma equivalencia funcional: el repositorio anterior tiene capacidades y un esquema distintos.

Skills: colección fijada a `0930e1373789d2eda449039f7ac154b33031de89`; 880 skills instaladas localmente. Se versionan el instalador, el lock completo y la documentación, no las copias instaladas ni las credenciales de servicios. Las skills no se activan ni conectan servicios por instalarlas. Reinicia Codex para descubrirlas.

Incluye código de aplicación, imágenes y fuentes propias, migraciones para un proyecto Supabase NUEVO, scripts, tests, workflows de validación y despliegue optativo, guías, ZIP de fuente y checksum. Excluye node_modules, out, .next, archivos locales de entorno, credenciales y copias de skills instaladas. El ZIP puede regenerarse con `node scripts/package-source.mjs`.

No se ha importado ninguna fila de la base de producción anterior, creado proveedores OAuth, configurado SMTP ni almacenado secretos en GitHub. No se han ejecutado migraciones remotas. El conversor CSV añadido solo produce un JSON de revisión local, conserva desconocidos y metadatos y no escribe en Supabase.

Validación: tipos, suite nativa de pruebas, exportación estática y verificador de enlaces/recursos; las comprobaciones de base de datos remota y navegador siguen declaradas pendientes. El workflow validate.yml ejecuta las comprobaciones sin secretos después de importar main.

## Resultado local de esta importación

53/53 pruebas nativas aprobadas, TypeScript correcto, compilación estática correcta y 41 archivos HTML sin errores ni avisos de enlaces/recursos. El verificador de la instalación de skills confirma los 880 directorios y los 1.098 hashes. La compilación de este checkout suma 170.010 bytes gzip externos modernos y 4.382 de estimación inline: 174.392 bytes, 312 por encima del umbral orientativo de 170 KiB. Es una medición local de bundle, no una auditoría Lighthouse; la ruta del checkout y los IDs del build producen pequeñas variaciones respecto al sitio publicado. Este dato queda explícito y no bloquea la importación de código.
