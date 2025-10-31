// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './assets/styles.css';
import { auth } from './firebase';

let appInstance = null;

auth.onAuthStateChanged(user => {
  console.log('Auth state changed:', user); // Debug
  store.commit('setUser', user);
  if (!appInstance) {
    appInstance = createApp(App).use(store).use(router).mount('#app');
  }
});