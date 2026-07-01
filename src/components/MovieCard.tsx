'use client';

import Link from 'next/link';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
}

export default function MovieCard({ movie }: { movie: Movie }) {
  const imageUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/movie/${movie.id}`} className="group relative bg-slate-800 rounded-xl overflow-hidden shadow-lg block h-full">
        <div className="aspect-[2/3] relative">
          <img
            src={imageUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-bold">{movie.vote_average.toFixed(1)}</span>
          </div>
        </div>
        
        <div className="p-3">
          <h3 className="font-semibold text-sm truncate group-hover:text-blue-400 transition-colors">
            {movie.title}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {new Date(movie.release_date).getFullYear()}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
