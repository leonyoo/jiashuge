import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './style.css';
import { install as installAnalytics } from './analytics';
import { useStore } from './store';

installAnalytics({ autoPageView: true });
const app = createApp(App);
app.use(createPinia());
app.use(router);
const store = useStore();
store.bootstrap();
app.mount('#app');

