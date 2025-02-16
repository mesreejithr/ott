class MovieApp {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.currentLanguage = '';
        this.setupLanguageFilter();
        this.loadMovies();
        this.watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
        this.currentSection = 'home';
        this.setupNavigation();
    }

    initializeElements() {
        this.latestGrid = document.querySelector('#latestReleases .movie-grid');
        this.latestTheatreGrid = document.querySelector('#latestTheatreReleases .movie-grid');
        this.trendingGrid = document.querySelector('#trendingMovies .movie-grid');
        this.popularGrid = document.querySelector('#popularMovies .movie-grid');
        this.topRatedGrid = document.querySelector('#topRatedMovies .movie-grid');
        this.searchInput = document.getElementById('searchInput');
        this.searchButton = document.getElementById('searchButton');
        this.modal = document.getElementById('movieModal');
        this.modalContent = document.getElementById('movieDetails');
        this.closeModal = document.querySelector('.close');
        this.darkModeToggle = document.getElementById('darkModeToggle');
        this.trendingTheatreGrid = document.querySelector('#trendingTheatreReleases .movie-grid');
        this.popularTheatreGrid = document.querySelector('#popularTheatreReleases .movie-grid');
    }

    setupEventListeners() {
        this.searchButton.addEventListener('click', () => this.handleSearch());
        this.searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            } else if (this.searchInput.value.trim() === '') {
                // Reset to original content when search is cleared
                const sections = document.querySelectorAll('.movie-section');
                sections.forEach(section => {
                    section.style.display = 'block';
                });
                this.loadMovies();
            }
        });
        this.closeModal.addEventListener('click', () => this.modal.style.display = 'none');
        this.darkModeToggle.addEventListener('click', () => this.toggleDarkMode());
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) this.modal.style.display = 'none';
        });
    }

    setupLanguageFilter() {
        const languageSelector = document.createElement('div');
        languageSelector.className = 'language-filter';
        languageSelector.innerHTML = `
            <select id="languageSelect">
                <option value="">All Languages</option>
                ${Object.entries(INDIAN_LANGUAGES).map(([code, name]) => 
                    `<option value="${code}">${name}</option>`
                ).join('')}
            </select>
        `;

        document.querySelector('.search-container').appendChild(languageSelector);
        
        document.getElementById('languageSelect').addEventListener('change', (e) => {
            this.currentLanguage = e.target.value;
            this.loadMovies();
        });
    }

    async loadMovies() {
        try {
            this.showLoading();

            const [
                latest, 
                latestTheatre,
                trendingTheatre,
                popularTheatre, 
                trending, 
                popular, 
                tvShows
            ] = await Promise.all([
                MovieAPI.fetchLatestReleases(this.currentLanguage),
                MovieAPI.fetchLatestTheatreReleases(this.currentLanguage),
                MovieAPI.fetchTheatreReleases('trending', this.currentLanguage),
                MovieAPI.fetchTheatreReleases('popular', this.currentLanguage),
                MovieAPI.fetchOTTMovies('trending', this.currentLanguage),
                MovieAPI.fetchOTTMovies('popular', this.currentLanguage),
                MovieAPI.fetchTVShows(this.currentLanguage)
            ]);

            const languageName = this.currentLanguage ? 
                INDIAN_LANGUAGES[this.currentLanguage] : 'Indian';

            document.querySelector('#latestReleases h2').textContent = 
                `Latest ${languageName} OTT Releases`;
            document.querySelector('#latestTheatreReleases h2').textContent = 
                `Latest ${languageName} Theatre Releases`;
            document.querySelector('#trendingTheatreReleases h2').textContent = 
                `Trending ${languageName} Theatre Releases`;
            document.querySelector('#popularTheatreReleases h2').textContent = 
                `Popular ${languageName} Theatre Releases`;
            document.querySelector('#trendingMovies h2').textContent = 
                `Trending ${languageName} OTT Releases`;
            document.querySelector('#popularMovies h2').textContent = 
                `Popular ${languageName} OTT Movies`;
            document.querySelector('#topRatedMovies h2').textContent = 
                `${languageName} TV Shows`;

            if (latest?.length) this.renderMovies(latest, this.latestGrid);
            if (latestTheatre?.length) this.renderMovies(latestTheatre, this.latestTheatreGrid);
            if (trendingTheatre?.length) this.renderMovies(trendingTheatre, this.trendingTheatreGrid);
            if (popularTheatre?.length) this.renderMovies(popularTheatre, this.popularTheatreGrid);
            if (trending?.length) this.renderMovies(trending, this.trendingGrid);
            if (popular?.length) this.renderMovies(popular, this.popularGrid);
            if (tvShows?.length) this.renderMovies(tvShows, this.topRatedGrid);

            this.hideLoading();
        } catch (error) {
            console.error('Error loading movies:', error);
            this.showError('Failed to load content. Please try again later.');
        }
    }

    renderMovies(movies, container) {
        container.innerHTML = movies.map(movie => this.createMovieCard(movie)).join('');
        
        // Add click handlers for movie cards
        container.querySelectorAll('.movie-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't open modal if clicking on a platform link
                if (!e.target.closest('.platform-tag')) {
                    this.showMovieDetails(card.dataset.id);
                }
            });
        });

        // Add click handlers for platform links
        container.querySelectorAll('.platform-tag').forEach(link => {
            link.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent movie card click
            });
        });
    }

    createMovieCard(item) {
        if (!item?.poster_path) return '';

        const title = item.title || item.name;
        const releaseDate = item.release_date || item.first_air_date;
        const mediaType = item.title ? 'movie' : 'tv';
        
        // Format OTT release date
        let ottReleaseDate = 'Coming Soon';
        let releaseBadgeClass = 'coming-soon';
        
        if (item.streaming_info?.digital_release) {
            const releaseDate = new Date(item.streaming_info.digital_release);
            ottReleaseDate = releaseDate.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        }

        // Get streaming platforms with fallback
        const platforms = item.streaming_info?.platforms || [];
        const platformTags = platforms.length > 0 
            ? `<div class="platform-list">
                ${platforms.map(p => `
                    <a href="${STREAMING_URLS[p.name]}" 
                       class="platform-tag" 
                       data-platform="${p.name}"
                       target="_blank"
                       rel="noopener noreferrer">
                        ${p.name}
                    </a>
                `).join('')}
               </div>`
            : '<span class="no-platforms">Not yet available on OTT</span>';

        // Format theatrical release with fallback
        const theatricalDate = item.release_info?.theatrical 
            ? new Date(item.release_info.theatrical).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            }) 
            : item.release_date 
                ? new Date(item.release_date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                })
                : null;

        const isInWatchlist = this.watchlist.some(m => m.id === item.id);
        const watchlistBtn = `
            <button class="watchlist-btn" onclick="event.stopPropagation(); app.${isInWatchlist ? 'removeFrom' : 'addTo'}Watchlist(${JSON.stringify(item)})">
                <i class="fas fa-${isInWatchlist ? 'check' : 'plus'}"></i>
            </button>
        `;

        return `
            <div class="movie-card" data-id="${item.id}" data-type="${mediaType}">
                <img src="${IMAGE_BASE_URL}${item.poster_path}" alt="${title}" 
                     onerror="this.src='images/placeholder.jpg'">
                <div class="movie-info">
                    <h3>${title}</h3>
                    <div class="movie-meta">
                        <span>${releaseDate ? new Date(releaseDate).getFullYear() : 'N/A'}</span>
                        <span>⭐ ${item.vote_average?.toFixed(1) || 'N/A'}</span>
                        <span>${INDIAN_LANGUAGES[item.original_language] || 'Other'}</span>
                    </div>
                    <div class="ott-info">
                        ${theatricalDate ? 
                            `<p><strong>In Theatres:</strong> ${theatricalDate}</p>` : ''}
                        <p>
                            <strong>OTT:</strong>
                            <span class="ott-release-date ${releaseBadgeClass}">
                                ${ottReleaseDate}
                            </span>
                        </p>
                        ${platformTags}
                    </div>
                </div>
                ${watchlistBtn}
            </div>
        `;
    }

    async showMovieDetails(movieId) {
        const movie = await MovieAPI.getMovieDetails(movieId);
        if (!movie) return;

        const trailer = movie.videos.results.find(video => video.type === 'Trailer');
        const streamingInfo = movie.streaming_info || {};
        
        // Format dates
        const theatricalDate = movie.release_date ? 
            new Date(movie.release_date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            }) : 'N/A';
        
        const ottDate = streamingInfo.digital_release ? 
            new Date(streamingInfo.digital_release).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            }) : 'Coming Soon';

        const platforms = streamingInfo.platforms?.map(p => p.name).join(', ') || 'Not Available';
        
        this.modalContent.innerHTML = `
            <h2>${movie.title}</h2>
            <div class="movie-detail-content">
                <img src="${IMAGE_BASE_URL}${movie.poster_path}" alt="${movie.title}">
                <div class="movie-info-detail">
                    <p>${movie.overview}</p>
                    <div class="release-dates">
                        <p><strong>Theatrical Release:</strong> ${theatricalDate}</p>
                        <p><strong>OTT Release:</strong> ${ottDate}</p>
                        <p><strong>Streaming on:</strong> ${platforms}</p>
                    </div>
                    <p><strong>Rating:</strong> ⭐ ${movie.vote_average.toFixed(1)}</p>
                    <p><strong>Runtime:</strong> ${movie.runtime} minutes</p>
                    <p><strong>Genres:</strong> ${movie.genres.map(g => g.name).join(', ')}</p>
                    ${trailer ? `
                        <div class="trailer">
                            <h3>Trailer</h3>
                            <iframe width="560" height="315" 
                                src="https://www.youtube.com/embed/${trailer.key}" 
                                frameborder="0" allowfullscreen>
                            </iframe>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        this.modal.style.display = 'block';
    }

    async handleSearch() {
        const query = this.searchInput.value.trim();
        if (!query) {
            // If search is empty, reload original content
            this.loadMovies();
            return;
        }

        try {
            this.showLoading();
            const results = await MovieAPI.searchMovies(query);

            // Hide all sections first
            const sections = document.querySelectorAll('.movie-section');
            sections.forEach(section => {
                section.style.display = 'none';
            });

            // Show and update search results section
            const searchSection = document.querySelector('#trendingMovies');
            searchSection.style.display = 'block';
            searchSection.querySelector('h2').textContent = `Search Results for "${query}"`;
            
            if (results.length > 0) {
                this.renderMovies(results, this.trendingGrid);
            } else {
                this.trendingGrid.innerHTML = `
                    <div class="error">
                        No movies found for "${query}"
                        <button class="clear-search">Clear Search</button>
                    </div>
                `;
            }

            // Add clear search button
            const clearButton = document.createElement('button');
            clearButton.className = 'clear-search';
            clearButton.textContent = 'Clear Search';
            searchSection.querySelector('h2').appendChild(clearButton);

            // Add clear search functionality
            clearButton.addEventListener('click', () => {
                this.searchInput.value = '';
                sections.forEach(section => {
                    section.style.display = 'block';
                });
                this.loadMovies();
            });

        } catch (error) {
            console.error('Error searching movies:', error);
            this.showError('Failed to search movies. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    toggleDarkMode() {
        document.body.classList.toggle('light-mode');
        const icon = this.darkModeToggle.querySelector('i');
        icon.classList.toggle('fa-moon');
        icon.classList.toggle('fa-sun');
    }

    showLoading() {
        [
            this.latestGrid,
            this.latestTheatreGrid,
            this.trendingTheatreGrid,
            this.popularTheatreGrid,
            this.trendingGrid,
            this.popularGrid,
            this.topRatedGrid
        ].forEach(grid => {
            grid.innerHTML = '<div class="loading">Loading...</div>';
        });
    }

    hideLoading() {
        document.querySelectorAll('.loading').forEach(el => el.remove());
    }

    showError(message) {
        [
            this.latestGrid,
            this.latestTheatreGrid,
            this.trendingTheatreGrid,
            this.popularTheatreGrid,
            this.trendingGrid,
            this.popularGrid,
            this.topRatedGrid
        ].forEach(grid => {
            grid.innerHTML = `<div class="error">${message}</div>`;
        });
    }

    setupNavigation() {
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.dataset.section;
                this.showSection(section);
                
                // Update active state
                document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }

    showSection(section) {
        this.currentSection = section;
        
        // Hide all sections
        document.querySelectorAll('.page-section, main').forEach(el => {
            el.style.display = 'none';
        });

        // Show selected section
        switch (section) {
            case 'home':
                document.querySelector('main').style.display = 'block';
                break;
            case 'movies':
                document.getElementById('movies-section').style.display = 'block';
                if (!this.filtersInitialized) {
                    this.setupMovieFilters();
                    this.filtersInitialized = true;
                }
                this.loadAllMovies();
                break;
            case 'watchlist':
                document.getElementById('watchlist-section').style.display = 'block';
                this.loadWatchlist();
                break;
        }
    }

    async loadAllMovies(filters = {}) {
        try {
            const allMoviesGrid = document.getElementById('allMoviesGrid');
            allMoviesGrid.innerHTML = '<div class="loading">Loading movies...</div>';

            const allMovies = await MovieAPI.fetchAllMovies(filters);
            
            if (allMovies.length === 0) {
                allMoviesGrid.innerHTML = `
                    <div class="error">
                        No movies found with the selected filters.
                        <button class="clear-filters">Clear Filters</button>
                    </div>
                `;
                
                // Add clear filters functionality
                allMoviesGrid.querySelector('.clear-filters')?.addEventListener('click', () => {
                    document.getElementById('genreFilter').value = '';
                    document.getElementById('yearFilter').value = '';
                    this.loadAllMovies();
                });
            } else {
                this.renderMovies(allMovies, allMoviesGrid);
            }
        } catch (error) {
            console.error('Error loading all movies:', error);
            document.getElementById('allMoviesGrid').innerHTML = `
                <div class="error">
                    Failed to load movies. Please try again later.
                    <button onclick="app.loadAllMovies()">Retry</button>
                </div>
            `;
        }
    }

    loadWatchlist() {
        const watchlistGrid = document.getElementById('watchlistGrid');
        const emptyWatchlist = document.getElementById('emptyWatchlist');

        if (this.watchlist.length === 0) {
            watchlistGrid.innerHTML = '';
            emptyWatchlist.style.display = 'block';
        } else {
            emptyWatchlist.style.display = 'none';
            this.renderMovies(this.watchlist, watchlistGrid);
        }
    }

    addToWatchlist(movie) {
        if (!this.watchlist.find(m => m.id === movie.id)) {
            this.watchlist.push(movie);
            localStorage.setItem('watchlist', JSON.stringify(this.watchlist));
            this.showToast('Added to watchlist');
        }
    }

    removeFromWatchlist(movieId) {
        this.watchlist = this.watchlist.filter(m => m.id !== movieId);
        localStorage.setItem('watchlist', JSON.stringify(this.watchlist));
        if (this.currentSection === 'watchlist') {
            this.loadWatchlist();
        }
        this.showToast('Removed from watchlist');
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    setupMovieFilters() {
        const genreFilter = document.getElementById('genreFilter');
        const yearFilter = document.getElementById('yearFilter');

        // Populate genre filter
        genreFilter.innerHTML = `
            <option value="">All Genres</option>
            ${MOVIE_GENRES.map(genre => 
                `<option value="${genre.id}">${genre.name}</option>`
            ).join('')}
        `;

        // Populate year filter
        const currentYear = new Date().getFullYear();
        const years = Array.from({length: 10}, (_, i) => currentYear - i);
        yearFilter.innerHTML = `
            <option value="">All Years</option>
            ${years.map(year => 
                `<option value="${year}">${year}</option>`
            ).join('')}
        `;

        // Add event listeners
        const applyFilters = () => {
            const filters = {
                genre: genreFilter.value,
                year: yearFilter.value,
                language: this.currentLanguage
            };
            this.loadAllMovies(filters);
        };

        genreFilter.addEventListener('change', applyFilters);
        yearFilter.addEventListener('change', applyFilters);
    }
}

// Make app instance globally available
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new MovieApp();
});