import { createRouter, createWebHistory, type RouteRecordRaw, type RouteLocationNormalized } from 'vue-router';
import Main from '../views/Main.vue';
import Access from '../views/Access.vue';

async function auth(to: RouteLocationNormalized, from: RouteLocationNormalized) {
  if (!localStorage.getItem('access_token')) {
    return { path: '/access' };
  }  
}

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: Main,
    beforeEnter: auth
  },
  {
    path: '/access',
    name: 'access',
    component: Access
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;