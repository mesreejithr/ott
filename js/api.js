const TMDB_API_KEY = '14f8ac39fa19f5ca9639b37b3923431b';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const INDIAN_LANGUAGES = {
    hi: 'Hindi',
    te: 'Telugu',
    ta: 'Tamil',
    ml: 'Malayalam',
    kn: 'Kannada',
    mr: 'Marathi',
    pa: 'Punjabi',
    bn: 'Bengali',
    gu: 'Gujarati'
};

const STREAMING_SERVICES = {
    'Netflix': 8,
    'Amazon Prime Video': 119,
    'Disney Plus': 337,
    'Hotstar': 122,
    'SonyLIV': 237,
    'Zee5': 232,
    'Voot': 121,
    'JioCinema': 220,
    'MX Player': 209,
    'Aha': 532
};

const STREAMING_URLS = {
    'Netflix': 'https://www.netflix.com/in/',
    'Amazon Prime Video': 'https://www.primevideo.com/',
    'Disney Plus': 'https://www.hotstar.com/',
    'Hotstar': 'https://www.hotstar.com/',
    'SonyLIV': 'https://www.sonyliv.com/',
    'Zee5': 'https://www.zee5.com/',
    'Voot': 'https://www.voot.com/',
    'JioCinema': 'https://www.jiocinema.com/',
    'MX Player': 'https://www.mxplayer.in/',
    'Aha': 'https://www.aha.video/'
};

const MOVIE_GENRES = [
    { id: 28, name: "Action" },
    { id: 12, name: "Adventure" },
    { id: 16, name: "Animation" },
    { id: 35, name: "Comedy" },
    { id: 80, name: "Crime" },
    { id: 18, name: "Drama" },
    { id: 10751, name: "Family" },
    { id: 14, name: "Fantasy" },
    { id: 36, name: "History" },
    { id: 27, name: "Horror" },
    { id: 10402, name: "Music" },
    { id: 9648, name: "Mystery" },
    { id: 10749, name: "Romance" },
    { id: 878, name: "Science Fiction" },
    { id: 53, name: "Thriller" },
    { id: 10752, name: "War" }
];

