// src/store/index.js
import { createStore } from 'vuex';
import axios from 'axios';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, doc, deleteDoc } from 'firebase/firestore';

export default createStore({
  state: {
    movies: [],
    genres: [],
    page: 1,
    loading: false,
    user: null,
    favorites: [],
    playlists: [],
    year: ''
  },
  mutations: {
    setMovies(state, movies) { state.movies = movies; },
    setGenres(state, genres) { state.genres = genres; },
    setPage(state, page) { state.page = page; },
    setLoading(state, loading) { state.loading = loading; },
    setUser(state, user) { state.user = user; },
    setFavorites(state, favorites) { state.favorites = favorites; },
    addFavorite(state, movieId) {
      if (!state.favorites.includes(movieId)) state.favorites.push(movieId);
    },
    removeFavorite(state, movieId) {
      state.favorites = state.favorites.filter(id => id !== movieId);
    },
    setPlaylists(state, playlists) { state.playlists = playlists; },
    setYear(state, year) { state.year = year; }
  },
  actions: {
    async fetchGenres({ commit }) {
      if (localStorage.getItem('genres')) {
        commit('setGenres', JSON.parse(localStorage.getItem('genres')));
        return;
      }
      const apiKey = process.env.VUE_APP_TMDB_API_KEY;
      if (!apiKey) {
        console.error('TMDB API key is missing');
        return;
      }
      try {
        const res = await axios.get(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}`);
        commit('setGenres', res.data.genres);
        localStorage.setItem('genres', JSON.stringify(res.data.genres));
      } catch (err) {
        console.error('Error fetching genres:', err);
        const errorMessage = err.message || 'Không xác định';
        console.error(`Lỗi khi lấy thể loại: ${errorMessage}`);
      }
    },
    async fetchTrendingMovies({ commit, state }, page = 1) {
      commit('setLoading', true);
      const apiKey = process.env.VUE_APP_TMDB_API_KEY;
      let url = `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}&page=${page}`;
      if (state.year) {
        url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&primary_release_year=${state.year}&page=${page}`;
      }
      try {
        const res = await axios.get(url);
        commit('setMovies', res.data.results);
        commit('setPage', page);
      } catch (err) {
        console.error('Error fetching movies:', err);
        const errorMessage = err.message || 'Không xác định';
        console.error(`Lỗi khi lấy phim trending: ${errorMessage}`);
      } finally {
        commit('setLoading', false);
      }
    },
    async fetchMoviesByGenre({ commit, state }, { genreId, page = 1 }) {
      commit('setLoading', true);
      const apiKey = process.env.VUE_APP_TMDB_API_KEY;
      let url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genreId}&page=${page}`;
      if (state.year) url += `&primary_release_year=${state.year}`;
      try {
        const res = await axios.get(url);
        commit('setMovies', res.data.results);
        commit('setPage', page);
      } catch (err) {
        console.error('Error fetching movies by genre:', err);
        const errorMessage = err.message || 'Không xác định';
        console.error(`Lỗi khi lấy phim theo thể loại: ${errorMessage}`);
      } finally {
        commit('setLoading', false);
      }
    },
    async searchMovies({ commit, state }, query) {
      commit('setLoading', true);
      const apiKey = process.env.VUE_APP_TMDB_API_KEY;
      let url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}`;
      if (state.year) url += `&primary_release_year=${state.year}`;
      try {
        const res = await axios.get(url);
        commit('setMovies', res.data.results);
        commit('setPage', 1);
      } catch (err) {
        console.error('Error searching movies:', err);
        const errorMessage = err.message || 'Không xác định';
        console.error(`Lỗi khi tìm kiếm phim: ${errorMessage}`);
      } finally {
        commit('setLoading', false);
      }
    },
    async fetchFavorites({ commit, state }) {
      if (!state.user) {
        console.warn('No user logged in, skipping fetchFavorites');
        return;
      }
      try {
        const q = query(collection(db, 'favorites'), where('userId', '==', state.user.uid));
        const querySnapshot = await getDocs(q);
        const favorites = querySnapshot.docs.map(doc => doc.data().movieId);
        console.log('Fetched favorites:', favorites);
        commit('setFavorites', favorites);
      } catch (err) {
        console.error('Error fetching favorites:', err);
        const errorMessage = err.message || 'Không xác định';
        console.error(`Lỗi khi lấy phim yêu thích: ${errorMessage}`);
      }
    },
    async fetchPlaylists({ commit, state }) {
      if (!state.user) {
        console.warn('No user logged in, skipping fetchPlaylists');
        return;
      }
      try {
        const q = query(collection(db, 'playlists'), where('userId', '==', state.user.uid));
        const querySnapshot = await getDocs(q);
        const playlists = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Fetched playlists:', playlists);
        commit('setPlaylists', playlists);
      } catch (err) {
        console.error('Error fetching playlists:', err);
        const errorMessage = err.message || 'Không xác định';
        console.error(`Lỗi khi lấy playlists: ${errorMessage}`);
      }
    },
    async createPlaylist({ dispatch, state }, name) {
      if (!state.user) {
        console.warn('No user logged in, cannot create playlist');
        return;
      }
      try {
        const docRef = await addDoc(collection(db, 'playlists'), {
          userId: state.user.uid,
          name,
          movies: []
        });
        console.log('Created playlist:', name, 'ID:', docRef.id);
        await dispatch('fetchPlaylists');
      } catch (err) {
        console.error('Error creating playlist:', err);
        const errorMessage = err.message || 'Không xác định';
        console.error(`Lỗi khi tạo playlist: ${errorMessage}`);
      }
    },
    async deletePlaylist({ dispatch }, playlistId) {
      try {
        await deleteDoc(doc(db, 'playlists', playlistId));
        console.log('Deleted playlist:', playlistId);
        await dispatch('fetchPlaylists');
      } catch (err) {
        console.error('Error deleting playlist:', err);
        const errorMessage = err.message || 'Không xác định';
        console.error(`Lỗi khi xóa playlist: ${errorMessage}`);
      }
    }
  }
});