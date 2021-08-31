import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import Home from '@/pages/Home.vue';
import Pool from '@/pages/Pool.vue';
import Trade from '@/pages/Trade.vue';
import Earn from '@/pages/Earn.vue';

const routes: RouteRecordRaw[] = [
  { path: '/:assetIn?/:assetOut?', name: 'home', component: Trade },
  { path: '/invest', name: 'invest', component: Home },
  { path: '/earn', name: 'earn', component: Earn },
  {
    path: '/swap/:assetIn?/:assetOut?',
    redirect: to => {
      return `/invest${to.path.split('/swap')[1]}`;
    }
  },
  { path: '/pool/:id', name: 'pool', component: Pool },
  { path: '/:pathMatch(.*)*', name: 'not-found', redirect: '/' }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

export default router;
