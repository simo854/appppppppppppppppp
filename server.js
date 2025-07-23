import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', '*'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static('.'));

// Helper function to read JSON files
async function readJSONFile(filename) {
  try {
    const filePath = join(__dirname, 'data', filename);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
}

// Helper function to write JSON files
async function writeJSONFile(filename, data) {
  try {
    const filePath = join(__dirname, 'data', filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    return false;
  }
}

// API Routes

// Get all movies
app.get('/api/movies', async (req, res) => {
  try {
    const { search, genre, limit = 20, offset = 0 } = req.query;
    let movies = await readJSONFile('movies.json');
    
    // Apply search filter
    if (search) {
      const searchTerm = search.toLowerCase();
      movies = movies.filter(movie => 
        movie.name.toLowerCase().includes(searchTerm) ||
        movie.description.toLowerCase().includes(searchTerm) ||
        movie.genre.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply genre filter
    if (genre && genre !== 'all') {
      movies = movies.filter(movie => 
        movie.genre.toLowerCase().includes(genre.toLowerCase())
      );
    }
    
    // Apply pagination
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedMovies = movies.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedMovies,
      total: movies.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
      hasMore: endIndex < movies.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch movies',
      message: error.message
    });
  }
});

// Get single movie by name
app.get('/api/movies/:name', async (req, res) => {
  try {
    const movies = await readJSONFile('movies.json');
    const movie = movies.find(m => 
      m.name.toLowerCase() === req.params.name.toLowerCase()
    );
    
    if (!movie) {
      return res.status(404).json({
        success: false,
        error: 'Movie not found'
      });
    }
    
    res.json({
      success: true,
      data: movie
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch movie',
      message: error.message
    });
  }
});

// Get all series
app.get('/api/series', async (req, res) => {
  try {
    const { search, genre, limit = 20, offset = 0 } = req.query;
    let series = await readJSONFile('series.json');
    
    // Apply search filter
    if (search) {
      const searchTerm = search.toLowerCase();
      series = series.filter(show => 
        show.name.toLowerCase().includes(searchTerm) ||
        show.description.toLowerCase().includes(searchTerm) ||
        show.genre.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply genre filter
    if (genre && genre !== 'all') {
      series = series.filter(show => 
        show.genre.toLowerCase().includes(genre.toLowerCase())
      );
    }
    
    // Apply pagination
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedSeries = series.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedSeries,
      total: series.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
      hasMore: endIndex < series.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch series',
      message: error.message
    });
  }
});

// Get single series by name
app.get('/api/series/:name', async (req, res) => {
  try {
    const series = await readJSONFile('series.json');
    const show = series.find(s => 
      s.name.toLowerCase() === req.params.name.toLowerCase()
    );
    
    if (!show) {
      return res.status(404).json({
        success: false,
        error: 'Series not found'
      });
    }
    
    res.json({
      success: true,
      data: show
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch series',
      message: error.message
    });
  }
});

// Get episodes for a series
app.get('/api/series/:name/episodes', async (req, res) => {
  try {
    const { season, episode } = req.query;
    const series = await readJSONFile('series.json');
    const show = series.find(s => 
      s.name.toLowerCase() === req.params.name.toLowerCase()
    );
    
    if (!show) {
      return res.status(404).json({
        success: false,
        error: 'Series not found'
      });
    }
    
    let episodes = show.episodes || [];
    
    // Filter by season if specified
    if (season) {
      episodes = episodes.filter(ep => ep.season === parseInt(season));
    }
    
    // Filter by episode if specified
    if (episode) {
      episodes = episodes.filter(ep => ep.episode === parseInt(episode));
    }
    
    res.json({
      success: true,
      data: episodes,
      seriesInfo: {
        name: show.name,
        description: show.description,
        genre: show.genre,
        rating: show.rating,
        releaseDate: show.releaseDate,
        image: show.image
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch episodes',
      message: error.message
    });
  }
});

// Universal search endpoint
app.get('/api/search', async (req, res) => {
  try {
    const { q, type, genre, limit = 20, offset = 0 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }
    
    const searchTerm = q.toLowerCase();
    let results = [];
    
    // Search movies
    if (!type || type === 'movie' || type === 'all') {
      const movies = await readJSONFile('movies.json');
      const movieResults = movies
        .filter(movie => 
          movie.name.toLowerCase().includes(searchTerm) ||
          movie.description.toLowerCase().includes(searchTerm) ||
          movie.genre.toLowerCase().includes(searchTerm)
        )
        .map(movie => ({ ...movie, type: 'movie' }));
      results = results.concat(movieResults);
    }
    
    // Search series
    if (!type || type === 'series' || type === 'all') {
      const series = await readJSONFile('series.json');
      const seriesResults = series
        .filter(show => 
          show.name.toLowerCase().includes(searchTerm) ||
          show.description.toLowerCase().includes(searchTerm) ||
          show.genre.toLowerCase().includes(searchTerm)
        )
        .map(show => ({ ...show, type: 'series' }));
      results = results.concat(seriesResults);
    }
    
    // Apply genre filter
    if (genre && genre !== 'all') {
      results = results.filter(item => 
        item.genre.toLowerCase().includes(genre.toLowerCase())
      );
    }
    
    // Apply pagination
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedResults = results.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedResults,
      total: results.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
      hasMore: endIndex < results.length,
      query: q
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Search failed',
      message: error.message
    });
  }
});

// Get iframe sources for content
app.get('/api/iframe', async (req, res) => {
  try {
    const { title, source = 'primary', season, episode } = req.query;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }
    
    // Search in movies first
    const movies = await readJSONFile('movies.json');
    const movie = movies.find(m => 
      m.name.toLowerCase() === title.toLowerCase()
    );
    
    if (movie && movie.sources) {
      const sourceKey = source === 'primary' ? 'source1' : 
                       source === 'secondary' ? 'source2' : 
                       source === 'tertiary' ? 'source3' : 'source1';
      
      return res.json({
        success: true,
        data: {
          title: movie.name,
          type: 'movie',
          iframe: movie.sources[sourceKey] || movie.sources.source1,
          availableSources: Object.keys(movie.sources)
        }
      });
    }
    
    // Search in series
    const series = await readJSONFile('series.json');
    const show = series.find(s => 
      s.name.toLowerCase() === title.toLowerCase()
    );
    
    if (show) {
      // If season and episode are specified, find specific episode
      if (season && episode) {
        const ep = show.episodes?.find(e => 
          e.season === parseInt(season) && e.episode === parseInt(episode)
        );
        
        if (ep && ep.sources) {
          const sourceKey = source === 'primary' ? 'source1' : 
                           source === 'secondary' ? 'source2' : 
                           source === 'tertiary' ? 'source3' : 'source1';
          
          return res.json({
            success: true,
            data: {
              title: show.name,
              type: 'series',
              season: ep.season,
              episode: ep.episode,
              episodeTitle: ep.title,
              iframe: ep.sources[sourceKey] || ep.sources.source1,
              availableSources: Object.keys(ep.sources)
            }
          });
        }
      }
      
      // Return first episode if no specific episode requested
      if (show.episodes && show.episodes.length > 0) {
        const firstEp = show.episodes[0];
        const sourceKey = source === 'primary' ? 'source1' : 
                         source === 'secondary' ? 'source2' : 
                         source === 'tertiary' ? 'source3' : 'source1';
        
        return res.json({
          success: true,
          data: {
            title: show.name,
            type: 'series',
            season: firstEp.season,
            episode: firstEp.episode,
            episodeTitle: firstEp.title,
            iframe: firstEp.sources[sourceKey] || firstEp.sources.source1,
            availableSources: Object.keys(firstEp.sources)
          }
        });
      }
    }
    
    res.status(404).json({
      success: false,
      error: 'Content not found'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get iframe source',
      message: error.message
    });
  }
});

