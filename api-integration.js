// ViewMax API Integration
class ViewMaxAPI {
    constructor() {
        this.baseURL = window.location.origin;
        this.apiURL = `${this.baseURL}/api`;
    }

    // Generic fetch method with error handling
    async fetchData(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.apiURL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Get all movies with optional filters
    async getMovies(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `/movies${queryString ? `?${queryString}` : ''}`;
        return await this.fetchData(endpoint);
    }

    // Get single movie by name
    async getMovie(name) {
        return await this.fetchData(`/movies/${encodeURIComponent(name)}`);
    }

    // Get all series with optional filters
    async getSeries(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `/series${queryString ? `?${queryString}` : ''}`;
        return await this.fetchData(endpoint);
    }

    // Get single series by name
    async getSeriesInfo(name) {
        return await this.fetchData(`/series/${encodeURIComponent(name)}`);
    }

    // Get episodes for a series
    async getEpisodes(seriesName, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `/series/${encodeURIComponent(seriesName)}/episodes${queryString ? `?${queryString}` : ''}`;
        return await this.fetchData(endpoint);
    }

    // Universal search
    async search(query, params = {}) {
        const searchParams = { q: query, ...params };
        const queryString = new URLSearchParams(searchParams).toString();
        return await this.fetchData(`/search?${queryString}`);
    }

    // Get iframe sources
    async getIframeSources(title, params = {}) {
        const searchParams = { title, ...params };
        const queryString = new URLSearchParams(searchParams).toString();
        return await this.fetchData(`/iframe?${queryString}`);
    }

    // Get trending content
    async getTrending(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `/trending${queryString ? `?${queryString}` : ''}`;
        return await this.fetchData(endpoint);
    }

    // Get statistics
    async getStats() {
        return await this.fetchData('/stats');
    }

    // Get all genres
    async getGenres() {
        return await this.fetchData('/genres');
    }

    // Health check
    async healthCheck() {
        return await this.fetchData('/health');
    }
}

// Create global API instance
window.viewMaxAPI = new ViewMaxAPI();

// Movie Player Integration
class MoviePlayer {
    constructor() {
        this.currentMovie = null;
        this.currentSource = 1;
        this.playerElement = document.getElementById('player');
        this.init();
    }

    init() {
        // Get movie name from URL parameters or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const movieName = urlParams.get('movie') || localStorage.getItem('currentMovie');
        
        if (movieName) {
            this.loadMovie(movieName);
        }

        // Set up source change buttons
        this.setupSourceButtons();
    }

    async loadMovie(movieName) {
        try {
            const response = await window.viewMaxAPI.getMovie(movieName);
            if (response.success) {
                this.currentMovie = response.data;
                this.displayMovieInfo();
                this.loadPlayer();
                this.loadSuggestions();
            }
        } catch (error) {
            console.error('Error loading movie:', error);
            this.showError('Failed to load movie');
        }
    }

    displayMovieInfo() {
        if (!this.currentMovie) return;

        // Update movie information
        const elements = {
            'movie-title': this.currentMovie.name,
            'movie-genre': this.currentMovie.genre,
            'movie-description': this.currentMovie.description,
            'movie-rating': this.currentMovie.rating,
            'movie-release': this.currentMovie.releaseDate
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });

        // Update movie image
        const imageElement = document.getElementById('movie-image');
        if (imageElement && this.currentMovie.image) {
            imageElement.src = this.currentMovie.image;
            imageElement.alt = this.currentMovie.name;
        }

        // Update page title and meta tags
        document.title = `${this.currentMovie.name} - ViewMax`;
        this.updateMetaTags();
    }

    loadPlayer() {
        if (!this.currentMovie || !this.currentMovie.sources) return;

        const sourceKey = `source${this.currentSource}`;
        const iframeSrc = this.currentMovie.sources[sourceKey] || this.currentMovie.sources.source1;

        if (this.playerElement) {
            this.playerElement.innerHTML = `
                <iframe 
                    src="${iframeSrc}" 
                    allowfullscreen 
                    scrolling="no"
                    style="width: 100%; height: 100%; border: none; border-radius: 20px;">
                </iframe>
            `;
        }
    }

