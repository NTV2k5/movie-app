<template>
  <div class="col-md-3 mb-4">
    <div class="card movie-card">
      <img :src="`https://image.tmdb.org/t/p/w500${movie.poster_path}`" class="card-img-top" alt="Poster">
      <div class="card-body">
        <h5 class="card-title">{{ movie.title }}</h5>
        <p class="card-text">Rating: {{ movie.vote_average }} | User Avg: {{ averageRating || 'N/A' }}</p>
        <router-link :to="{ name: 'movie-detail', params: { id: movie.id } }" class="btn btn-primary">Xem chi tiết</router-link>
        <span v-if="user" @click="toggleFavorite" class="favorite-btn float-end">
          <i class="bi bi-heart" :class="{ 'favorite': isFavorite }"></i>
        </span>
        <span v-if="user" @click="openPlaylistModal" class="playlist-btn float-end me-2">
          <i class="bi bi-collection-play"></i>
        </span>
      </div>
    </div>

    <div class="modal fade" :id="'playlistModal' + movie.id" tabindex="-1" aria-labelledby="playlistModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="playlistModalLabel">Thêm vào Playlist</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <ul class="list-group">
              <li v-for="playlist in playlists" :key="playlist.id" class="list-group-item">
                <input type="checkbox" :id="'pl' + playlist.id" :checked="isInPlaylist(playlist.id)" @change="toggleMovieInPlaylist(playlist.id)">
                <label :for="'pl' + playlist.id" class="ms-2">{{ playlist.name }}</label>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '../firebase';
import { doc, setDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';

export default {
  props: {
    movie: Object
  },
  data() {
    return {
      averageRating: null
    };
  },
  computed: {
    user() {
      return this.$store.state.user;
    },
    isFavorite() {
      return this.$store.state.favorites.includes(this.movie.id);
    },
    playlists() {
      return this.$store.state.playlists;
    }
  },
  methods: {
    async toggleFavorite() {
      if (!this.user) {
        this.$toast?.error('Vui lòng đăng nhập để thêm phim yêu thích.') || alert('Vui lòng đăng nhập để thêm phim yêu thích.');
        return;
      }
      try {
        const favRef = doc(db, 'favorites', `${this.user.uid}_${this.movie.id}`);
        if (this.isFavorite) {
          await deleteDoc(favRef);
          this.$store.commit('removeFavorite', this.movie.id);
          console.log('Removed favorite:', this.movie.id);
          this.$toast?.success('Đã xóa khỏi phim yêu thích.') || alert('Đã xóa khỏi phim yêu thích.');
        } else {
          await setDoc(favRef, { movieId: this.movie.id, userId: this.user.uid, title: this.movie.title });
          this.$store.commit('addFavorite', this.movie.id);
          console.log('Added favorite:', this.movie.id);
          this.$toast?.success('Đã thêm vào phim yêu thích.') || alert('Đã thêm vào phim yêu thích.');
        }
      } catch (err) {
        console.error('Error toggling favorite:', err);
        const errorMessage = err.message || 'Không xác định';
        this.$toast?.error(`Lỗi khi thêm/xóa phim yêu thích: ${errorMessage}`) || alert(`Lỗi khi thêm/xóa phim yêu thích: ${errorMessage}`);
      }
    },
    async openPlaylistModal() {
      if (!this.user) {
        this.$toast?.error('Vui lòng đăng nhập để thêm vào playlist.') || alert('Vui lòng đăng nhập để thêm vào playlist.');
        return;
      }
      try {
        await this.$store.dispatch('fetchPlaylists');
        window.bootstrap.Modal.getOrCreateInstance(document.getElementById(`playlistModal${this.movie.id}`)).show();
      } catch (err) {
        console.error('Error opening playlist modal:', err);
        const errorMessage = err.message || 'Không xác định';
        this.$toast?.error(`Lỗi khi mở playlist: ${errorMessage}`) || alert(`Lỗi khi mở playlist: ${errorMessage}`);
      }
    },
    isInPlaylist(playlistId) {
      const playlist = this.playlists.find(p => p.id === playlistId);
      return playlist?.movies.includes(this.movie.id) || false;
    },
    async toggleMovieInPlaylist(playlistId) {
      if (!this.user) {
        this.$toast?.error('Vui lòng đăng nhập để thêm/xóa phim khỏi playlist.') || alert('Vui lòng đăng nhập để thêm/xóa phim khỏi playlist.');
        return;
      }
      try {
        const playlistRef = doc(db, 'playlists', playlistId);
        const playlist = this.playlists.find(p => p.id === playlistId);
        const movies = playlist.movies || [];
        if (movies.includes(this.movie.id)) {
          const updatedMovies = movies.filter(id => id !== this.movie.id);
          await setDoc(playlistRef, { ...playlist, movies: updatedMovies });
          console.log('Removed movie from playlist:', this.movie.id, playlistId);
          this.$toast?.success('Đã xóa phim khỏi playlist.') || alert('Đã xóa phim khỏi playlist.');
        } else {
          movies.push(this.movie.id);
          await setDoc(playlistRef, { ...playlist, movies });
          console.log('Added movie to playlist:', this.movie.id, playlistId);
          this.$toast?.success('Đã thêm phim vào playlist.') || alert('Đã thêm phim vào playlist.');
        }
        await this.$store.dispatch('fetchPlaylists');
      } catch (err) {
        console.error('Error toggling movie in playlist:', err);
        const errorMessage = err.message || 'Không xác định';
        this.$toast?.error(`Lỗi khi thêm/xóa phim khỏi playlist: ${errorMessage}`) || alert(`Lỗi khi thêm/xóa phim khỏi playlist: ${errorMessage}`);
      }
    },
    async fetchAverageRating() {
      try {
        const q = query(collection(db, 'ratings'), where('movieId', '==', this.movie.id));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          let total = 0;
          querySnapshot.forEach(doc => {
            total += doc.data().rating;
          });
          this.averageRating = (total / querySnapshot.size).toFixed(1);
          console.log('Fetched average rating:', this.averageRating);
        }
      } catch (err) {
        console.error('Error fetching average rating:', err);
        const errorMessage = err.message || 'Không xác định';
        this.$toast?.error(`Lỗi khi lấy đánh giá trung bình: ${errorMessage}`) || alert(`Lỗi khi lấy đánh giá trung bình: ${errorMessage}`);
      }
    }
  },
  async created() {
    if (this.user) {
      try {
        await this.$store.dispatch('fetchFavorites');
        await this.$store.dispatch('fetchPlaylists');
      } catch (err) {
        console.error('Error in created hook:', err);
        const errorMessage = err.message || 'Không xác định';
        this.$toast?.error(`Lỗi khi tải dữ liệu ban đầu: ${errorMessage}`) || alert(`Lỗi khi tải dữ liệu ban đầu: ${errorMessage}`);
      }
    }
    await this.fetchAverageRating();
  }
};
</script>