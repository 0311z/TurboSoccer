import ts from 'typescript';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else if (/\.(ts|tsx|css)$/.test(path)) files.push(path);
  }
  return files.sort();
}
function escape(value) { return value.replaceAll('|', '\\|').replaceAll('\n', ' ').replaceAll('`', ''); }
try {
  const rows = [];
  for (const file of await walk('src')) {
    if (file.endsWith('.css')) { rows.push(`| [${file}](../${file}) | CSS | — |`); continue; }
    const source = await readFile(file, 'utf8');
    const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith('tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    const imports = [];
    const exports = [];
    for (const node of tree.statements) {
      if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) imports.push(node.moduleSpecifier.text);
      const modifiers = ts.canHaveModifiers(node) ? ts.getModifiers(node) : undefined;
      if (!modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword)) continue;
      if (ts.isFunctionDeclaration(node)) exports.push(escape(source.slice(node.getStart(tree), node.body?.getStart(tree) ?? node.end).trim()));
      else if (ts.isVariableStatement(node)) for (const declaration of node.declarationList.declarations) exports.push(escape(`${declaration.name.getText(tree)}${declaration.type ? ': ' + declaration.type.getText(tree) : ' (inferred)'}`));
      else if (ts.isTypeAliasDeclaration(node)) exports.push(`type ${node.name.text}`);
      else if (ts.isInterfaceDeclaration(node)) exports.push(`interface ${node.name.text}`);
      else if (ts.isClassDeclaration(node)) exports.push(`class ${node.name?.text ?? '(default)'}`);
      else if (ts.isExportAssignment(node)) exports.push(`default ${escape(node.expression.getText(tree))}`);
    }
    rows.push(`| [${file}](../${file}) | ${exports.map(value => '`' + value + '`').join('<br>') || '—'} | ${imports.map(value => '`' + escape(value) + '`').join(', ') || '—'} |`);
  }
  await writeFile('docs/MODULES.md', '# Contrato e inventario de módulos\n\nGenerado desde el código TypeScript entregado. Las firmas se leen de las declaraciones; los tipos inferidos conservan su definición en el archivo enlazado. Los archivos fuente completos son la autoridad para los tipos de dominio y SQL.\n\n| Ruta | Exports / firma TS | Importa de |\n|---|---|---|\n' + rows.join('\n') + '\n');
  console.log(`[TSV][inventory] OK ${rows.length} módulos`);
} catch (error) {
  console.error('[TSV][inventory] FAIL', error instanceof Error ? error.message : 'Unknown error');
  process.exitCode = 1;
}
