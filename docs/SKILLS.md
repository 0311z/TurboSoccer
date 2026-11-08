# Skills de Codex

La colección solicitada de [composio-community/awesome-codex-skills](https://github.com/composio-community/awesome-codex-skills) está instalada en este proyecto: **880 skills, 1.098 archivos y 9.402.451 bytes**, sin omisiones. Incluye 48 skills generales y 832 carpetas de `composio-skills`.

La versión instalada está fijada al commit [`0930e1373789d2eda449039f7ac154b33031de89`](https://github.com/composio-community/awesome-codex-skills/tree/0930e1373789d2eda449039f7ac154b33031de89). No se sigue una rama que pueda cambiar con el tiempo.

## Instalar en otro equipo

Desde la raíz del repositorio, con Python 3.10 o posterior:

```bash
python3 scripts/install-codex-skills.py
```

El instalador descarga la versión pública fijada y copia los archivos a `.agents/skills/`. No necesita tokens de GitHub ni dependencias de Python adicionales. Comprueba el tamaño y SHA-256 de cada archivo antes de terminar y prepara la instalación en una carpeta temporal para evitar dejar una instalación incompleta.

**Reinicia Codex para que descubra las nuevas skills.** La instalación en disco no recarga las herramientas de una conversación que ya esté abierta.

Las skills instaladas se excluyen de Git y del archivo de entrega del código. El repositorio conserva este documento, el instalador y `skills.lock.json`, que permiten reconstruir exactamente su contenido.

## Verificar o usar una copia local

```bash
python3 scripts/install-codex-skills.py --check
python3 scripts/install-codex-skills.py --source /ruta/awesome-codex-skills
```

`--check` comprueba los 880 directorios, la lista exacta de archivos y todos sus hashes sin utilizar la red. Si ya hay una instalación, el comando normal la verifica y termina; no sobrescribe cambios locales. Para sustituir una instalación modificada, conserva primero los cambios que necesites y retira manualmente `.agents/skills/` antes de volver a instalar.

`--source` permite instalar desde una copia local del repositorio original; los hashes del lock siguen siendo obligatorios. El instalador solo copia el contenido registrado en el manifiesto y rechaza rutas fuera de la carpeta prevista y enlaces simbólicos.

## Procedencia y comprobaciones

La primera instalación se hizo con el helper revisado del propio repositorio, `skill-installer/scripts/install-skill-from-github.py`, usando `--repo`, el SHA completo en `--ref`, las 880 rutas en `--path` y un `--dest` explícito dentro de TurboSoccer. No se instaló nada en el directorio global de Codex.

`skills.lock.json` contiene:

- Repositorio, commit y hash del helper original utilizado.
- Ruta original y nombre de destino de cada skill.
- `name` y `description` obtenidos de su frontmatter YAML.
- Tamaño y SHA-256 de cada archivo, y un hash del árbol de cada skill.
- Recuentos y resultado de la validación de metadatos.

Se comprobaron los 880 documentos `SKILL.md`: todos tienen frontmatter YAML válido con nombre y descripción no vacíos. No hay nombres de destino repetidos, nombres de metadatos repetidos ni enlaces simbólicos. Los 1.098 archivos instalados coinciden con el contenido registrado en el commit de origen.

Instalar esta colección no configura servidores MCP, conecta cuentas externas, instala paquetes de las skills ni ejecuta sus scripts o automatizaciones. Cada integración requerirá su configuración cuando se utilice. Las instrucciones de una skill se aplican únicamente a una tarea en la que corresponda usarla.

## Licencias del contenido original

No se identificó un archivo de licencia general en la raíz del repositorio de origen en el commit fijado. No se atribuye una licencia nueva a esa colección. Se conservan los avisos y archivos de licencia que acompañan individualmente a algunas skills; antes de redistribuir o reutilizar su contenido, revisa los términos aplicables en el origen.
