import { useState, useEffect } from 'react';
import { getMovies } from '../services/tmdbApi';

export const useMovies = () => {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const [trending, popular, topRated] = await Promise.all([
          getMovies('trending'),
          getMovies('popular'),
          getMovies('top_rated')
        ]);

        setTrendingMovies(trending);
        setPopularMovies(popular);
        setTopRatedMovies(topRated);
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  return {
    trendingMovies,
    popularMovies,
    topRatedMovies,
    loading
  };
}; 