import theme from './theme';

// eslint-disable-next-line import/prefer-default-export
export function install(Vue, options = {}) {
  Vue.util.defineReactive(theme, 'style');
  const name = options.name || '$theme';
  Vue.mixin({
    beforeCreate() {
      Object.defineProperty(this, name, {
        get() {
          return theme.style;
        },
        set(style) {
          theme.style = style;
        },
      });
    },
  });
}
