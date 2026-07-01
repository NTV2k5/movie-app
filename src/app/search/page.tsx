import { searchMovies } from '@/lib/tmdb';
import MovieCard from '@/components/MovieCard';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q: string };
}) {
  const query = (await searchParams).q;
  const { results: movies } = await searchMovies(query);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Kết quả tìm kiếm cho: "{query}"</h1>
        <p className="text-slate-400 mt-2">Tìm thấy {movies.length} phim phù hợp</p>
      </div>

      {movies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {movies.map((movie: any) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800">
          <p className="text-xl text-slate-400">Không tìm thấy phim nào phù hợp với yêu cầu của bạn.</p>
        </div>
      )}
    </div>
  );
}
