import { getMovieDetail } from '@/lib/tmdb';
import { Star, Clock, Calendar, Play, MonitorPlay } from 'lucide-react';
import MovieCard from '@/components/MovieCard';
import ActionButtons from '@/components/ActionButtons';
import TrailerModal from '@/components/TrailerModal';

export default async function MovieDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const movie = await getMovieDetail(id);

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-12">
      {/* Backdrop Section */}
      <section className="relative h-[500px] -mt-8 -mx-4 md:-mx-8 lg:-mx-12 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
            alt={movie.title}
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
        </div>

        <div className="absolute inset-0 container mx-auto px-4 flex flex-col md:flex-row items-end gap-8 pb-12">
          <div className="w-48 md:w-64 shrink-0 shadow-2xl rounded-xl overflow-hidden hidden md:block">
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="space-y-6 flex-grow">
            <div className="flex flex-wrap gap-2">
              {movie.genres.map((g: any) => (
                <span key={g.id} className="bg-blue-600/20 text-blue-400 border border-blue-600/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {g.name}
                </span>
              ))}
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black">{movie.title}</h1>
            
            <div className="flex flex-wrap items-center gap-6 text-slate-300 font-medium">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="text-white text-lg font-bold">{movie.vote_average.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{formatRuntime(movie.runtime)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{new Date(movie.release_date).getFullYear()}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-all hover:scale-105 shadow-lg shadow-green-900/30">
                <MonitorPlay className="w-5 h-5 fill-current" />
                <span>Xem phim</span>
              </button>
              <TrailerModal videos={movie.videos.results} />
              <ActionButtons movieId={movie.id} />
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <div className="grid md:grid-cols-3 gap-12">
        <div className="md:col-span-2 space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">Nội dung phim</h2>
            <p className="text-lg text-slate-300 leading-relaxed">
              {movie.overview || "Đang cập nhật nội dung..."}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Diễn viên chính</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {movie.credits.cast.slice(0, 10).map((actor: any) => (
                <div key={actor.id} className="shrink-0 w-32 text-center">
                  <div className="w-full aspect-square rounded-full overflow-hidden mb-2 border-2 border-slate-800">
                    <img
                      src={actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : 'https://via.placeholder.com/185x185?text=No+Image'}
                      alt={actor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-sm font-bold truncate">{actor.name}</p>
                  <p className="text-xs text-slate-500 truncate">{actor.character}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">Thông tin thêm</h2>
            <div className="space-y-4 bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
              <div>
                <p className="text-slate-500 text-sm">Trạng thái</p>
                <p className="font-medium">{movie.status}</p>
              </div>
              <div>
                <p className="text-slate-500 text-sm">Ngôn ngữ gốc</p>
                <p className="font-medium uppercase">{movie.original_language}</p>
              </div>
              <div>
                <p className="text-slate-500 text-sm">Doanh thu</p>
                <p className="font-medium">${movie.revenue.toLocaleString()}</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Similar Movies */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Phim tương tự</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {movie.similar.results.slice(0, 6).map((movie: any) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>
    </div>
  );
}
