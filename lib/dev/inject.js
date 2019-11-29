const fs = require('fs');
const path = require('path');

const PLUGIN_NAME = 'html-theme-inject-plugin';

const themeScript = fs.readFileSync(path.resolve(__dirname, '../../dist/index.js')).toString();

module.exports = class HtmlThemeInjectPlugin {
  constructor(htmlWebpackPlugin) {
    this.htmlWebpackPlugin = htmlWebpackPlugin;
  }

  apply(compiler) {
    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
      const beforeEmitHook = this.htmlWebpackPlugin
        ? this.htmlWebpackPlugin.getHooks(compilation).beforeEmit
        : compilation.hooks.htmlWebpackPluginAfterHtmlProcessing;

      beforeEmitHook.tapAsync(PLUGIN_NAME, (data, callback) => {
        data.html = data.html.replace(/(?=<\/head>)/, () => {
          const script = themeScript.replace('window.$themeResource', 'null');
          return `<script>${script}</script>`;
        });

        callback(null, data);
      });
    });
  }
};
