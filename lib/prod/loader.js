const NativeModule = require('module');

const loaderUtils = require('loader-utils');
const NodeTemplatePlugin = require('webpack/lib/node/NodeTemplatePlugin');
const NodeTargetPlugin = require('webpack/lib/node/NodeTargetPlugin');
const LibraryTemplatePlugin = require('webpack/lib/LibraryTemplatePlugin');
const SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin');
const LimitChunkCountPlugin = require('webpack/lib/optimize/LimitChunkCountPlugin');

const CssDependency = require('./lib/CssDependency');

const PLUGIN_NAME = 'theme-css-extract-plugin';

function evalModuleCode(loaderContext, code, filename) {
  const module = new NativeModule(filename, loaderContext);

  module.paths = NativeModule._nodeModulePaths(loaderContext.context);
  module.filename = filename;
  module._compile(code, filename);

  return module.exports;
}

function findModuleById(modules, id) {
  // eslint-disable-next-line no-restricted-syntax
  for (const module of modules) {
    if (module.id === id) {
      return module;
    }
  }

  return null;
}

exports.pitch = function pitch(request) {
  const options = loaderUtils.getOptions(this) || {};

  const loaders = this.loaders.slice(this.loaderIndex + 1);

  this.addDependency(this.resourcePath);

  const childFilename = '*';
  // eslint-disable-next-line no-nested-ternary
  const publicPath = typeof options.publicPath === 'string'
    ? options.publicPath === '' || options.publicPath.endsWith('/')
      ? options.publicPath
      : `${options.publicPath}/`
    : typeof options.publicPath === 'function'
      ? options.publicPath(this.resourcePath, this.rootContext)
      : this._compilation.outputOptions.publicPath;
  const outputOptions = {
    filename: childFilename,
    publicPath,
  };
  const childCompiler = this._compilation.createChildCompiler(
    `${PLUGIN_NAME} ${request}`,
    outputOptions,
  );

  new NodeTemplatePlugin(outputOptions).apply(childCompiler);
  new LibraryTemplatePlugin(null, 'commonjs2', false, '', '').apply(childCompiler);
  new NodeTargetPlugin().apply(childCompiler);
  new SingleEntryPlugin(this.context, `!!${request}`, PLUGIN_NAME).apply(
    childCompiler,
  );
  new LimitChunkCountPlugin({ maxChunks: 1 }).apply(childCompiler);

  childCompiler.hooks.thisCompilation.tap(
    `${PLUGIN_NAME} loader`,
    (compilation) => {
      compilation.hooks.normalModuleLoader.tap(
        `${PLUGIN_NAME} loader`,
        (loaderContext, module) => {
          // eslint-disable-next-line no-param-reassign
          loaderContext.emitFile = this.emitFile;

          if (module.request === request) {
            // eslint-disable-next-line no-param-reassign
            module.loaders = loaders.map((loader) => ({
              loader: loader.path,
              options: loader.options,
              ident: loader.ident,
            }));
          }
        },
      );
    },
  );

  let source;

  childCompiler.hooks.afterCompile.tap(PLUGIN_NAME, (compilation) => {
    source = compilation.assets[childFilename]
      && compilation.assets[childFilename].source();

    // Remove all chunk assets
    compilation.chunks.forEach((chunk) => {
      chunk.files.forEach((file) => {
        delete compilation.assets[file]; // eslint-disable-line no-param-reassign
      });
    });
  });

  const callback = this.async();

  childCompiler.runAsChild((err, entries, compilation) => {
    const addDependencies = (dependencies) => {
      if (!Array.isArray(dependencies) && dependencies) {
        throw new Error(`Exported value was not extracted as an array: ${JSON.stringify(dependencies)}`);
      }

      const identifierCountMap = new Map();

      // eslint-disable-next-line no-restricted-syntax
      for (const dependency of dependencies) {
        const count = identifierCountMap.get(dependency.identifier) || 0;

        this._module.addDependency(
          new CssDependency(dependency, module.context, count),
        );
        identifierCountMap.set(dependency.identifier, count + 1);
      }
    };

    if (err) {
      return callback(err);
    }

    if (compilation.errors.length > 0) {
      return callback(compilation.errors[0]);
    }

    compilation.fileDependencies.forEach((dep) => {
      this.addDependency(dep);
    });

    compilation.contextDependencies.forEach((dep) => {
      this.addContextDependency(dep);
    });

    if (!source) {
      return callback(new Error('Didn\'t get a result from child compiler'));
    }

    let locals;

    try {
      let dependencies;
      const exports = evalModuleCode(this, source, request);
      locals = exports && exports.locals;
      if (!Array.isArray(exports)) {
        dependencies = [[null, exports]];
      } else {
        dependencies = exports.map(([id, content, media, sourceMap]) => {
          const module = findModuleById(compilation.modules, id);

          return {
            identifier: module.identifier(),
            content,
            media,
            sourceMap,
          };
        });
      }
      addDependencies(dependencies);
    } catch (e) {
      return callback(e);
    }

    let result = `// extracted by ${PLUGIN_NAME}`;
    result += locals
      ? `\nmodule.exports = ${JSON.stringify(locals)};`
      : '';

    return callback(null, result);
  });
};