// Get trending content
app.get('/api/trending', async (req, res) => {
  try {
    const { type, limit = 20 } = req.query;
    let trending = [];
    
    if (!type || type === 'all' || type === 'movie') {
      const movies = await readJSONFile('movies.json');
      const trendingMovies = movies
        .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
        .slice(0, parseInt(limit) / 2)
        .map(movie => ({ ...movie, type: 'movie' }));
      trending = trending.concat(trendingMovies);
    }
    
    if (!type || type === 'all' || type === 'series') {
      const series = await readJSONFile('series.json');
      const trendingSeries = series
        .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
        .slice(0, parseInt(limit) / 2)
        .map(show => ({ ...show, type: 'series' }));
      trending = trending.concat(trendingSeries);
    }
    
    // Shuffle and limit results
    trending = trending
      .sort(() => Math.random() - 0.5)
      .slice(0, parseInt(limit));
    
    res.json({
      success: true,
      data: trending
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trending content',
      message: error.message
    });
  }
});

// Get statistics
app.get('/api/stats', async (req, res) => {
  try {
    const movies = await readJSONFile('movies.json');
    const series = await readJSONFile('series.json');
    
    // Calculate total episodes
    const totalEpisodes = series.reduce((total, show) => {
      return total + (show.episodes ? show.episodes.length : 0);
    }, 0);
    
    // Get unique genres
    const movieGenres = movies.flatMap(m => m.genre.split(',').map(g => g.trim()));
    const seriesGenres = series.flatMap(s => s.genre.split(',').map(g => g.trim()));
    const allGenres = [...new Set([...movieGenres, ...seriesGenres])];
    
    res.json({
      success: true,
      data: {
        totalMovies: movies.length,
        totalSeries: series.length,
        totalEpisodes: totalEpisodes,
        totalGenres: allGenres.length,
        genres: allGenres,
        averageMovieRating: (movies.reduce((sum, m) => sum + parseFloat(m.rating || 0), 0) / movies.length).toFixed(1),
        averageSeriesRating: (series.reduce((sum, s) => sum + parseFloat(s.rating || 0), 0) / series.length).toFixed(1)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
      message: error.message
    });
  }
});

// Get all genres
app.get('/api/genres', async (req, res) => {
  try {
    const movies = await readJSONFile('movies.json');
    const series = await readJSONFile('series.json');
    
    const movieGenres = movies.flatMap(m => m.genre.split(',').map(g => g.trim()));
    const seriesGenres = series.flatMap(s => s.genre.split(',').map(g => g.trim()));
    const allGenres = [...new Set([...movieGenres, ...seriesGenres])].sort();
    
    res.json({
      success: true,
      data: allGenres
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch genres',
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'ViewMax API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
    availableEndpoints: [
      'GET /api/movies',
      'GET /api/movies/:name',
      'GET /api/series',
      'GET /api/series/:name',
      'GET /api/series/:name/episodes',
      'GET /api/search',
      'GET /api/iframe',
      'GET /api/trending',
      'GET /api/stats',
      'GET /api/genres',
      'GET /api/health'
    ]
  });
});

// Serve HTML files for non-API routes
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'Home.html'));
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎬 ViewMax API Server running on port ${PORT}`);
  console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🌐 Website URL: http://localhost:${PORT}`);
  console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
});

export default app;