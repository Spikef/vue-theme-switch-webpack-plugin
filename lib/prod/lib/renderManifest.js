const { ConcatSource, SourceMapSource, OriginalSource } = require('webpack-sources');

const MODULE_TYPE = 'css/theme-extract';
const PLUGIN_NAME = 'theme-css-extract-plugin';

const REGEXP_THEME = /\[([._-]*)theme([._-]*)]/;

module.exports = function renderManifest(result, chunk, compilation, filename, ignoreOrder) {
  const cssModules = Array.from(chunk.modulesIterable).filter(
    (module) => module.type === MODULE_TYPE,
  );

  if (cssModules.length > 0) {
    // eslint-disable-next-line prefer-spread
    result.push.apply(result, renderContentAssets(
      compilation,
      chunk,
      cssModules,
      compilation.runtimeTemplate.requestShortener,
      {
        filenameTemplate: filename,
        pathOptions: {
          chunk,
          contentHashType: MODULE_TYPE,
        },
        identifier: `${PLUGIN_NAME}.${chunk.id}[theme]`,
        hash: chunk.contentHash[MODULE_TYPE],
        ignoreOrder,
      },
    ));
  }
};

function renderContentAssets(compilation, chunk, modules, requestShortener, options) {
  // Store dependencies for modules
  const moduleDependencies = new Map(modules.map((m) => [m, new Set()]));

  // Get ordered list of modules per chunk group
  // This loop also gathers dependencies from the ordered lists
  // Lists are in reverse order to allow to use Array.pop()
  const modulesByChunkGroup = Array.from(chunk.groupsIterable, (cg) => {
    const sortedModules = modules
      .map((m) => ({
        module: m,
        index: cg.getModuleIndex2(m),
      }))
      .filter((item) => item.index !== undefined)
      .sort((a, b) => b.index - a.index)
      .map((item) => item.module);

    for (let i = 0; i < sortedModules.length; i++) {
      const set = moduleDependencies.get(sortedModules[i]);

      for (let j = i + 1; j < sortedModules.length; j++) {
        set.add(sortedModules[j]);
      }
    }

    return sortedModules;
  });

  // set with already included modules in correct order
  const usedModules = new Set();

  const unusedModulesFilter = (m) => !usedModules.has(m);

  while (usedModules.size < modules.length) {
    let success = false;
    let bestMatch;
    let bestMatchDeps;

    // get first module where dependencies are fulfilled
    // eslint-disable-next-line no-restricted-syntax
    for (const list of modulesByChunkGroup) {
      // skip and remove already added modules
      while (list.length > 0 && usedModules.has(list[list.length - 1])) {
        list.pop();
      }

      // skip empty lists
      if (list.length !== 0) {
        const module = list[list.length - 1];
        const deps = moduleDependencies.get(module);
        // determine dependencies that are not yet included
        const failedDeps = Array.from(deps).filter(unusedModulesFilter);

        // store best match for fallback behavior
        if (!bestMatchDeps || bestMatchDeps.length > failedDeps.length) {
          bestMatch = list;
          bestMatchDeps = failedDeps;
        }

        if (failedDeps.length === 0) {
          // use this module and remove it from list
          usedModules.add(list.pop());
          success = true;
          break;
        }
      }
    }

    if (!success) {
      // no module found => there is a conflict
      // use list with fewest failed deps
      // and emit a warning
      const fallbackModule = bestMatch.pop();
      if (!options.ignoreOrder) {
        compilation.warnings.push(
          new Error(
            `chunk ${chunk.name || chunk.id} [${PLUGIN_NAME}]\n`
                        + 'Conflicting order between:\n'
                        + ` * ${fallbackModule.readableIdentifier(
                          requestShortener,
                        )}\n`
                        + `${bestMatchDeps
                          .map((m) => ` * ${m.readableIdentifier(requestShortener)}`)
                          .join('\n')}`,
          ),
        );
      }

      usedModules.add(fallbackModule);
    }
  }

  const themes = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const m of usedModules) {
    const source = new ConcatSource();
    const externalsSource = new ConcatSource();

    if (/^@import url/.test(m.content)) {
      // HACK for IE
      // http://stackoverflow.com/a/14676665/1458162
      let { content } = m;

      if (m.media) {
        // insert media into the @import
        // this is rar
        // TODO improve this and parse the CSS to support multiple medias
        content = content.replace(/;|\s*$/, m.media);
      }

      externalsSource.add(content);
      externalsSource.add('\n');
    } else {
      if (m.media) {
        source.add(`@media ${m.media} {\n`);
      }

      if (m.sourceMap) {
        source.add(
          new SourceMapSource(
            m.content,
            m.readableIdentifier(requestShortener),
            m.sourceMap,
          ),
        );
      } else {
        source.add(
          new OriginalSource(
            m.content,
            m.readableIdentifier(requestShortener),
          ),
        );
      }

      source.add('\n');

      if (m.media) {
        source.add('}\n');
      }
    }

    const theme = m.theme || 'default';
    if (!themes[theme]) {
      themes[theme] = new ConcatSource(externalsSource, source);
      themes.push(theme);
    } else {
      themes[theme] = new ConcatSource(themes[theme], externalsSource, source);
    }
  }

  return themes.map((theme) => {
    const resolveTemplate = (template) => {
      if (theme === 'default') {
        template = template.replace(REGEXP_THEME, '');
      } else {
        template = template.replace(REGEXP_THEME, `$1${theme}$2`);
      }
      return `${template}?type=${MODULE_TYPE}&id=${chunk.id}&theme=${theme}`;
    };

    return {
      render: () => themes[theme],
      filenameTemplate: resolveTemplate(options.filenameTemplate),
      pathOptions: options.pathOptions,
      identifier: options.identifier,
      hash: options.hash,
    };
  });
}
