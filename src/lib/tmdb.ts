import axios from 'axios';

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export const tmdb = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
    language: 'vi-VN',
  },
});

export const getTrendingMovies = async (page = 1) => {
  const { data } = await tmdb.get('/trending/movie/week', { params: { page } });
  return data;
};

export const getMoviesByGenre = async (genreId: string, page = 1) => {
  const { data } = await tmdb.get('/discover/movie', { params: { with_genres: genreId, page } });
  return data;
};

export const getMovieDetail = async (movieId: string) => {
  const { data } = await tmdb.get(`/movie/${movieId}`, { params: { append_to_response: 'videos,credits,similar' } });
  return data;
};

export const getGenres = async () => {
  const { data } = await tmdb.get('/genre/movie/list');
  return data.genres;
};

export const searchMovies = async (query: string, page = 1) => {
  const { data } = await tmdb.get('/search/movie', { params: { query, page } });
  return data;
};
