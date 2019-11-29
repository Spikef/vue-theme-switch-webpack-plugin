/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
  Modified by Evan You @yyx990803
*/
const loaderUtils = require('loader-utils');
const path = require('path');
const hash = require('hash-sum');
const qs = require('querystring');

module.exports = function loader() {};

module.exports.pitch = function pitch(remainingRequest) {
  const isServer = this.target === 'node';
  const isProduction = this.minimize || process.env.NODE_ENV === 'production';
  const addStylesClientPath = loaderUtils.stringifyRequest(this, `!${path.join(__dirname, 'lib/addStylesClient.js')}`);
  const addStylesServerPath = loaderUtils.stringifyRequest(this, `!${path.join(__dirname, 'lib/addStylesServer.js')}`);
  const addStylesShadowPath = loaderUtils.stringifyRequest(this, `!${path.join(__dirname, 'lib/addStylesShadow.js')}`);

  const request = loaderUtils.stringifyRequest(this, `!!${remainingRequest}`);
  const relPath = path.relative(__dirname, this.resourcePath).replace(/\\/g, '/');
  const id = JSON.stringify(hash(request + relPath));
  const options = loaderUtils.getOptions(this) || {};
  options.theme = /\btheme=(\w+?)\b/.exec(remainingRequest) && RegExp.$1;

  // direct css import from js --> direct,
  //    or manually call `styles.__inject__(ssrContext)` with `manualInject` option
  // css import from vue file --> component lifecycle linked
  // style embedded in vue file --> component lifecycle linked
  const isVue = (
    /"vue":true/.test(remainingRequest)
        || options.manualInject
        // eslint-disable-next-line eqeqeq
        || qs.parse(this.resourceQuery.slice(1)).vue != null // null || undefined
  );

  const shared = [
    '// style-loader: Adds some css to the DOM by adding a <style> tag',
    '',
    '// load the styles',
    `var content = require(${request});`,
    // content list format is [id, css, media, sourceMap]
    'if(typeof content === \'string\') content = [[module.id, content, \'\']];',
    'if(content.locals) module.exports = content.locals;',
  ];

  // shadowMode is enabled in vue-cli with vue build --target web-component.
  // exposes the same __inject__ method like SSR
  if (options.shadowMode) {
    return shared.concat([
      '// add CSS to Shadow Root',
      `var add = require(${addStylesShadowPath}).default`,
      'module.exports.__inject__ = function (shadowRoot) {',
      `  add(${id}, content, shadowRoot)`,
      '};',
    ]).join('\n');
  } if (!isServer) {
    // on the client: dynamic inject + hot-reload
    let code = [
      '// add the styles to the DOM',
      `var add = require(${addStylesClientPath}).default`,
      `var update = add(${id}, content, ${isProduction}, ${JSON.stringify(options)});`,
    ];
    if (!isProduction) {
      code = code.concat([
        '// Hot Module Replacement',
        'if(module.hot) {',
        ' // When the styles change, update the <style> tags',
        ' if(!content.locals) {',
        `   module.hot.accept(${request}, function() {`,
        `     var newContent = require(${request});`,
        '     if(typeof newContent === \'string\') newContent = [[module.id, newContent, \'\']];',
        '     update(newContent);',
        '   });',
        ' }',
        ' // When the module is disposed, remove the <style> tags',
        ' module.hot.dispose(function() { update(); });',
        '}',
      ]);
    }
    return shared.concat(code).join('\n');
  }
  // on the server: attach to Vue SSR context
  // eslint-disable-next-line no-lonely-if
  if (isVue) {
    // inside *.vue file: expose a function so it can be called in
    // component's lifecycle hooks
    return shared.concat([
      '// add CSS to SSR context',
      `var add = require(${addStylesServerPath}).default`,
      'module.exports.__inject__ = function (context) {',
      `  add(${id}, content, ${isProduction}, context)`,
      '};',
    ]).join('\n');
  }
  // normal import
  return shared.concat([
    `require(${addStylesServerPath}).default(${id}, content, ${isProduction})`,
  ]).join('\n');
};
