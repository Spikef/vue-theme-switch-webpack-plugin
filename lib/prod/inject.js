const fs = require('fs');
const path = require('path');
const loaderUtils = require('loader-utils');

const MODULE_TYPE = 'css/theme-extract';
const PLUGIN_NAME = 'html-theme-inject-plugin';

const REGEXP_CSS = new RegExp(`\\btype=${MODULE_TYPE}\\b`);

const themeScript = fs.readFileSync(path.resolve(__dirname, '../../dist/index.js')).toString();

module.exports = class HtmlThemeInjectPlugin {
  constructor(htmlWebpackPlugin) {
    this.htmlWebpackPlugin = htmlWebpackPlugin;
  }

  apply(compiler) {
    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
      const alterAssetTagsHook = this.htmlWebpackPlugin
        ? this.htmlWebpackPlugin.getHooks(compilation).alterAssetTags
        : compilation.hooks.htmlWebpackPluginAlterAssetTags;

      const beforeEmitHook = this.htmlWebpackPlugin
        ? this.htmlWebpackPlugin.getHooks(compilation).beforeEmit
        : compilation.hooks.htmlWebpackPluginAfterHtmlProcessing;

      alterAssetTagsHook.tapAsync(PLUGIN_NAME, (data, callback) => {
        data.head = data.head.filter((tag) => {
          if (tag.tagName === 'link' && REGEXP_CSS.test(tag.attributes && tag.attributes.href)) {
            const url = tag.attributes.href;
            if (!url.includes('theme=default')) return false;
            // eslint-disable-next-line no-return-assign
            return !!(tag.attributes.href = url.substring(0, url.indexOf('?')));
          }
          return true;
        });
        data.plugin.assetJson = JSON.stringify(
          JSON.parse(data.plugin.assetJson)
            .filter((url) => !REGEXP_CSS.test(url) || url.includes('theme=default'))
            .map((url) => (REGEXP_CSS.test(url) ? url.substring(0, url.indexOf('?')) : url)),
        );

        callback(null, data);
      });

      beforeEmitHook.tapAsync(PLUGIN_NAME, (data, callback) => {
        const resource = { entry: {}, chunks: {} };
        Object.keys(compilation.assets).forEach((file) => {
          if (REGEXP_CSS.test(file)) {
            const query = loaderUtils.parseQuery(file.substring(file.indexOf('?')));
            const theme = { id: query.id, theme: query.theme, href: file.substring(0, file.indexOf('?')) };
            if (data.assets.css.indexOf(file) !== -1) {
              resource.entry[`${theme.id}#${theme.theme}`] = theme;
            } else {
              resource.chunks[`${theme.id}#${theme.theme}`] = theme;
            }
          }
        });

        data.html = data.html.replace(/(?=<\/head>)/, () => {
          const script = themeScript.replace('window.$themeResource', JSON.stringify(resource));
          return `<script>${script}</script>`;
        });

        callback(null, data);
      });
    });
  }
};
