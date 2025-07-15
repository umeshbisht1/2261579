import React, { useState } from 'react';
import { Globe, Link, BarChart3, Clock, Copy, CheckCircle, AlertCircle } from 'lucide-react';

const App = () => {
  const [url, setUrl] = useState('');
  const [validity, setValidity] = useState(30);
  const [shortcode, setShortcode] = useState('');
  const [shortLink, setShortLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [copied, setCopied] = useState(false);

  const API_BASE = 'http://localhost:3000';

  const createShortUrl = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE}/shorturls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          validity: validity || 30,
          shortcode: shortcode || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create short URL');
      }

      setShortLink(data.shortLink);
      setSuccess('Short URL created successfully!');
      setUrl('');
      setShortcode('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStats = async (code) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/shorturls/${code}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch statistics');
      }

      setStats(data);
      setShowStats(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shortLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Link className="h-8 w-8 text-indigo-600 mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">URL Shortener</h1>
          </div>
          <p className="text-gray-600">Transform long URLs into short, manageable links</p>
        </div>

      
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <form onSubmit={createShortUrl} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Globe className="inline w-4 h-4 mr-1" />
                URL to Shorten
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/very-long-url"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline w-4 h-4 mr-1" />
                  Validity (minutes)
                </label>
                <input
                  type="number"
                  value={validity}
                  onChange={(e) => setValidity(parseInt(e.target.value))}
                  min="1"
                  placeholder="30"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Shortcode (optional)
                </label>
                <input
                  type="text"
                  value={shortcode}
                  onChange={(e) => setShortcode(e.target.value)}
                  placeholder="mycode123"
                  pattern="[a-zA-Z0-9]+"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating...' : 'Create Short URL'}
            </button>
          </form>

          {/* Success Message */}
          {success && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-green-800">{success}</span>
              </div>
            </div>
          )}

         
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}

       
          {shortLink && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <label className="block text-sm font-medium text-blue-800 mb-2">
                Your Short URL:
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={shortLink}
                  readOnly
                  className="flex-1 p-2 bg-white border border-blue-300 rounded text-blue-900"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => getStats(shortLink.split('/').pop())}
                  className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  <BarChart3 className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

     
        {showStats && stats && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              URL Statistics
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Original URL:</label>
                  <p className="text-blue-600 break-all">{stats.originalUrl}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Shortcode:</label>
                  <p className="font-mono text-gray-900">{stats.shortcode}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created At:</label>
                  <p className="text-gray-900">{formatDate(stats.createdAt)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Expires At:</label>
                  <p className="text-gray-900">{formatDate(stats.expiry)}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Clicks:</label>
                  <p className="text-2xl font-bold text-indigo-600">{stats.clickCount}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status:</label>
                  <p className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    new Date() > new Date(stats.expiry) 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {new Date() > new Date(stats.expiry) ? 'Expired' : 'Active'}
                  </p>
                </div>
              </div>
            </div>

          
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Click History</h3>
              {stats.clicks.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No clicks yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 px-4 py-2 text-left">Timestamp</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Referrer</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.clicks.map((click, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-200 px-4 py-2">
                            {formatDate(click.timestamp)}
                          </td>
                          <td className="border border-gray-200 px-4 py-2">
                            {click.referrer === 'direct' ? (
                              <span className="text-gray-500">Direct</span>
                            ) : (
                              <span className="text-blue-600">{click.referrer}</span>
                            )}
                          </td>
                          <td className="border border-gray-200 px-4 py-2">
                            {click.location}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowStats(false)}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Close Statistics
            </button>
          </div>
        )}

    
        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Stats Lookup</h2>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Enter shortcode (e.g., abcd1234)"
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  getStats(e.target.value.trim());
                }
              }}
            />
            <button
              onClick={(e) => {
                const input = e.target.parentElement.querySelector('input');
                if (input.value.trim()) {
                  getStats(input.value.trim());
                }
              }}
              disabled={loading}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Loading...' : 'Get Stats'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500">
          <p>URL Shortener Service - Built with Node.js, React, and MySQL</p>
        </div>
      </div>
    </div>
  );
};

export default App;