import { getMoviesByGenre, getGenres } from '@/lib/tmdb';
import MovieCard from '@/components/MovieCard';

export default async function GenrePage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const genres = await getGenres();
  const genre = genres.find((g: any) => g.id.toString() === id);
  const { results: movies } = await getMoviesByGenre(id);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Thể loại: {genre?.name || 'Đang tải...'}</h1>
          <p className="text-slate-400 mt-2">Khám phá những bộ phim thuộc thể loại {genre?.name?.toLowerCase()}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {movies.map((movie: any) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
}
