<template>
  <header class="container-fluid">
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container">
        <a class="navbar-brand" href="/">Movie App</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <a class="nav-link" href="/">Home</a>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/favorites">Favorites</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/playlists">Playlists</router-link>
            </li>
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" id="genresDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Thể loại
              </a>
              <ul class="dropdown-menu" aria-labelledby="genresDropdown">
                <li v-for="genre in genres" :key="genre.id">
                  <router-link class="dropdown-item" :to="{ name: 'genre', params: { id: genre.id } }">{{ genre.name }}</router-link>
                </li>
              </ul>
            </li>
          </ul>
          <form class="d-flex me-3" @submit.prevent="searchMovies">
            <input v-model="searchQuery" class="form-control me-2" type="search" placeholder="Tìm phim..." aria-label="Search">
            <button class="btn btn-outline-light" type="submit">Tìm</button>
          </form>
          <select v-model="selectedYear" class="form-select me-3" style="width: 120px;" @change="applyYearFilter">
            <option value="">Năm</option>
            <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
          </select>
          <ul class="navbar-nav">
            <li v-if="user" class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                {{ user.displayName || user.email }}
              </a>
              <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                <li><a class="dropdown-item" @click="logout">Đăng xuất</a></li>
              </ul>
            </li>
            <li v-else class="nav-item">
              <button class="btn btn-outline-light" data-bs-toggle="modal" data-bs-target="#loginModal">Đăng nhập</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Login Modal -->
    <div class="modal fade" id="loginModal" tabindex="-1" aria-labelledby="loginModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="loginModalLabel">Đăng nhập</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="loginWithEmail">
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input v-model="email" type="email" class="form-control" id="email" required>
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">Mật khẩu</label>
                <input v-model="password" type="password" class="form-control" id="password" required>
              </div>
              <button type="submit" class="btn btn-primary w-100">Đăng nhập</button>
            </form>
            <hr>
            <button @click="loginWithGoogle" class="btn btn-outline-secondary w-100">Đăng nhập với Google</button>
            <p class="mt-3">Chưa có tài khoản? <a href="#" @click="signupWithEmail">Đăng ký</a></p>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { auth, googleProvider } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';

export default {
  data() {
    return {
      searchQuery: '',
      genres: [],
      email: '',
      password: '',
      selectedYear: '',
      years: []
    };
  },
  computed: {
    user() {
      return this.$store.state.user;
    }
  },
  async created() {
    await this.$store.dispatch('fetchGenres');
    this.genres = this.$store.state.genres;
    this.generateYears();
  },
  methods: {
    searchMovies() {
      if (this.searchQuery) {
        this.$store.dispatch('searchMovies', this.searchQuery);
        this.$router.push({ name: 'home' });
      }
    },
    async loginWithEmail() {
      try {
        await signInWithEmailAndPassword(auth, this.email, this.password);
        window.bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
      } catch (error) {
        alert('Lỗi đăng nhập: ' + error.message);
      }
    },
    async signupWithEmail() {
      try {
        await createUserWithEmailAndPassword(auth, this.email, this.password);
        window.bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
      } catch (error) {
        alert('Lỗi đăng ký: ' + error.message);
      }
    },
    async loginWithGoogle() {
      try {
        await signInWithPopup(auth, googleProvider);
        window.bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
      } catch (error) {
        alert('Lỗi đăng nhập Google: ' + error.message);
      }
    },
    async logout() {
      await signOut(auth);
    },
    generateYears() {
      const currentYear = new Date().getFullYear();
      for (let year = currentYear; year >= 1900; year--) {
        this.years.push(year);
      }
    },
    applyYearFilter() {
      this.$store.commit('setYear', this.selectedYear);
      this.$store.dispatch('fetchTrendingMovies');
    }
  }
};
</script>