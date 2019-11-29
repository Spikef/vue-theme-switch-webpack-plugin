import Vue from 'vue';
import ElementUI from 'element-ui';

import router from './router';

import 'element-ui/lib/theme-chalk/index.css';
import './styles/theme-light/index.css?theme=light'; // eslint-disable-line import/no-unresolved
import './styles/theme-dark/index.css?theme=dark'; // eslint-disable-line import/no-unresolved

import './styles/index.less';
import './styles/index.dark.less?theme=dark'; // eslint-disable-line import/no-unresolved

import App from './app.vue';

Vue.use(ElementUI, { size: 'small' });
Vue.use(window.VueThemeSwitcher);

// eslint-disable-next-line no-new
new Vue({
  el: '#app',
  router,
  render: (h) => h(App),
});