class MovieAPI {
    static async fetchMovies(type, language = '') {
        try {
            let endpoint;
            let params = new URLSearchParams({
                api_key: TMDB_API_KEY,
                language: 'en-US',
                region: 'IN'
            });

            switch (type) {
                case 'trending':
                    endpoint = '/discover/movie';
                    params.append('sort_by', 'popularity.desc');
                    break;
                case 'popular':
                    endpoint = '/discover/movie';
                    params.append('sort_by', 'popularity.desc');
                    break;
                case 'top_rated':
                    endpoint = '/discover/movie';
                    params.append('sort_by', 'vote_average.desc');
                    params.append('vote_count.gte', '50');
                    break;
            }

            // Add language filter
            if (language) {
                params.append('with_original_language', language);
            } else {
                // If no specific language, include all Indian languages
                params.append('with_original_language', Object.keys(INDIAN_LANGUAGES).join('|'));
            }

            // Common parameters
            params.append('with_origin_country', 'IN');
            params.append('page', '1');
            params.append('include_adult', 'false');

            const url = `${BASE_URL}${endpoint}?${params.toString()}`;
            console.log(`Fetching ${type} movies:`, url);

            const response = await fetch(url);
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
                console.log(`Found ${data.results.length} movies for ${type}`);
                return data.results;
            } else {
                console.log(`No movies found for ${type}`);
                return [];
            }
        } catch (error) {
            console.error('Error fetching movies:', error);
            return [];
        }
    }

    static async fetchTVShows(language = '') {
        try {
            const params = new URLSearchParams({
                api_key: TMDB_API_KEY,
                language: 'en-US',
                with_origin_country: 'IN',
                sort_by: 'popularity.desc',
                page: '1'
            });

            if (language) {
                params.append('with_original_language', language);
            } else {
                params.append('with_original_language', Object.keys(INDIAN_LANGUAGES).join('|'));
            }

            const url = `${BASE_URL}/discover/tv?${params.toString()}`;
            console.log('Fetching TV Shows:', url);

            const response = await fetch(url);
            const data = await response.json();

            if (data.results && data.results.length > 0) {
                console.log(`Found ${data.results.length} TV shows`);
                return data.results;
            } else {
                console.log('No TV shows found');
                return [];
            }
        } catch (error) {
            console.error('Error fetching TV shows:', error);
            return [];
        }
    }

    static async getMovieDetails(movieId) {
        try {
            const url = `${BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos`;
            const response = await fetch(url);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching movie details:', error);
            return null;
        }
    }

    static async searchMovies(query) {
        try {
            const params = new URLSearchParams({
                api_key: TMDB_API_KEY,
                query: query,
                language: 'en-US',
                region: 'IN',
                include_adult: 'false',
                page: '1'
            });

            const url = `${BASE_URL}/search/movie?${params.toString()}`;
            const response = await fetch(url);
            const data = await response.json();

            return data.results.filter(movie => 
                movie.original_language in INDIAN_LANGUAGES
            );
        } catch (error) {
            console.error('Error searching movies:', error);
            return [];
        }
    }

    static async fetchOTTMovies(type, language = '') {
        try {
            let params = new URLSearchParams({
                api_key: TMDB_API_KEY,
                language: 'en-US',
                region: 'IN',
                page: '1',
                include_adult: 'false'
            });

            // Add language filter
            if (language) {
                params.append('with_original_language', language);
            } else {
                params.append('with_original_language', Object.keys(INDIAN_LANGUAGES).join('|'));
            }

            // Common parameters
            params.append('with_origin_country', 'IN');
            
            switch (type) {
                case 'trending':
                    params.append('sort_by', 'popularity.desc');
                    break;
                case 'popular':
                    params.append('sort_by', 'popularity.desc');
                    break;
                case 'top_rated':
                    params.append('sort_by', 'vote_average.desc');
                    params.append('vote_count.gte', '50');
                    break;
            }

            const url = `${BASE_URL}/discover/movie?${params.toString()}`;
            console.log(`Fetching ${type} movies:`, url);

            const response = await fetch(url);
            const data = await response.json();
            
            if (!data.results?.length) {
                console.log(`No movies found for ${type}`);
                return [];
            }

            // Get streaming information for each movie
            const moviesWithOTT = await Promise.all(
                data.results.map(async movie => {
                    const ottInfo = await this.getStreamingProviders(movie.id);
                    return {
                        ...movie,
                        streaming_info: ottInfo
                    };
                })
            );

            // Filter movies that are available on OTT platforms
            const ottMovies = moviesWithOTT.filter(movie => 
                movie.streaming_info && Object.keys(movie.streaming_info).length > 0
            );

            console.log(`Found ${ottMovies.length} OTT movies for ${type}`);
            return ottMovies;
        } catch (error) {
            console.error('Error fetching OTT movies:', error);
            return [];
        }
    }

    static async getStreamingProviders(movieId) {
        try {
            const url = `${BASE_URL}/movie/${movieId}/watch/providers?api_key=${TMDB_API_KEY}`;
            const response = await fetch(url);
            const data = await response.json();

            // Get Indian streaming providers
            const inProviders = data.results?.IN;
            if (!inProviders) return null;

            const streamingInfo = {};

            // Include both flatrate and rent/buy options
            if (inProviders.flatrate || inProviders.rent || inProviders.buy) {
                streamingInfo.platforms = [
                    ...(inProviders.flatrate || []),
                    ...(inProviders.rent || []),
                    ...(inProviders.buy || [])
                ].map(provider => ({
                    name: provider.provider_name,
                    logo: `https://image.tmdb.org/t/p/original${provider.logo_path}`
                }));

                // Remove duplicates
                streamingInfo.platforms = Array.from(
                    new Map(streamingInfo.platforms.map(p => [p.name, p])).values()
                );
            }

            // Get release dates
            const releaseDates = await this.getReleaseDates(movieId);
            if (releaseDates?.digital) {
                streamingInfo.digital_release = releaseDates.digital;
            }

            return Object.keys(streamingInfo).length > 0 ? streamingInfo : null;
        } catch (error) {
            console.error('Error fetching streaming providers:', error);
            return null;
        }
    }

    static async getReleaseDates(movieId) {
        try {
            const url = `${BASE_URL}/movie/${movieId}/release_dates?api_key=${TMDB_API_KEY}`;
            const response = await fetch(url);
            const data = await response.json();

            // Find Indian release dates
            const inReleases = data.results?.find(country => country.iso_3166_1 === 'IN');
            if (!inReleases?.release_dates) return null;

            const releases = {};
            inReleases.release_dates.forEach(release => {
                // Type 4 is Digital release
                if (release.type === 4) {
                    releases.digital = release.release_date;
                }
                // Type 3 is Theatrical release
                else if (release.type === 3) {
                    releases.theatrical = release.release_date;
                }
            });

            return releases;
        } catch (error) {
            console.error('Error fetching release dates:', error);
            return null;
        }
    }

    // Update the movie card creation in app.js to show OTT information
    static createMovieCard(movie) {
        const streamingInfo = movie.streaming_info;
        const digitalDate = streamingInfo?.digital_release ? 
            new Date(streamingInfo.digital_release).toLocaleDateString() : 'N/A';
        
        const platforms = streamingInfo?.platforms?.map(p => p.name).join(', ') || 'N/A';

        return `
            <div class="movie-card" data-id="${movie.id}">
                <img src="${IMAGE_BASE_URL}${movie.poster_path}" alt="${movie.title}" 
                     onerror="this.src='images/placeholder.jpg'">
                <div class="movie-info">
                    <h3>${movie.title}</h3>
                    <div class="movie-meta">
                        <span>${new Date(movie.release_date).getFullYear()}</span>
                        <span>⭐ ${movie.vote_average.toFixed(1)}</span>
                        <span>${INDIAN_LANGUAGES[movie.original_language] || 'Other'}</span>
                    </div>
                    <div class="ott-info">
                        <p><strong>OTT Release:</strong> ${digitalDate}</p>
                        <p><strong>Available on:</strong> ${platforms}</p>
                    </div>
                </div>
            </div>
        `;
    }

    static async fetchLatestReleases(language = '') {
        try {
            // First, get watch providers for Indian OTT platforms
            const ottProviderIds = Object.values(STREAMING_SERVICES).join('|');
            
            const params = new URLSearchParams({
                api_key: TMDB_API_KEY,
                language: 'en-US',
                region: 'IN',
                page: '1',
                include_adult: 'false',
                sort_by: 'primary_release_date.desc',
                'vote_count.gte': '0',
                with_watch_providers: ottProviderIds,
                watch_region: 'IN'
            });

            if (language) {
                params.append('with_original_language', language);
            } else {
                params.append('with_original_language', Object.keys(INDIAN_LANGUAGES).join('|'));
            }

            // Add current date as maximum date to ensure we get released movies
            const today = new Date();
            params.append('primary_release_date.lte', today.toISOString().split('T')[0]);
            // Get movies released in the last 90 days
            const threeMonthsAgo = new Date(today.setMonth(today.getMonth() - 3));
            params.append('primary_release_date.gte', threeMonthsAgo.toISOString().split('T')[0]);

            const url = `${BASE_URL}/discover/movie?${params.toString()}`;
            console.log('Fetching Latest Releases:', url);

            const response = await fetch(url);
            const data = await response.json();
            
            if (!data.results?.length) {
                console.log('No latest releases found');
                return [];
            }

            // Get streaming information for each movie
            const moviesWithOTT = await Promise.all(
                data.results.map(async movie => {
                    const ottInfo = await this.getStreamingProviders(movie.id);
                    return {
                        ...movie,
                        streaming_info: ottInfo
                    };
                })
            );

            // Filter and sort by digital release date
            const ottMovies = moviesWithOTT
                .filter(movie => movie.streaming_info && movie.streaming_info.platforms)
                .sort((a, b) => {
                    const dateA = a.streaming_info?.digital_release ? new Date(a.streaming_info.digital_release) : new Date(0);
                    const dateB = b.streaming_info?.digital_release ? new Date(b.streaming_info.digital_release) : new Date(0);
                    return dateB - dateA;
                })
                .slice(0, 12); // Show more latest releases

            console.log(`Found ${ottMovies.length} latest OTT releases`);
            return ottMovies;
        } catch (error) {
            console.error('Error fetching latest releases:', error);
            return [];
        }
    }

    static async fetchLatestTheatreReleases(language = '') {
        try {
            const params = new URLSearchParams({
                api_key: TMDB_API_KEY,
                language: 'en-US',
                region: 'IN',
                page: '1',
                include_adult: 'false',
                sort_by: 'primary_release_date.desc',
                'vote_count.gte': '0'
            });

            if (language) {
                params.append('with_original_language', language);
            } else {
                params.append('with_original_language', Object.keys(INDIAN_LANGUAGES).join('|'));
            }

            // Get movies released in theatres in the last 30 days
            const today = new Date();
            params.append('primary_release_date.lte', today.toISOString().split('T')[0]);
            const oneMonthAgo = new Date(today.setMonth(today.getMonth() - 1));
            params.append('primary_release_date.gte', oneMonthAgo.toISOString().split('T')[0]);

            const url = `${BASE_URL}/discover/movie?${params.toString()}`;
            console.log('Fetching Latest Theatre Releases:', url);

            const response = await fetch(url);
            const data = await response.json();
            
            if (!data.results?.length) {
                console.log('No theatre releases found');
                return [];
            }

            // Get release dates for each movie
            const moviesWithDates = await Promise.all(
                data.results.map(async movie => {
                    const releaseDates = await this.getReleaseDates(movie.id);
                    return {
                        ...movie,
                        release_info: {
                            theatrical: releaseDates?.theatrical,
                            digital: releaseDates?.digital
                        }
                    };
                })
            );

            // Filter and sort by theatrical release date
            const theatreMovies = moviesWithDates
                .filter(movie => movie.release_info?.theatrical)
                .sort((a, b) => {
                    const dateA = new Date(a.release_info.theatrical);
                    const dateB = new Date(b.release_info.theatrical);
                    return dateB - dateA;
                })
                .slice(0, 12);

            console.log(`Found ${theatreMovies.length} latest theatre releases`);
            return theatreMovies;
        } catch (error) {
            console.error('Error fetching theatre releases:', error);
            return [];
        }
    }

    static async fetchTheatreReleases(type, language = '') {
        try {
            const params = new URLSearchParams({
                api_key: TMDB_API_KEY,
                language: 'en-US',
                region: 'IN',
                page: '1',
                include_adult: 'false',
                'vote_count.gte': '0'
            });

            // Add sorting based on type
            if (type === 'trending') {
                params.append('sort_by', 'popularity.desc');
            } else if (type === 'popular') {
                params.append('sort_by', 'vote_count.desc');
            }

            if (language) {
                params.append('with_original_language', language);
            } else {
                params.append('with_original_language', Object.keys(INDIAN_LANGUAGES).join('|'));
            }

            // Get movies released in theatres in the last 60 days
            const today = new Date();
            params.append('primary_release_date.lte', today.toISOString().split('T')[0]);
            const twoMonthsAgo = new Date(today.setMonth(today.getMonth() - 2));
            params.append('primary_release_date.gte', twoMonthsAgo.toISOString().split('T')[0]);

            const url = `${BASE_URL}/discover/movie?${params.toString()}`;
            console.log(`Fetching ${type} Theatre Releases:`, url);

            const response = await fetch(url);
            const data = await response.json();
            
            if (!data.results?.length) {
                console.log(`No ${type} theatre releases found`);
                return [];
            }

            // Get release dates for each movie
            const moviesWithDates = await Promise.all(
                data.results.map(async movie => {
                    const releaseDates = await this.getReleaseDates(movie.id);
                    return {
                        ...movie,
                        release_info: {
                            theatrical: releaseDates?.theatrical,
                            digital: releaseDates?.digital
                        }
                    };
                })
            );

            // Filter for theatre releases and sort
            const theatreMovies = moviesWithDates
                .filter(movie => movie.release_info?.theatrical)
                .slice(0, 12);

            console.log(`Found ${theatreMovies.length} ${type} theatre releases`);
            return theatreMovies;
        } catch (error) {
            console.error(`Error fetching ${type} theatre releases:`, error);
            return [];
        }
    }

    static async fetchAllMovies(filters = {}) {
        try {
            console.log('Fetching all movies with filters:', filters);
            const params = new URLSearchParams({
                api_key: TMDB_API_KEY,
                language: 'en-US',
                region: 'IN',
                page: '1',
                include_adult: 'false',
                with_origin_country: 'IN',
                sort_by: 'popularity.desc'
            });

            if (filters.genre) {
                console.log('Adding genre filter:', filters.genre);
                params.append('with_genres', filters.genre);
            }
            if (filters.year) {
                console.log('Adding year filter:', filters.year);
                params.append('primary_release_year', filters.year);
            }
            if (filters.language) {
                console.log('Adding language filter:', filters.language);
                params.append('with_original_language', filters.language);
            }

            const url = `${BASE_URL}/discover/movie?${params.toString()}`;
            console.log('Fetching filtered movies:', url);
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            if (!data.results?.length) {
                console.log('No movies found with current filters');
                return [];
            }

            console.log(`Found ${data.results.length} movies before filtering`);

            // Get streaming information for each movie
            const moviesWithInfo = await Promise.all(
                data.results.map(async movie => {
                    try {
                        const streamingInfo = await this.getStreamingProviders(movie.id);
                        const releaseDates = await this.getReleaseDates(movie.id);
                        return {
                            ...movie,
                            streaming_info: streamingInfo,
                            release_info: {
                                theatrical: releaseDates?.theatrical,
                                digital: releaseDates?.digital
                            }
                        };
                    } catch (error) {
                        console.error(`Error fetching additional info for movie ${movie.id}:`, error);
                        return movie;
                    }
                })
            );

            console.log(`Processed ${moviesWithInfo.length} movies with additional info`);
            return moviesWithInfo;
        } catch (error) {
            console.error('Error fetching all movies:', error);
            throw error; // Re-throw to handle in the UI
        }
    }
} 