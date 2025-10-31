<template>
  <div class="container mt-4">
    <h1>Phim đang hot{{ year ? ` năm ${year}` : '' }}</h1>
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
  created() {
    this.$store.dispatch('fetchTrendingMovies');
  },
  methods: {
    changePage(newPage) {
      if (newPage > 0) {
        this.$store.dispatch('fetchTrendingMovies', newPage);
      }
    }
  }
};
</script>