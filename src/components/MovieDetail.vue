<template>
  <div v-if="movie" class="container mt-4">
    <div class="row">
      <div class="col-md-4">
        <img :src="`https://image.tmdb.org/t/p/w500${movie.poster_path}`" alt="Poster" class="img-fluid">
      </div>
      <div class="col-md-8">
        <h2>{{ movie.title }} <span v-if="user" @click="toggleFavorite" class="favorite-btn">
          <i class="bi bi-heart" :class="{ 'favorite': isFavorite }"></i>
        </span>
        <span v-if="user" @click="openPlaylistModal" class="playlist-btn ms-2">
          <i class="bi bi-collection-play"></i>
        </span></h2>
        <p><strong>Overview:</strong> {{ movie.overview }}</p>
        <p><strong>Release Date:</strong> {{ movie.release_date }}</p>
        <p><strong>Rating TMDB:</strong> {{ movie.vote_average }}</p>
        <p><strong>User Average Rating:</strong> {{ averageRating }} ({{ ratingCount }} ratings)</p>
        <div v-if="user">
          <h5>Your Rating:</h5>
          <span v-for="i in 5" :key="i" @click="setRating(i)" class="star me-1">
            <i class="bi bi-star-fill" :class="{ 'selected': i <= userRating }"></i>
          </span>
        </div>
        <button @click="shareMovie" class="btn btn-secondary mt-3">Share</button>
        <div v-if="trailerKey">
          <h3>Trailer</h3>
          <iframe :src="`https://www.youtube.com/embed/${trailerKey}`" frameborder="0" allowfullscreen></iframe>
        </div>
        <div v-if="sources.length">
          <h3>Where to Watch</h3>
          <ul>
            <li v-for="source in sources" :key="source.provider_id">
              <a :href="source.url || '#'" target="_blank">{{ source.provider_name }}</a>
            </li>
          </ul>
        </div>
        <div class="mt-4">
          <h3>Comments</h3>
          <form v-if="user" @submit.prevent="addComment" class="mb-3">
            <textarea v-model="newComment" class="form-control" placeholder="Viết bình luận..." required></textarea>
            <button type="submit" class="btn btn-primary mt-2">Gửi</button>
          </form>
          <div v-if="comments.length" class="comment-list">
            <div v-for="comment in comments" :key="comment.id" class="comment">
              <strong>{{ comment.userName }}</strong> <small>{{ formatDate(comment.timestamp) }}</small>
              <p>{{ comment.content }}</p>
            </div>
          </div>
          <p v-else>Chưa có bình luận nào.</p>
        </div>
        <div class="mt-4">
          <h3>Phim đề xuất</h3>
          <div v-if="recommendedMovies.length" class="row">
            <MovieCard v-for="recMovie in recommendedMovies" :key="recMovie.id" :movie="recMovie" class="col-md-3" />
          </div>
          <p v-else>Không có đề xuất.</p>
        </div>
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
import axios from 'axios';
import { db } from '../firebase';
import { doc, setDoc, deleteDoc, collection, query, where, getDocs, addDoc, getDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import MovieCard from './MovieCard.vue';

export default {
  components: { MovieCard },
  data() {
    return {
      movie: null,
      trailerKey: null,
      sources: [],
      userRating: 0,
      averageRating: 0,
      ratingCount: 0,
      newComment: '',
      comments: [],
      recommendedMovies: []
    };
  },
  computed: {
    user() {
      return this.$store.state.user;
    },
    isFavorite() {
      return this.$store.state.favorites.includes(this.movie?.id);
    },
    playlists() {
      return this.$store.state.playlists;
    }
  },
  async created() {
    const movieId = this.$route.params.id;
    const tmdbApiKey = process.env.VUE_APP_TMDB_API_KEY;
    try {
      const movieRes = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${tmdbApiKey}`);
      this.movie = movieRes.data;

      const videoRes = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${tmdbApiKey}`);
      const trailer = videoRes.data.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');
      if (trailer) this.trailerKey = trailer.key;

      const providersRes = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}/watch/providers?api_key=${tmdbApiKey}`);
      this.sources = providersRes.data.results.US?.flatrate || [];

      if (this.user) {
        await this.$store.dispatch('fetchFavorites');
        await this.$store.dispatch('fetchPlaylists');
        await this.fetchUserRating(movieId);
      }
      await this.fetchAverageRating(movieId);
      await this.fetchComments(movieId);
      await this.fetchRecommendedMovies(movieId, tmdbApiKey);
    } catch (err) {
      console.error('Error fetching details:', err);
      const errorMessage = err.message || 'Không xác định';
      this.$toast?.error(`Lỗi khi tải thông tin phim: ${errorMessage}`) || alert(`Lỗi khi tải thông tin phim: ${errorMessage}`);
    }
  },
  methods: {
    async fetchRecommendedMovies(movieId, apiKey) {
      try {
        const res = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}/recommendations?api_key=${apiKey}`);
        this.recommendedMovies = res.data.results.slice(0, 8);
        console.log('Fetched recommended movies:', this.recommendedMovies);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        const errorMessage = err.message || 'Không xác định';
        this.$toast?.error(`Lỗi khi lấy phim đề xuất: ${errorMessage}`) || alert(`Lỗi khi lấy phim đề xuất: ${errorMessage}`);
      }
    },
    async toggleFavorite() {
      if (!this.user || !this.movie) {
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
    async setRating(rating) {
      if (!this.user || !this.movie) {
        this.$toast?.error('Vui lòng đăng nhập để đánh giá.') || alert('Vui lòng đăng nhập để đánh giá.');
        return;
      }
      try {
        const rateRef = doc(db, 'ratings', `${this.user.uid}_${this.movie.id}`);
        await setDoc(rateRef, { movieId: this.movie.id, userId: this.user.uid, rating });
        this.userRating = rating;
        console.log('Set rating:', rating);
        this.$toast?.success(`Đã đánh giá: ${rating} sao.`) || alert(`Đã đánh giá: ${rating} sao.`);
        await this.fetchAverageRating(this.movie.id);
      } catch (err) {
        console.error('Error setting rating:', err);
        const errorMessage = err.message || 'Không xác định';
        this.$toast?.error(`Lỗi khi đánh giá: ${errorMessage}`) || alert(`Lỗi khi đánh giá: ${errorMessage}`);
      }
    },
    async fetchUserRating(movieId) {
      if (!this.user) return;
      try {
        const rateRef = doc(db, 'ratings', `${this.user.uid}_${movieId}`);
        const rateSnap = await getDoc(rateRef);
        if (rateSnap.exists()) {
          this.userRating = rateSnap.data().rating;
          console.log('Fetched user rating:', this.userRating);
        }
      } catch (err) {
        console.error('Error fetching user rating:', err);
        const errorMessage = err.message || 'Không xác định';
        this.$toast?.error(`Lỗi khi lấy đánh giá cá nhân: ${errorMessage}`) || alert(`Lỗi khi lấy đánh giá cá nhân: ${errorMessage}`);
      }
    },
    async fetchAverageRating(movieId) {
      try {
        const q = query(collection(db, 'ratings'), where('movieId', '==', parseInt(movieId)));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          this.averageRating = 0;
          this.ratingCount = 0;
          return;
        }
        let total = 0;
        querySnapshot.forEach(doc => {
          total += doc.data().rating;
        });
        this.ratingCount = querySnapshot.size;
        this.averageRating = (total / this.ratingCount).toFixed(1);
        console.log('Fetched average rating:', this.averageRating, 'Count:', this.ratingCount);
      } catch (err) {
        console.error('Error fetching average rating:', err);
        const errorMessage = err.message || 'Không xác định';
        this.$toast?.error(`Lỗi khi lấy đánh giá trung bình: ${errorMessage}`) || alert(`Lỗi khi lấy đánh giá trung bình: ${errorMessage}`);
      }
    },
    async fetchComments(movieId) {
      try {
        const q = query(collection(db, 'comments'), where('movieId', '==', parseInt(movieId)));
        const querySnapshot = await getDocs(q);
        this.comments = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          userName: doc.data().userName || 'Anonymous'
        }));
        console.log('Fetched comments:', this.comments);
      } catch (err) {
        console.error('Error fetching comments:', err);
        const errorMessage = err.message || 'Không xác định';
        this.$toast?.error(`Lỗi khi lấy bình luận: ${errorMessage}`) || alert(`Lỗi khi lấy bình luận: ${errorMessage}`);
      }
    },
    async addComment() {
      if (!this.user || !this.movie || !this.newComment.trim()) {
        this.$toast?.error('Vui lòng đăng nhập và nhập bình luận.') || alert('Vui lòng đăng nhập và nhập bình luận.');
        return;
      }
      try {
        await addDoc(collection(db, 'comments'), {
          movieId: this.movie.id,
          userId: this.user.uid,
          userName: this.user.displayName || this.user.email,
          content: this.newComment,
          timestamp: new Date()
        });
        this.newComment = '';
        console.log('Added comment for movie:', this.movie.id);
        this.$toast?.success('Đã thêm bình luận.') || alert('Đã thêm bình luận.');
        await this.fetchComments(this.movie.id);
      } catch (err) {
        console.error('Error adding comment:', err);
        const errorMessage = err.message || 'Không xác định';
        this.$toast?.error(`Lỗi khi thêm bình luận: ${errorMessage}`) || alert(`Lỗi khi thêm bình luận: ${errorMessage}`);
      }
    },
    formatDate(timestamp) {
      return format(timestamp.toDate(), 'dd/MM/yyyy HH:mm');
    },
    shareMovie() {
      const shareData = {
        title: this.movie.title,
        text: `Check out this movie: ${this.movie.title}`,
        url: window.location.href
      };
      if (navigator.share) {
        navigator.share(shareData).catch(err => console.error('Share error:', err));
      } else {
        navigator.clipboard.writeText(shareData.url).then(() => {
          this.$toast?.success('Link copied to clipboard!') || alert('Link copied to clipboard!');
        });
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
    }
  }
};
</script>