    setupSourceButtons() {
        const buttons = document.querySelectorAll('#player-buttons button');
        buttons.forEach((button, index) => {
            button.addEventListener('click', () => {
                this.changeSource(index + 1);
            });
        });
    }

    changeSource(sourceNumber) {
        this.currentSource = sourceNumber;
        
        // Update active button
        const buttons = document.querySelectorAll('#player-buttons button');
        buttons.forEach((btn, index) => {
            btn.classList.toggle('active', index + 1 === sourceNumber);
        });

        this.loadPlayer();
    }

    async loadSuggestions() {
        try {
            const response = await window.viewMaxAPI.getMovies({ limit: 6 });
            if (response.success) {
                this.displaySuggestions(response.data);
            }
        } catch (error) {
            console.error('Error loading suggestions:', error);
        }
    }

    displaySuggestions(movies) {
        const suggestionsContainer = document.getElementById('suggestions');
        if (!suggestionsContainer) return;

        suggestionsContainer.innerHTML = movies.map(movie => `
            <div class="suggestion-item" onclick="window.moviePlayer.loadMovie('${movie.name}')">
                <img src="${movie.image}" alt="${movie.name}" loading="lazy">
                <p>${movie.name}</p>
            </div>
        `).join('');
    }

    updateMetaTags() {
        if (!this.currentMovie) return;

        const metaTags = {
            'page-title': `${this.currentMovie.name} - ViewMax`,
            'page-description': this.currentMovie.description,
            'og-title': `${this.currentMovie.name} - ViewMax`,
            'og-description': this.currentMovie.description,
            'twitter-title': `${this.currentMovie.name} - ViewMax`,
            'twitter-description': this.currentMovie.description
        };

        Object.entries(metaTags).forEach(([id, content]) => {
            const element = document.getElementById(id);
            if (element) {
                if (element.tagName === 'TITLE') {
                    element.textContent = content;
                } else {
                    element.setAttribute('content', content);
                }
            }
        });
    }

