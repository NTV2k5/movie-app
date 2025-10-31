<template>
  <div class="container mt-4">
    <h1>{{ playlist?.name || 'Playlist' }}</h1>
    <div v-if="!user">Vui lòng đăng nhập để xem playlist.</div>
    <div v-else-if="loading" class="loading">Đang tải...</div>
    <div v-else-if="movies.length" class="row">
      <MovieCard v-for="movie in movies" :key="movie.id" :movie="movie" />
    </div>
    <p v-else>Chưa có phim trong playlist này.</p>
  </div>
</template>

<script>
import axios from 'axios';
import MovieCard from '../components/MovieCard.vue';

export default {
  components: {
    MovieCard
  },
  data() {
    return {
      movies: []
    };
  },
  computed: {
    user() {
      return this.$store.state.user;
    },
    playlist() {
      return this.$store.state.playlists.find(p => p.id === this.$route.params.id);
    },
    loading() {
      return this.$store.state.loading;
    }
  },
  async created() {
    if (this.user && this.playlist) {
      await this.fetchPlaylistMovies();
    }
  },
  methods: {
    async fetchPlaylistMovies() {
      const apiKey = 'YOUR_TMDB_API_KEY';
      this.movies = [];
      for (const id of this.playlist.movies || []) {
        try {
          const res = await axios.get(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}`);
          this.movies.push(res.data);
        } catch (error) {
          console.error('Error fetching playlist movie:', error);
        }
      }
    }
  }
};
</script>