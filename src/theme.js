import store from './store';
import * as util from './util';

const theme = {};
const resource = window.$themeResource;

Object.defineProperties(theme, {
  style: {
    configurable: true,
    enumerable: true,
    get() {
      return store.get();
    },
    set(val) {
      const oldVal = store.get();
      const newVal = String(val || 'default');
      if (oldVal === newVal) return;
      store.set(newVal);
      window.dispatchEvent(new CustomEvent('theme-change', { bubbles: true, detail: { newVal, oldVal } }));
    },
  },
  __loadChunkCss: {
    enumerable: false,
    value: function loadChunkCss(chunkId) {
      const id = `${chunkId}#${theme.style}`;
      if (resource && resource.chunks) {
        util.createThemeLink(resource.chunks[id]);
      }
    },
  },
});

// NODE_ENV = production
if (resource) {
  // 加载entry
  const currentTheme = theme.style;
  if (resource.entry && currentTheme && currentTheme !== 'default') {
    Object.keys(resource.entry).forEach((id) => {
      const item = resource.entry[id];
      if (item.theme === currentTheme) {
        util.createThemeLink(item);
      }
    });
  }

  // 更新theme
  window.addEventListener('theme-change', (e) => {
    const newTheme = e.detail.newVal || 'default';
    const oldTheme = e.detail.oldVal || 'default';

    const updateThemeLink = (obj) => {
      if (obj.theme === newTheme && newTheme !== 'default') {
        util.createThemeLink(obj);
      } else if (obj.theme === oldTheme && oldTheme !== 'default') {
        util.removeThemeLink(obj);
      }
    };

    if (resource.entry) {
      Object.keys(resource.entry).forEach((id) => {
        updateThemeLink(resource.entry[id]);
      });
    }

    if (resource.chunks) {
      Object.keys(resource.chunks).forEach((id) => {
        updateThemeLink(resource.chunks[id]);
      });
    }
  });
}

window.$theme = theme;

export default theme;
