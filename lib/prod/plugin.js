const path = require('path');
const webpack = require('webpack');

const CssDependency = require('./lib/CssDependency');
const CssDependencyTemplate = require('./lib/CssDependencyTemplate');
const CssModuleFactory = require('./lib/CssModuleFactory');
const renderManifest = require('./lib/renderManifest');

const MODULE_TYPE = 'css/theme-extract';
const PLUGIN_NAME = 'theme-css-extract-plugin';

const REGEXP_CHUNK_HASH = /\[chunkhash(?::(\d+))?]/i;
const REGEXP_CONTENT_HASH = /\[contenthash(?::(\d+))?]/i;
const REGEXP_NAME = /\[name]/i;
const REGEXP_PLACEHOLDERS = /\[(name|id|chunkhash)]/g;
const REGEXP_THEME = /\[([._-]*)theme([._-]*)]/;

const DEFAULT_FILENAME = '[name].css';

module.exports = class ThemeCssExtractPlugin {
  constructor(options = {}) {
    this.options = {
      filename: DEFAULT_FILENAME,
      ignoreOrder: false,
      ...options,
    };

    if (!this.options.chunkFilename) {
      const { filename } = this.options;

      // Anything changing depending on chunk is fine
      if (filename.match(REGEXP_PLACEHOLDERS)) {
        this.options.chunkFilename = filename;
      } else {
        // Else wise prefix '[id].' in front of the basename to make it changing
        this.options.chunkFilename = filename.replace(
          /(^|\/)([^/]*(?:\?|$))/,
          '$1[id].$2',
        );
      }
    }

    ['filename', 'chunkFilename'].forEach((fileKey) => {
      const filename = this.options[fileKey];
      if (!REGEXP_THEME.test(filename)) {
        const ext = path.extname(filename);
        if (ext) {
          this.options[fileKey] = filename.replace(new RegExp(`${ext}$`, 'i'), `[.theme]${ext}`);
        } else {
          this.options[fileKey] = `${filename}[.theme]`;
        }
      }
    });
  }

  apply(compiler) {
    const { options } = this;

    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.dependencyFactories.set(
        CssDependency,
        new CssModuleFactory(),
      );

      compilation.dependencyTemplates.set(
        CssDependency,
        new CssDependencyTemplate(),
      );

      compilation.mainTemplate.hooks.renderManifest.tap(
        PLUGIN_NAME,
        (result, { chunk }) => renderManifest(
          result, chunk, compilation, options.filename, options.ignoreOrder,
        ),
      );

      compilation.chunkTemplate.hooks.renderManifest.tap(
        PLUGIN_NAME,
        (result, { chunk }) => renderManifest(
          result, chunk, compilation, options.chunkFilename, options.ignoreOrder,
        ),
      );

      compilation.mainTemplate.hooks.hashForChunk.tap(
        PLUGIN_NAME,
        (hash, chunk) => {
          const { chunkFilename } = this.options;

          if (REGEXP_CHUNK_HASH.test(chunkFilename)) {
            hash.update(JSON.stringify(chunk.getChunkMaps(true).hash));
          }

          if (REGEXP_CONTENT_HASH.test(chunkFilename)) {
            hash.update(
              JSON.stringify(
                chunk.getChunkMaps(true).contentHash[MODULE_TYPE] || {},
              ),
            );
          }

          if (REGEXP_NAME.test(chunkFilename)) {
            hash.update(JSON.stringify(chunk.getChunkMaps(true).name));
          }
        },
      );

      compilation.hooks.contentHash.tap(PLUGIN_NAME, (chunk) => {
        const { outputOptions } = compilation;
        const { hashFunction, hashDigest, hashDigestLength } = outputOptions;
        const hash = webpack.util.createHash(hashFunction);

        // eslint-disable-next-line no-restricted-syntax
        for (const m of chunk.modulesIterable) {
          if (m.type === MODULE_TYPE) {
            m.updateHash(hash);
          }
        }

        const { contentHash } = chunk;

        contentHash[MODULE_TYPE] = hash
          .digest(hashDigest)
          .substring(0, hashDigestLength);
      });

      compilation.mainTemplate.hooks.requireEnsure.tap(
        PLUGIN_NAME,
        (source) => webpack.Template.asString([
          source,
          '',
          `// ${PLUGIN_NAME} - CSS loading chunk`,
          '$theme.__loadChunkCss(chunkId)',
        ]),
      );
    });
  }
};
