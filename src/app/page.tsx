import { tmdb } from '@/lib/tmdb';
import MovieCard from '@/components/MovieCard';
import Link from 'next/link';

async function getMovies(type: string) {
  const { data } = await tmdb.get(type);
  return data.results;
}

export default async function Home() {
  const [trending, topRated, upcoming, genres] = await Promise.all([
    getMovies('/trending/movie/week'),
    getMovies('/movie/top_rated'),
    getMovies('/movie/upcoming'),
    tmdb.get('/genre/movie/list').then(res => res.data.genres)
  ]);

  const heroMovie = trending[0];

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative h-[500px] md:h-[600px] -mt-8 -mx-4 md:-mx-8 lg:-mx-12 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={`https://image.tmdb.org/t/p/original${heroMovie?.backdrop_path}`}
            alt={heroMovie?.title}
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-transparent to-transparent" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center max-w-3xl space-y-6">
          <div className="flex gap-2">
            <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Trending Now
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
            {heroMovie?.title}
          </h1>
          <p className="text-lg md:text-xl text-slate-300 line-clamp-3">
            {heroMovie?.overview}
          </p>
          <div className="flex gap-4 pt-4">
            <Link 
              href={`/movie/${heroMovie?.id}`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-full font-bold transition-all hover:scale-105 shadow-xl shadow-blue-900/20"
            >
              Xem ngay
            </Link>
            <button 
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-10 py-4 rounded-full font-bold transition-all"
            >
              + Danh sách
            </button>
          </div>
        </div>
      </section>

      {/* Genres Bar */}
      <section className="container mx-auto px-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-3 pb-2">
          {genres.map((genre: any) => (
            <Link
              key={genre.id}
              href={`/genre/${genre.id}`}
              className="whitespace-nowrap bg-slate-900 hover:bg-blue-600 border border-slate-800 px-6 py-2 rounded-full text-sm font-semibold transition-all"
            >
              {genre.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Movies */}
      <section className="container mx-auto px-4 space-y-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-black">Phim thịnh hành</h2>
            <p className="text-slate-500 mt-1">Những bộ phim được xem nhiều nhất tuần này</p>
          </div>
          <Link href="/trending" className="text-blue-400 hover:text-blue-300 font-bold transition-colors">
            Xem tất cả
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
          {trending.slice(0, 12).map((movie: any) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      {/* Top Rated */}
      <section className="container mx-auto px-4 space-y-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-black">Đánh giá cao</h2>
            <p className="text-slate-500 mt-1">Phim có điểm số cao nhất từ cộng đồng</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
          {topRated.slice(0, 6).map((movie: any) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      {/* Upcoming */}
      <section className="container mx-auto px-4 space-y-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-black">Sắp chiếu</h2>
            <p className="text-slate-500 mt-1">Đừng bỏ lỡ những siêu phẩm sắp ra mắt</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
          {upcoming.slice(0, 6).map((movie: any) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>
    </div>
  );
}
