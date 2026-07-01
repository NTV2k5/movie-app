'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, arrayRemove, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { tmdb } from '@/lib/tmdb';
import MovieCard from '@/components/MovieCard';
import { Trash2, ArrowLeft, RefreshCw } from 'lucide-react';

export default function PlaylistDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [playlist, setPlaylist] = useState<any>(null);
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const fetchPlaylistData = async () => {
    if (!user || !id) return;

    setRefreshing(!loading);
    try {
      const docRef = doc(db, 'playlists', id as string);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        setError('Không tìm thấy danh sách');
        return;
      }

      const playlistData = docSnap.data();
      setPlaylist(playlistData);

      if (playlistData.movies && playlistData.movies.length > 0) {
        const movieDetails = await Promise.all(
          playlistData.movies.map(async (movieId: number) => {
            try {
              const { data } = await tmdb.get(`/movie/${movieId}`);
              return data;
            } catch (err) {
              console.error(`Failed to fetch movie ${movieId}:`, err);
              return null;
            }
          })
        );
        setMovies(movieDetails.filter(m => m !== null));
      } else {
        setMovies([]);
      }
    } catch (err) {
      console.error('Error fetching playlist:', err);
      setError('Không thể tải chi tiết danh sách');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPlaylistData();
  }, [user, id]);

  const removeMovieFromPlaylist = async (movieId: number) => {
    if (!user || !id) return;
    try {
      const playlistRef = doc(db, 'playlists', id as string);
      await updateDoc(playlistRef, {
        movies: arrayRemove(movieId)
      });
      await fetchPlaylistData();
    } catch (error) {
      console.error('Error removing movie:', error);
      alert('Không thể xóa phim khỏi danh sách');
    }
  };

  const deletePlaylist = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa danh sách này?')) return;
    if (!id) return;
    try {
      await deleteDoc(doc(db, 'playlists', id as string));
      router.push('/playlists');
    } catch (error) {
      console.error('Error deleting playlist:', error);
      alert('Không thể xóa danh sách');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-lg text-red-400">{error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-slate-400">Vui lòng đăng nhập để xem chi tiết</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/playlists')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại</span>
        </button>
        <button
          onClick={fetchPlaylistData}
          disabled={refreshing}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{playlist?.name}</h1>
          <p className="text-slate-400 mt-2">{movies.length} phim</p>
        </div>
        <button
          onClick={deletePlaylist}
          className="text-red-400 hover:text-red-300 flex items-center gap-2 transition-colors"
        >
          <Trash2 className="w-5 h-5" />
          <span>Xóa danh sách</span>
        </button>
      </div>

      {movies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {movies.map((movie) => (
            <div key={movie.id} className="group relative">
              <MovieCard movie={movie} />
              <button
                onClick={() => removeMovieFromPlaylist(movie.id)}
                className="absolute top-2 right-2 bg-red-600 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                title="Xóa khỏi danh sách"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800">
          <p className="text-xl text-slate-400">Danh sách này chưa có phim nào. Hãy thêm phim vào!</p>
        </div>
      )}
    </div>
  );
}
