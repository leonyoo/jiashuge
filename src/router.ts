import { createRouter, createWebHashHistory } from 'vue-router';
import Yard from './views/Yard.vue';
import Learn from './views/Learn.vue';
import Compose from './views/Compose.vue';
import Mailbox from './views/Mailbox.vue';
import Reading from './views/Reading.vue';
import Me from './views/Me.vue';
import Shop from './views/Shop.vue';
import Flying from './views/Flying.vue';
import Cognitive from './views/Cognitive.vue';
import Onboarding from './views/Onboarding.vue';
import NotFound from './views/NotFound.vue';

export const routes = [
  { path: '/', redirect: '/yard' },
  { path: '/onboarding', component: Onboarding, meta: { tab: null } },
  { path: '/yard', component: Yard, meta: { tab: 'yard' } },
  { path: '/learn', component: Learn, meta: { tab: 'learn' } },
  { path: '/compose', component: Compose, meta: { tab: 'compose' } },
  { path: '/compose/:letterId', component: Compose, meta: { tab: 'compose' } },
  { path: '/mailbox', component: Mailbox, meta: { tab: 'mailbox' } },
  { path: '/reading/:letterId', component: Reading, meta: { tab: 'mailbox' } },
  { path: '/me', component: Me, meta: { tab: 'me' } },
  { path: '/shop', component: Shop, meta: { tab: 'me' } },
  { path: '/flying/:letterId', component: Flying, meta: { tab: null } },
  { path: '/cognitive', component: Cognitive, meta: { tab: 'cognitive' } },
  { path: '/cognitive/:game', component: Cognitive, meta: { tab: 'cognitive' } },
  { path: '/:pathMatch(.*)*', component: NotFound, meta: { tab: null } }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});


import { useStore } from './store';

router.beforeEach((to) => {
  const store = useStore();
  if (!store.currentUser && to.path !== '/onboarding') {
    return { path: '/onboarding' };
  }
  if (store.currentUser && to.path === '/onboarding') {
    return { path: '/yard' };
  }
  return true;
});

export default router;



