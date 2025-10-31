<template>
  <div class="container mt-4">
    <h1>Playlists</h1>
    <div v-if="!user">Vui lòng đăng nhập để xem playlists.</div>
    <div v-else>
      <button class="btn btn-primary mb-3" data-bs-toggle="modal" data-bs-target="#createPlaylistModal">Tạo Playlist</button>
      <div v-if="loading" class="loading">Đang tải...</div>
      <div v-else-if="playlists.length" class="row">
        <div v-for="playlist in playlists" :key="playlist.id" class="col-md-4 mb-3">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">{{ playlist.name }}</h5>
              <router-link :to="{ name: 'playlist-detail', params: { id: playlist.id } }" class="btn btn-primary">Xem</router-link>
              <button @click="deletePlaylist(playlist.id)" class="btn btn-danger ms-2">Xóa</button>
            </div>
          </div>
        </div>
      </div>
      <p v-else>Chưa có playlist nào.</p>
    </div>

    <div class="modal fade" id="createPlaylistModal" tabindex="-1" aria-labelledby="createPlaylistModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="createPlaylistModalLabel">Tạo Playlist Mới</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="createPlaylist">
              <div class="mb-3">
                <label for="playlistName" class="form-label">Tên Playlist</label>
                <input v-model="newPlaylistName" type="text" class="form-control" id="playlistName" required>
              </div>
              <button type="submit" class="btn btn-primary">Tạo</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      newPlaylistName: ''
    };
  },
  computed: {
    user() {
      return this.$store.state.user;
    },
    playlists() {
      return this.$store.state.playlists;
    },
    loading() {
      return this.$store.state.loading;
    }
  },
  async created() {
    if (this.user) {
      try {
        await this.$store.dispatch('fetchPlaylists');
      } catch (err) {
        console.error('Error fetching playlists in created:', err);
        const errorMessage = err.message || 'Không xác định';
        this.$toast?.error(`Lỗi khi tải playlists: ${errorMessage}`) || alert(`Lỗi khi tải playlists: ${errorMessage}`);
      }
    }
  },
  methods: {
    async createPlaylist() {
      if (!this.user || !this.newPlaylistName.trim()) {
        this.$toast?.error('Vui lòng đăng nhập và nhập tên playlist.') || alert('Vui lòng đăng nhập và nhập tên playlist.');
        return;
      }
      try {
        await this.$store.dispatch('createPlaylist', this.newPlaylistName);
        this.newPlaylistName = '';
        window.bootstrap.Modal.getInstance(document.getElementById('createPlaylistModal')).hide();
        console.log('Created playlist:', this.newPlaylistName);
        this.$toast?.success('Đã tạo playlist.') || alert('Đã tạo playlist.');
      } catch (err) {
        console.error('Error creating playlist:', err);
        const errorMessage = err.message || 'Không xác định';
        this.$toast?.error(`Lỗi khi tạo playlist: ${errorMessage}`) || alert(`Lỗi khi tạo playlist: ${errorMessage}`);
      }
    },
    async deletePlaylist(playlistId) {
      if (!this.user) {
        this.$toast?.error('Vui lòng đăng nhập để xóa playlist.') || alert('Vui lòng đăng nhập để xóa playlist.');
        return;
      }
      if (confirm('Xóa playlist này?')) {
        try {
          await this.$store.dispatch('deletePlaylist', playlistId);
          console.log('Deleted playlist:', playlistId);
          this.$toast?.success('Đã xóa playlist.') || alert('Đã xóa playlist.');
        } catch (err) {
          console.error('Error deleting playlist:', err);
          const errorMessage = err.message || 'Không xác định';
          this.$toast?.error(`Lỗi khi xóa playlist: ${errorMessage}`) || alert(`Lỗi khi xóa playlist: ${errorMessage}`);
        }
      }
    }
  }
};
</script>