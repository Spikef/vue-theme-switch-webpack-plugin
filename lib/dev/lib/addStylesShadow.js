import listToStyles from './listToStyles';

export default function addStylesToShadowDOM(parentId, list, shadowRoot) {
  const styles = listToStyles(parentId, list);
  addStyles(styles, shadowRoot);
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

function addStyles(styles /* Array<StyleObject> */, shadowRoot) {
  const injectedStyles = shadowRoot._injectedStyles
        || (shadowRoot._injectedStyles = {});
  for (let i = 0; i < styles.length; i++) {
    const item = styles[i];
    const style = injectedStyles[item.id];
    if (!style) {
      for (let j = 0; j < item.parts.length; j++) {
        addStyle(item.parts[j], shadowRoot);
      }
      injectedStyles[item.id] = true;
    }
  }
}

function createStyleElement(shadowRoot) {
  const styleElement = document.createElement('style');
  styleElement.type = 'text/css';
  shadowRoot.appendChild(styleElement);
  return styleElement;
}

function addStyle(obj /* StyleObjectPart */, shadowRoot) {
  const styleElement = createStyleElement(shadowRoot);
  let { css } = obj;
  const { media } = obj;
  const { sourceMap } = obj;

  if (media) {
    styleElement.setAttribute('media', media);
  }

  if (sourceMap) {
    // https://developer.chrome.com/devtools/docs/javascript-debugging
    // this makes source maps inside style tags work properly in Chrome
    css += `\n/*# sourceURL=${sourceMap.sources[0]} */`;
    // http://stackoverflow.com/a/26603875
    css += `\n/*# sourceMappingURL=data:application/json;base64,${btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))))} */`;
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
