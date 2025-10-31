<template>
  <div class="container mt-4">
    <h1>Phim theo thể loại: {{ genreName }}{{ year ? ` năm ${year}` : '' }}</h1>
    <div v-if="loading" class="loading">Đang tải...</div>
    <div v-else class="row">
      <MovieCard v-for="movie in movies" :key="movie.id" :movie="movie" />
    </div>
    <nav aria-label="Page navigation">
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: page === 1 }">
          <a class="page-link" @click="changePage(page - 1)">Previous</a>
        </li>
        <li class="page-item"><a class="page-link">{{ page }}</a></li>
        <li class="page-item">
          <a class="page-link" @click="changePage(page + 1)">Next</a>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
import MovieCard from '../components/MovieCard.vue';

export default {
  components: {
    MovieCard
  },
  data() {
    return {
      genreName: ''
    };
  },
  computed: {
    movies() {
      return this.$store.state.movies;
    },
    page() {
      return this.$store.state.page;
    },
    loading() {
      return this.$store.state.loading;
    },
    year() {
      return this.$store.state.year;
    }
  },
  async created() {
    const genreId = this.$route.params.id;
    await this.$store.dispatch('fetchGenres'); // Ensure genres loaded
    this.genreName = this.$store.state.genres.find(g => g.id == genreId)?.name || 'Unknown';
    this.$store.dispatch('fetchMoviesByGenre', { genreId, page: 1 });
  },
  methods: {
    changePage(newPage) {
      if (newPage > 0) {
        const genreId = this.$route.params.id;
        this.$store.dispatch('fetchMoviesByGenre', { genreId, page: newPage });
      }
    }
  }
};
</script>