import axios from 'axios';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = 'YOUR_TMDB_API_KEY'; // Replace with your actual API key

const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
    language: 'en-US',
    region: 'IN'
  }
});

export const getMovies = async (type = 'trending') => {
  try {
    let endpoint;
    switch (type) {
      case 'trending':
        endpoint = '/trending/movie/week';
        break;
      case 'popular':
        endpoint = '/movie/popular';
        break;
      case 'top_rated':
        endpoint = '/movie/top_rated';
        break;
      default:
        endpoint = '/trending/movie/week';
    }
    
    const response = await tmdbApi.get(endpoint);
    return response.data.results;
  } catch (error) {
    console.error('Error fetching movies:', error);
    return [];
  }
};

export const getMovieDetails = async (movieId) => {
  try {
    const [details, credits, videos] = await Promise.all([
      tmdbApi.get(`/movie/${movieId}`),
      tmdbApi.get(`/movie/${movieId}/credits`),
      tmdbApi.get(`/movie/${movieId}/videos`)
    ]);
    
    return {
      ...details.data,
      credits: credits.data,
      videos: videos.data
    };
  } catch (error) {
    console.error('Error fetching movie details:', error);
    return null;
  }
};

export const searchMovies = async (query) => {
  try {
    const response = await tmdbApi.get('/search/movie', {
      params: { query }
    });
    return response.data.results;
  } catch (error) {
    console.error('Error searching movies:', error);
    return [];
  }
}; 