'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Heart, Plus, Check, LogIn, Loader2 } from 'lucide-react';

export default function ActionButtons({ movieId }: { movieId: number }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);
  const [loadingPlaylist, setLoadingPlaylist] = useState<string | null>(null);
  const [checkingFavorite, setCheckingFavorite] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const fetchData = async () => {
    if (!user) {
      setIsFavorite(false);
      setPlaylists([]);
      setCheckingFavorite(false);
      return;
    }

    setCheckingFavorite(true);
    try {
      // Check favorite
      const favoriteQuery = query(collection(db, 'favorites'), where('userId', '==', user.uid), where('movieId', '==', movieId));
      const favoriteSnapshot = await getDocs(favoriteQuery);
      setIsFavorite(!favoriteSnapshot.empty);

      // Fetch playlists
      const playlistQuery = query(collection(db, 'playlists'), where('userId', '==', user.uid));
      const playlistSnapshot = await getDocs(playlistQuery);
      setPlaylists(playlistSnapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setCheckingFavorite(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, movieId]);

  const toggleFavorite = async () => {
    if (!user) {
      router.push('/');
      return;
    }

    setLoadingFavorite(true);
    try {
      const q = query(collection(db, 'favorites'), where('userId', '==', user.uid), where('movieId', '==', movieId));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        await addDoc(collection(db, 'favorites'), { userId: user.uid, movieId });
        setIsFavorite(true);
      } else {
        await deleteDoc(doc(db, 'favorites', snapshot.docs[0].id));
        setIsFavorite(false);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Không thể thực hiện hành động này');
    } finally {
      setLoadingFavorite(false);
    }
  };

  const toggleMovieInPlaylist = async (playlistId: string, isInPlaylist: boolean) => {
    setLoadingPlaylist(playlistId);
    try {
      const playlistRef = doc(db, 'playlists', playlistId);
      if (isInPlaylist) {
        await updateDoc(playlistRef, { movies: arrayRemove(movieId) });
      } else {
        await updateDoc(playlistRef, { movies: arrayUnion(movieId) });
      }
      // Refresh playlists
      await fetchData();
    } catch (error) {
      console.error('Error updating playlist:', error);
      alert('Không thể thực hiện hành động này');
    } finally {
      setLoadingPlaylist(null);
    }
  };

  if (checkingFavorite) {
    return (
      <div className="flex items-center gap-2 px-8 py-3 text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Đang tải...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-4 relative">
      {!user ? (
        <button
          onClick={() => router.push('/')}
          className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-colors"
        >
          <LogIn className="w-5 h-5" />
          <span>Đăng nhập để lưu</span>
        </button>
      ) : (
        <button
          onClick={toggleFavorite}
          disabled={loadingFavorite}
          className={`px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-all disabled:opacity-50 ${
            isFavorite ? 'bg-red-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          {loadingFavorite ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          )}
          <span>{isFavorite ? 'Đã yêu thích' : 'Yêu thích'}</span>
        </button>
      )}

      {user && (
        <div className="relative">
          <button
            onClick={() => setShowPlaylistMenu(!showPlaylistMenu)}
            className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Thêm vào danh sách</span>
          </button>

          {showPlaylistMenu && (
            <div className="absolute top-full mt-2 left-0 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-2">
              {playlists.length > 0 ? (
                <div className="space-y-1">
                  {playlists.map(p => {
                    const isInPlaylist = (p.movies || []).includes(movieId);
                    return (
                      <button
                        key={p.id}
                        onClick={() => toggleMovieInPlaylist(p.id, isInPlaylist)}
                        disabled={loadingPlaylist === p.id}
                        className="w-full flex items-center justify-between px-4 py-2 hover:bg-slate-800 rounded-lg transition-colors text-sm disabled:opacity-50"
                      >
                        <span>{p.name}</span>
                        {loadingPlaylist === p.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isInPlaylist ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-xs text-slate-500 mb-2">Chưa có danh sách nào</p>
                  <button
                    onClick={() => {
                      router.push('/playlists');
                      setShowPlaylistMenu(false);
                    }}
                    className="text-xs text-blue-400 hover:underline"
                  >
                    Tạo danh sách mới
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
