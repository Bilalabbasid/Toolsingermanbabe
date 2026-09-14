// Local TypeScript runner using the project's compiler; no downloaded runner required.
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const Module = require('node:module');
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (id, parent, ...rest) {
  return originalResolve.call(this, id.startsWith('@/') ? path.join(process.cwd(), 'src', id.slice(2)) : id, parent, ...rest);
};
require.extensions['.ts'] = function (mod, filename) {
  const result = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    fileName: filename,
  });
  mod._compile(result.outputText, filename);
};
require(path.resolve(process.argv[2]));
