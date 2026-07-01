'use client';

import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Plus, Trash2, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function PlaylistsManager() {
  const [user, setUser] = useState<User | null>(null);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setPlaylists([]);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchPlaylists = async () => {
      setLoading(true);
      setError(null);
      try {
        const q = query(collection(db, 'playlists'), where('userId', '==', user.uid));
        const snapshot = await getDocs(q);
        const lists = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPlaylists(lists);
      } catch (err) {
        console.error('Error fetching playlists:', err);
        setError('Không thể tải danh sách phát');
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, [user]);

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newPlaylistName.trim()) return;

    setCreating(true);
    try {
      await addDoc(collection(db, 'playlists'), {
        userId: user.uid,
        name: newPlaylistName.trim(),
        movies: []
      });
      setNewPlaylistName('');
      // Refresh the list
      const q = query(collection(db, 'playlists'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const lists = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlaylists(lists);
    } catch (error) {
      console.error('Error creating playlist:', error);
      alert('Không thể tạo danh sách');
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePlaylist = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa danh sách này?')) return;
    try {
      await deleteDoc(doc(db, 'playlists', id));
      // Refresh the list
      setPlaylists(prev => prev.filter(p => p.id !== id));
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
      <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800">
        <p className="text-xl text-slate-400">Vui lòng đăng nhập để quản lý danh sách phim</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Danh sách của tôi</h1>
        <form onSubmit={handleCreatePlaylist} className="flex gap-2">
          <input
            type="text"
            placeholder="Tên danh sách mới..."
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={creating}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>{creating ? 'Đang tạo...' : 'Tạo mới'}</span>
          </button>
        </form>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {playlists.map((list) => (
          <div key={list.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500/50 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold group-hover:text-blue-400 transition-colors">{list.name}</h3>
              <button
                onClick={() => handleDeletePlaylist(list.id)}
                className="text-slate-500 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-slate-400 text-sm mb-6">{list.movies?.length || 0} phim trong danh sách</p>
            <Link
              href={`/playlists/${list.id}`}
              className="flex items-center gap-2 text-blue-400 font-medium hover:gap-3 transition-all"
            >
              <span>Xem chi tiết</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ))}
      </div>

      {playlists.length === 0 && !loading && (
        <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800">
          <p className="text-xl text-slate-400">Bạn chưa có danh sách nào. Hãy tạo một danh sách mới!</p>
        </div>
      )}
    </div>
  );
}
