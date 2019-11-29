const head = document.getElementsByTagName('head')[0];

export function createLinkElement(attrs) {
  const el = document.createElement('link');
  el.rel = 'stylesheet';
  el.type = 'text/css';
  el.href = attrs.href;

  Object.keys(attrs).forEach((key) => {
    if (key === 'href') return;
    el.setAttribute(key, attrs[key]);
  });

  head.appendChild(el);
  return el;
}

export function createThemeLink(theme) {
  if (!theme) return;
  if (theme.$el) {
    theme.$el.setAttribute('href', theme.href);
  } else {
    // eslint-disable-next-line no-param-reassign
    theme.$el = createLinkElement({ href: theme.href });
  }
}

export function removeThemeLink(theme) {
  if (!theme) return;
  if (theme.$el) {
    // eslint-disable-next-line no-param-reassign
    theme.$el = !theme.$el.parentNode.removeChild(theme.$el);
  }
}
