import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import GenreView from '../views/GenreView.vue';
import FavoritesView from '../views/FavoritesView.vue';
import PlaylistsView from '../views/PlaylistsView.vue';
import PlaylistDetailView from '../views/PlaylistDetailView.vue';
import MovieDetail from '../components/MovieDetail.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/genre/:id',
    name: 'genre',
    component: GenreView
  },
  {
    path: '/favorites',
    name: 'favorites',
    component: FavoritesView
  },
  {
    path: '/playlists',
    name: 'playlists',
    component: PlaylistsView
  },
  {
    path: '/playlist/:id',
    name: 'playlist-detail',
    component: PlaylistDetailView
  },
  {
    path: '/movie/:id',
    name: 'movie-detail',
    component: MovieDetail
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;