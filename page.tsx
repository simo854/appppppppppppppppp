import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-white mb-16">
          <h1 className="text-5xl font-bold mb-4">🎬 Movies & TV Shows API</h1>
          <p className="text-xl opacity-90">Comprehensive backend API for your streaming platform</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-3 text-gray-800">🎥 Movies API</h3>
            <p className="text-gray-600 mb-4">
              Access thousands of movies with metadata, ratings, and multiple streaming sources.
            </p>
            <Link
              href="/api/movies"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              View Movies API
            </Link>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-3 text-gray-800">📺 Series API</h3>
            <p className="text-gray-600 mb-4">
              Browse TV series with seasons, episodes, and streaming links for each episode.
            </p>
            <Link
              href="/api/series"
              className="inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
            >
              View Series API
            </Link>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-3 text-gray-800">🔍 Search API</h3>
            <p className="text-gray-600 mb-4">
              Powerful search across movies and series with genre filtering and pagination.
            </p>
            <Link
              href="/api/search?q=action"
              className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
            >
              Try Search API
            </Link>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-3 text-gray-800">🎯 Iframe Sources</h3>
            <p className="text-gray-600 mb-4">
              Get streaming iframe URLs with multiple source options for any content.
            </p>
            <Link
              href="/api/iframe?title=Incendies"
              className="inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              View Iframe API
            </Link>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-3 text-gray-800">📊 Statistics</h3>
            <p className="text-gray-600 mb-4">Get comprehensive statistics about your content library and genres.</p>
            <Link
              href="/api/stats"
              className="inline-block bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition-colors"
            >
              View Stats API
            </Link>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-3 text-gray-800">🏷️ Genres</h3>
            <p className="text-gray-600 mb-4">Get all available genres from your movies and series collection.</p>
            <Link
              href="/api/genres"
              className="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
            >
              View Genres API
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">API Endpoints</h2>

          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-gray-800">GET /api/movies</h4>
              <p className="text-gray-600">Get all movies or search/filter movies</p>
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">?search=term&genre=action&limit=10&offset=0</code>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-semibold text-gray-800">GET /api/series</h4>
              <p className="text-gray-600">Get all series or search/filter series</p>
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">?search=term&genre=comedy&limit=10&offset=0</code>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-gray-800">GET /api/series/[title]/episodes</h4>
              <p className="text-gray-600">Get episodes for a specific series</p>
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">?season=1&episode=1</code>
            </div>

            <div className="border-l-4 border-red-500 pl-4">
              <h4 className="font-semibold text-gray-800">GET /api/iframe</h4>
              <p className="text-gray-600">Get iframe streaming sources</p>
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                ?title=Movie Title&source=primary&season=1&episode=1
              </code>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4">
              <h4 className="font-semibold text-gray-800">GET /api/search</h4>
              <p className="text-gray-600">Universal search across movies and series</p>
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">?q=search term&type=movie&genre=action</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
