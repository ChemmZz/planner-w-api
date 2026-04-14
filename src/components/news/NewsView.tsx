'use client';

import { useCallback, useEffect, useState } from 'react';

interface Article {
  title: string;
  description: string;
  url: string;
  image: string | null;
  source: string;
  publishedAt: string;
}

export default function NewsView() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchArticles = useCallback(async (q: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = q ? `/api/news?q=${encodeURIComponent(q)}` : '/api/news';
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `${res.status}`);
      setArticles(data.articles);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load news');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles(query);
  }, [query, fetchArticles]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setQuery(searchInput.trim());
  }

  function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">News</h1>
        <p className="mt-1 text-sm text-gray-500">
          {query ? `Results for "${query}"` : 'Top US headlines right now'}
        </p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search news…"
          className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-emerald-300"
        />
        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
        >
          Search
        </button>
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSearchInput('');
            }}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            Clear
          </button>
        )}
      </form>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Articles grid */}
      {loading ? (
        <div className="py-12 text-center text-sm text-gray-400">
          Loading headlines…
        </div>
      ) : articles.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-400">
          No articles found.{query && ' Try a different search term.'}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {articles.map((article, i) => (
            <a
              key={i}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              {article.image && (
                <div className="aspect-[16/9] overflow-hidden bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={article.image}
                    alt=""
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col p-4">
                <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase text-gray-400">
                  <span>{article.source}</span>
                  <span>·</span>
                  <span>{timeAgo(article.publishedAt)}</span>
                </div>
                <h2 className="mb-1 text-sm font-semibold leading-snug text-gray-900 group-hover:text-emerald-700">
                  {article.title}
                </h2>
                {article.description && (
                  <p className="line-clamp-2 text-xs leading-relaxed text-gray-500">
                    {article.description}
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
