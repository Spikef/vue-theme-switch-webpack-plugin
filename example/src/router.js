import Vue from 'vue';
import VueRouter from 'vue-router';

const Page1 = () => import('./pages/page1/index.vue');
const Page2 = () => import('./pages/page2/index.vue');

const routes = [
  {
    path: '/', redirect: '/page1',
  },
  {
    path: '/page1', component: Page1, name: 'page1', text: '第1页',
  },
  {
    path: '/page2', component: Page2, name: 'page2', text: '第2页',
  },
];

Vue.use(VueRouter);

export default new VueRouter({ routes });
