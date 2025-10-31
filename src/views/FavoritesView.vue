<template>
  <div class="container mt-4">
    <h1>Phim yêu thích</h1>
    <div v-if="!user">Vui lòng đăng nhập để xem favorites.</div>
    <div v-else-if="loading" class="loading">Đang tải...</div>
    <div v-else class="row">
      <MovieCard v-for="movie in favoriteMovies" :key="movie.id" :movie="movie" />
    </div>
  </div>
</template>

<script>
import MovieCard from '../components/MovieCard.vue';
import axios from 'axios';

export default {
  components: {
    MovieCard
  },
  data() {
    return {
      favoriteMovies: []
    };
  },
  computed: {
    user() {
      return this.$store.state.user;
    },
    favorites() {
      return this.$store.state.favorites;
    },
    loading() {
      return this.$store.state.loading;
    }
  },
  async created() {
    if (this.user) {
      await this.$store.dispatch('fetchFavorites');
      await this.fetchFavoriteMovies();
    }
  },
  methods: {
    async fetchFavoriteMovies() {
      const apiKey = 'YOUR_TMDB_API_KEY';
      this.favoriteMovies = [];
      for (const id of this.favorites) {
        try {
          const res = await axios.get(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}`);
          this.favoriteMovies.push(res.data);
        } catch (error) {
          console.error('Error fetching favorite movie:', error);
        }
      }
    }
  }
};
</script>