    showError(message) {
        if (this.playerElement) {
            this.playerElement.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: white; font-size: 18px;">
                    <p>${message}</p>
                </div>
            `;
        }
    }
}

// Series Player Integration
class SeriesPlayer {
    constructor() {
        this.currentSeries = null;
        this.currentSeason = 1;
        this.currentEpisode = 1;
        this.currentSource = 1;
        this.init();
    }

    init() {
        const urlParams = new URLSearchParams(window.location.search);
        const seriesName = urlParams.get('series') || localStorage.getItem('currentSeries');
        
        if (seriesName) {
            this.loadSeries(seriesName);
        }

        this.setupSourceButtons();
    }

    async loadSeries(seriesName) {
        try {
            const response = await window.viewMaxAPI.getSeriesInfo(seriesName);
            if (response.success) {
                this.currentSeries = response.data;
                this.displaySeriesInfo();
                this.displaySeasons();
                this.displayEpisodes();
                this.loadPlayer();
                this.loadSuggestions();
            }
        } catch (error) {
            console.error('Error loading series:', error);
            this.showError('Failed to load series');
        }
    }

    displaySeriesInfo() {
        if (!this.currentSeries) return;

        const elements = {
            'series-title': this.currentSeries.name,
            'series-genre': this.currentSeries.genre,
            'series-description': this.currentSeries.description,
            'series-rating': this.currentSeries.rating,
            'series-release': this.currentSeries.releaseDate
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });

        const imageElement = document.getElementById('series-image');
        if (imageElement && this.currentSeries.image) {
            imageElement.src = this.currentSeries.image;
            imageElement.alt = this.currentSeries.name;
        }

        document.title = `${this.currentSeries.name} - ViewMax`;
    }

    displaySeasons() {
        if (!this.currentSeries.episodes) return;

        const seasons = [...new Set(this.currentSeries.episodes.map(ep => ep.season))].sort((a, b) => a - b);
        const seasonsList = document.getElementById('seasons-list');
        
        if (seasonsList) {
            seasonsList.innerHTML = seasons.map(season => `
                <li onclick="window.seriesPlayer.selectSeason(${season})" 
                    class="${season === this.currentSeason ? 'active' : ''}">
                    Season ${season}
                </li>
            `).join('');
        }
    }

    displayEpisodes() {
        if (!this.currentSeries.episodes) return;

        const seasonEpisodes = this.currentSeries.episodes.filter(ep => ep.season === this.currentSeason);
        const episodesContainer = document.getElementById('episodes-container');
        
        if (episodesContainer) {
            episodesContainer.innerHTML = seasonEpisodes.map(episode => `
                <button onclick="window.seriesPlayer.selectEpisode(${episode.episode})" 
                        class="${episode.episode === this.currentEpisode ? 'active' : ''}">
                    Episode ${episode.episode}: ${episode.title}
                </button>
            `).join('');
        }
    }

    selectSeason(season) {
        this.currentSeason = season;
        this.currentEpisode = 1; // Reset to first episode of new season
        this.displaySeasons();
        this.displayEpisodes();
        this.loadPlayer();
    }

    selectEpisode(episode) {
        this.currentEpisode = episode;
        this.displayEpisodes();
        this.loadPlayer();
    }

    loadPlayer() {
        if (!this.currentSeries || !this.currentSeries.episodes) return;

        const currentEp = this.currentSeries.episodes.find(ep => 
            ep.season === this.currentSeason && ep.episode === this.currentEpisode
        );

        if (!currentEp || !currentEp.sources) return;

        const sourceKey = `source${this.currentSource}`;
        const iframeSrc = currentEp.sources[sourceKey] || currentEp.sources.source1;

        const playerElement = document.getElementById('episode-iframe');
        if (playerElement) {
            playerElement.src = iframeSrc;
        }
    }

    setupSourceButtons() {
        const buttons = document.querySelectorAll('#player-buttons button');
        buttons.forEach((button, index) => {
            button.addEventListener('click', () => {
                this.changeSource(index + 1);
            });
        });
    }

    changeSource(sourceNumber) {
        this.currentSource = sourceNumber;
        
        const buttons = document.querySelectorAll('#player-buttons button');
        buttons.forEach((btn, index) => {
            btn.classList.toggle('active', index + 1 === sourceNumber);
        });

        this.loadPlayer();
    }

    async loadSuggestions() {
        try {
            const response = await window.viewMaxAPI.getSeries({ limit: 6 });
            if (response.success) {
                this.displaySuggestions(response.data);
            }
        } catch (error) {
            console.error('Error loading suggestions:', error);
        }
    }

    displaySuggestions(series) {
        const suggestionsContainer = document.getElementById('suggestions');
        if (!suggestionsContainer) return;

        suggestionsContainer.innerHTML = series.map(show => `
            <div class="suggestion-item" onclick="window.seriesPlayer.loadSeries('${show.name}')">
                <img src="${show.image}" alt="${show.name}" loading="lazy">
                <p>${show.name}</p>
            </div>
        `).join('');
    }

    showError(message) {
        const playerElement = document.getElementById('episode-iframe');
        if (playerElement) {
            playerElement.style.display = 'none';
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = message;
            playerElement.parentNode.insertBefore(errorDiv, playerElement);
        }
    }
}

// Search Integration
class SearchManager {
    constructor() {
        this.searchInput = document.getElementById('searchInput');
        this.mobileSearchInput = document.getElementById('mobileSearchInput');
        this.suggestionsList = document.getElementById('suggestionsList');
        this.mobileSuggestionsList = document.getElementById('mobileSuggestionsList');
        this.searchTimeout = null;
        this.init();
    }

    init() {
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => this.handleSearch(e, false));
        }
        
        if (this.mobileSearchInput) {
            this.mobileSearchInput.addEventListener('input', (e) => this.handleSearch(e, true));
        }

        // Handle search from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('q');
        if (searchQuery) {
            this.performSearch(searchQuery);
        }
    }

    handleSearch(event, isMobile) {
        const query = event.target.value.trim();
        
        clearTimeout(this.searchTimeout);
        
        if (query.length < 2) {
            this.hideSuggestions(isMobile);
            return;
        }

        this.searchTimeout = setTimeout(() => {
            this.showSuggestions(query, isMobile);
        }, 300);
    }

    async showSuggestions(query, isMobile) {
        try {
            const response = await window.viewMaxAPI.search(query, { limit: 8 });
            if (response.success) {
                this.displaySuggestions(response.data, isMobile);
            }
        } catch (error) {
            console.error('Search error:', error);
        }
    }

    displaySuggestions(results, isMobile) {
        const suggestionsList = isMobile ? this.mobileSuggestionsList : this.suggestionsList;
        if (!suggestionsList) return;

        if (results.length === 0) {
            suggestionsList.innerHTML = '<li class="no-results">No results found</li>';
            suggestionsList.style.display = 'block';
            return;
        }

        suggestionsList.innerHTML = results.map(item => `
            <li class="suggestion-item" onclick="window.searchManager.selectItem('${item.name}', '${item.type}')">
                <img src="${item.image}" alt="${item.name}" loading="lazy">
                <div class="suggestion-info">
                    <h4>${item.name}</h4>
                    <p>${item.type === 'movie' ? 'Movie' : 'TV Series'} • ${item.genre}</p>
                    <span class="rating">⭐ ${item.rating}</span>
                </div>
            </li>
        `).join('');

        suggestionsList.style.display = 'block';
    }

    selectItem(name, type) {
        localStorage.setItem(type === 'movie' ? 'currentMovie' : 'currentSeries', name);
        
        if (type === 'movie') {
            window.location.href = `player.html?movie=${encodeURIComponent(name)}`;
        } else {
            window.location.href = `Seriesplayer.html?series=${encodeURIComponent(name)}`;
        }
    }

    hideSuggestions(isMobile) {
        const suggestionsList = isMobile ? this.mobileSuggestionsList : this.suggestionsList;
        if (suggestionsList) {
            suggestionsList.style.display = 'none';
        }
    }

    async performSearch(query) {
        try {
            const response = await window.viewMaxAPI.search(query);
            if (response.success) {
                this.displaySearchResults(response.data, query);
            }
        } catch (error) {
            console.error('Search error:', error);
        }
    }

    displaySearchResults(results, query) {
        // This would be implemented for search results page
        console.log('Search results for:', query, results);
    }
}

// Initialize components when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize search manager on all pages
    window.searchManager = new SearchManager();

    // Initialize appropriate player based on current page
    if (window.location.pathname.includes('player.html')) {
        window.moviePlayer = new MoviePlayer();
        
        // Global function for changing sources (called from HTML)
        window.changeSource = (sourceNumber) => {
            if (window.moviePlayer) {
                window.moviePlayer.changeSource(sourceNumber);
            }
        };
    } else if (window.location.pathname.includes('Seriesplayer.html')) {
        window.seriesPlayer = new SeriesPlayer();
        
        // Global functions for series player
        window.changeSource = (sourceNumber) => {
            if (window.seriesPlayer) {
                window.seriesPlayer.changeSource(sourceNumber);
            }
        };
    }

    // Test API connection
    window.viewMaxAPI.healthCheck()
        .then(response => {
            console.log('✅ ViewMax API connected:', response.message);
        })
        .catch(error => {
            console.error('❌ ViewMax API connection failed:', error);
        });
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ViewMaxAPI, MoviePlayer, SeriesPlayer, SearchManager };
}