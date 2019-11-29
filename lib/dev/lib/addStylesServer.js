import listToStyles from './listToStyles';

export default function addStylesServer(parentId, list, isProduction, context) {
  if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
    // eslint-disable-next-line no-undef
    context = __VUE_SSR_CONTEXT__;
  }
  if (context) {
    if (!Object.prototype.hasOwnProperty.call(context, 'styles')) {
      Object.defineProperty(context, 'styles', {
        enumerable: true,
        get() {
          return renderStyles(context._styles);
        },
      });
      // expose renderStyles for vue-server-renderer (vuejs/#6353)
      context._renderStyles = renderStyles;
    }

    const styles = context._styles || (context._styles = {});
    list = listToStyles(parentId, list);
    if (isProduction) {
      addStyleProd(styles, list);
    } else {
      addStyleDev(styles, list);
    }
  }
}

// In production, render as few style tags as possible.
// (mostly because IE9 has a limit on number of style tags)
function addStyleProd(styles, list) {
  for (let i = 0; i < list.length; i++) {
    const { parts } = list[i];
    for (let j = 0; j < parts.length; j++) {
      const part = parts[j];
      // group style tags by media types.
      const id = part.media || 'default';
      const style = styles[id];
      if (style) {
        if (style.ids.indexOf(part.id) < 0) {
          style.ids.push(part.id);
          style.css += `\n${part.css}`;
        }
      } else {
        styles[id] = {
          ids: [part.id],
          css: part.css,
          media: part.media,
        };
      }
    }
  }
}

// In dev we use individual style tag for each module for hot-reload
// and source maps.
function addStyleDev(styles, list) {
  for (let i = 0; i < list.length; i++) {
    const { parts } = list[i];
    for (let j = 0; j < parts.length; j++) {
      const part = parts[j];
      styles[part.id] = {
        ids: [part.id],
        css: part.css,
        media: part.media,
      };
    }
  }
}

function renderStyles(styles) {
  let css = '';
  // eslint-disable-next-line no-restricted-syntax
  for (const key in styles) {
    // eslint-disable-next-line no-continue
    if (!Object.prototype.hasOwnProperty.call(styles, key)) continue;
    const style = styles[key];
    const attrs = [`data-vue-ssr-id="${style.ids.join(' ')}"`];
    if (style.media) attrs.push(`media="${style.media}"`);
    css += `<style ${attrs.join(' ')}>${style.css}</style>`;
  }
  return css;
}
