'use client';

import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import MovieCard from '@/components/MovieCard';
import { tmdb } from '@/lib/tmdb';

export default function FavoritesList() {
  const [user, setUser] = useState<User | null>(null);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setFavorites([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchFavorites = async () => {
      setLoading(true);
      setError(null);
      try {
        const q = query(collection(db, 'favorites'), where('userId', '==', user.uid));
        const snapshot = await getDocs(q);
        const movieIds = snapshot.docs.map(doc => doc.data().movieId);

        const movieDetails = await Promise.all(
          movieIds.map(async (id) => {
            try {
              const { data } = await tmdb.get(`/movie/${id}`);
              return data;
            } catch (err) {
              console.error(`Failed to fetch movie ${id}:`, err);
              return null;
            }
          })
        );

        setFavorites(movieDetails.filter(m => m !== null));
      } catch (err) {
        console.error('Error fetching favorites:', err);
        setError('Không thể tải danh sách yêu thích');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user]);

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
      <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800">
        <p className="text-xl text-slate-400">Vui lòng đăng nhập để xem danh sách yêu thích</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Phim yêu thích</h1>
      {favorites.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {favorites.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800">
          <p className="text-xl text-slate-400">Bạn chưa có phim yêu thích nào</p>
        </div>
      )}
    </div>
  );
}
