/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
  Modified by Evan You @yyx990803
*/

import listToStyles from './listToStyles';

const hasDocument = typeof document !== 'undefined';

// eslint-disable-next-line no-undef
if (typeof DEBUG !== 'undefined' && DEBUG) {
  if (!hasDocument) {
    throw new Error(
      'vue-style-loader cannot be used in a non-browser environment. '
            + 'Use { target: \'node\' } in your Webpack config to indicate a server-rendering environment.',
    );
  }
}

/*
type StyleObject = {
  id: number;
  parts: Array<StyleObjectPart>
}
type StyleObjectPart = {
  css: string;
  media: string;
  sourceMap: ?string
}
*/

const stylesInDom = {/*
  [id: number]: {
    id: number,
    refs: number,
    parts: Array<(obj?: StyleObjectPart) => void>
  }
*/};

const head = hasDocument && (document.head || document.getElementsByTagName('head')[0]);
let singletonElement = null;
let singletonCounter = 0;
let isProduction = false;
const noop = function noop() {};
let options = null;
const ssrIdKey = 'data-vue-ssr-id';

// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
// tags it will allow on a page
const isOldIE = typeof navigator !== 'undefined' && /msie [6-9]\b/.test(navigator.userAgent.toLowerCase());

export default function addStylesClient(parentId, list, _isProduction, _options) {
  isProduction = _isProduction;

  options = _options || {};

  let styles = listToStyles(parentId, list);
  addStylesToDom(styles);

  return function update(newList) {
    const mayRemove = [];
    for (let i = 0; i < styles.length; i++) {
      const item = styles[i];
      const domStyle = stylesInDom[item.id];
      domStyle.refs--;
      mayRemove.push(domStyle);
    }
    if (newList) {
      styles = listToStyles(parentId, newList);
      addStylesToDom(styles);
    } else {
      styles = [];
    }
    for (let i = 0; i < mayRemove.length; i++) {
      const domStyle = mayRemove[i];
      if (domStyle.refs === 0) {
        for (let j = 0; j < domStyle.parts.length; j++) {
          domStyle.parts[j]();
        }
        delete stylesInDom[domStyle.id];
      }
    }
  };
}

function addStylesToDom(styles /* Array<StyleObject> */) {
  for (let i = 0; i < styles.length; i++) {
    const item = styles[i];
    const domStyle = stylesInDom[item.id];
    if (domStyle) {
      domStyle.refs++;
      let j = 0;
      for (; j < domStyle.parts.length; j++) {
        domStyle.parts[j](item.parts[j]);
      }
      for (; j < item.parts.length; j++) {
        domStyle.parts.push(addStyle(item.parts[j]));
      }
      if (domStyle.parts.length > item.parts.length) {
        domStyle.parts.length = item.parts.length;
      }
    } else {
      const parts = [];
      for (let j = 0; j < item.parts.length; j++) {
        parts.push(addStyle(item.parts[j]));
      }
      stylesInDom[item.id] = { id: item.id, refs: 1, parts };
    }
  }
}

function createStyleElement() {
  const styleElement = document.createElement('style');
  styleElement.type = 'text/css';
  if (options.theme) {
    styleElement.setAttribute('data-theme', options.theme);
  }
  head.appendChild(styleElement);
  return styleElement;
}

function addStyle(obj /* StyleObjectPart */) {
  let update;
  let remove;
  let styleElement = document.querySelector(`style[${ssrIdKey}~="${obj.id}"]`);

  if (styleElement) {
    if (isProduction) {
      // has SSR styles and in production mode.
      // simply do nothing.
      return noop;
    }
    // has SSR styles but in dev mode.
    // for some reason Chrome can't handle source map in server-rendered
    // style tags - source maps in <style> only works if the style tag is
    // created and inserted dynamically. So we remove the server rendered
    // styles and inject new ones.
    styleElement.parentNode.removeChild(styleElement);
  }

  if (isOldIE) {
    // use singleton mode for IE9.
    const styleIndex = singletonCounter++;
    styleElement = singletonElement || (singletonElement = createStyleElement());
    update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
    remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
  } else {
    // use multi-style-tag mode in all other cases
    styleElement = createStyleElement();
    update = applyToTag.bind(null, styleElement, false);
    remove = applyToTag.bind(null, styleElement, true);
  }

  if (options.theme && window.$theme) {
    if (window.$theme.style === options.theme) {
      update(obj);
    }

    const { theme } = options;
    // eslint-disable-next-line prefer-arrow-callback
    window.addEventListener('theme-change', function onThemeChange() {
      if (window.$theme.style === theme) {
        update(obj);
      } else {
        remove();
      }
    });

    return function updateStyle(newObj /* StyleObjectPart */) {
      if (newObj) {
        if (
          newObj.css === obj.css
          && newObj.media === obj.media
          && newObj.sourceMap === obj.sourceMap
        ) {
          return;
        }

        obj = newObj;
        if (window.$theme.style === options.theme) {
          update(obj);
        }
      } else {
        remove();
      }
    };
  }

  update(obj);
  remove = function removeStyle() {
    styleElement.parentNode.removeChild(styleElement);
  };

  return function updateStyle(newObj /* StyleObjectPart */) {
    if (newObj) {
      if (
        newObj.css === obj.css
        && newObj.media === obj.media
        && newObj.sourceMap === obj.sourceMap
      ) {
        return;
      }
      update(obj = newObj);
    } else {
      remove();
    }
  };
}

const replaceText = (function replaceText() {
  const textStore = [];

  return function replacer(index, replacement) {
    textStore[index] = replacement;
    return textStore.filter(Boolean).join('\n');
  };
}());

function applyToSingletonTag(styleElement, index, remove, obj) {
  const css = remove ? '' : obj.css;

  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = replaceText(index, css);
  } else {
    const cssNode = document.createTextNode(css);
    const { childNodes } = styleElement;
    if (childNodes[index]) styleElement.removeChild(childNodes[index]);
    if (childNodes.length) {
      styleElement.insertBefore(cssNode, childNodes[index]);
    } else {
      styleElement.appendChild(cssNode);
    }
  }
}

function applyToTag(styleElement, remove, obj) {
  let css = '';

  if (!remove) {
    css = obj.css;
    if (options.ssrId) {
      styleElement.setAttribute(ssrIdKey, obj.id);
    }

    if (obj.media) {
      styleElement.setAttribute('media', obj.media);
    }

    if (obj.sourceMap) {
      // https://developer.chrome.com/devtools/docs/javascript-debugging
      // this makes source maps inside style tags work properly in Chrome
      css += `\n/*# sourceURL=${obj.sourceMap.sources[0]} */`;
      // http://stackoverflow.com/a/26603875
      css += `\n/*# sourceMappingURL=data:application/json;base64,${btoa(unescape(encodeURIComponent(JSON.stringify(obj.sourceMap))))} */`;
    }
  }

  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css;
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild);
    }
    styleElement.appendChild(document.createTextNode(css));
  }
}
