'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSavedSources } from '@/lib/useSavedSources';

interface Article {
  title: string;
  description: string;
  url: string;
  image: string | null;
  source: string;
  publishedAt: string;
}

interface NewsSource {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string;
  country: string;
}

type Tab = 'headlines' | 'sources' | 'saved';

const SOURCE_CATEGORIES = ['general', 'business', 'technology', 'science', 'sports', 'health', 'entertainment'];

export default function NewsView() {
  const [tab, setTab] = useState<Tab>('headlines');

  // Headlines state
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [fromSavedOnly, setFromSavedOnly] = useState(false);

  // Sources browse state
  const [sources, setSources] = useState<NewsSource[]>([]);
  const [sourcesLoading, setSourcesLoading] = useState(false);
  const [sourcesError, setSourcesError] = useState<string | null>(null);
  const [sourceCategory, setSourceCategory] = useState('');

  // Saved sources hook
  const { savedSources, loading: savedLoading, saveSource, removeSource, isSaved } = useSavedSources();

  /* ── Headlines fetch ── */
  const fetchArticles = useCallback(async (q: string, sourceIds?: string) => {
    setLoading(true);
    setError(null);
    try {
      let url = '/api/news';
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (sourceIds) params.set('from', sourceIds);
      const qs = params.toString();
      if (qs) url += `?${qs}`;

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
    if (tab !== 'headlines') return;
    const sourceIds = fromSavedOnly && savedSources.length > 0
      ? savedSources.map((s) => s.sourceId).join(',')
      : undefined;
    fetchArticles(query, sourceIds);
  }, [query, fetchArticles, tab, fromSavedOnly, savedSources]);

  /* ── Sources browse fetch ── */
  const fetchSources = useCallback(async (category: string) => {
    setSourcesLoading(true);
    setSourcesError(null);
    try {
      const params = new URLSearchParams({ sources: 'browse' });
      if (category) params.set('category', category);
      const res = await fetch(`/api/news?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `${res.status}`);
      setSources(data.sources);
    } catch (e) {
      setSourcesError(e instanceof Error ? e.message : 'Failed to load sources');
    } finally {
      setSourcesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab !== 'sources') return;
    fetchSources(sourceCategory);
  }, [tab, sourceCategory, fetchSources]);

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

  const TABS: { key: Tab; label: string }[] = [
    { key: 'headlines', label: 'Headlines' },
    { key: 'sources', label: 'Browse Sources' },
    { key: 'saved', label: `My Sources${savedSources.length ? ` (${savedSources.length})` : ''}` },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">News</h1>
        <p className="mt-1 text-sm text-gray-500">
          {tab === 'headlines'
            ? query
              ? `Results for "${query}"`
              : fromSavedOnly
                ? 'Headlines from your saved sources'
                : 'Top US headlines right now'
            : tab === 'sources'
              ? 'Browse and save your favorite news sources'
              : 'Your saved news sources'}
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════════ HEADLINES TAB ══════════ */}
      {tab === 'headlines' && (
        <>
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
                onClick={() => { setQuery(''); setSearchInput(''); }}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                Clear
              </button>
            )}
          </form>

          {/* Filter by saved sources toggle */}
          {savedSources.length > 0 && !query && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={fromSavedOnly}
                onChange={(e) => setFromSavedOnly(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-emerald-600 accent-emerald-600"
              />
              <span className="text-xs text-gray-600">
                From my sources only ({savedSources.length} saved)
              </span>
            </label>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-12 text-center text-sm text-gray-400">Loading headlines…</div>
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
        </>
      )}

      {/* ══════════ BROWSE SOURCES TAB ══════════ */}
      {tab === 'sources' && (
        <>
          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSourceCategory('')}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                !sourceCategory ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {SOURCE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSourceCategory(cat)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                  sourceCategory === cat ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {sourcesError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {sourcesError}
            </div>
          )}

          {sourcesLoading ? (
            <div className="py-12 text-center text-sm text-gray-400">Loading sources…</div>
          ) : sources.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">No sources found.</div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {sources.map((source) => {
                const saved = isSaved(source.id);
                return (
                  <div
                    key={source.id}
                    className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900">{source.name}</h3>
                        <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium capitalize text-gray-500">
                          {source.category}
                        </span>
                      </div>
                      <button
                        onClick={() => saved ? removeSource(source.id) : saveSource(source)}
                        className={`flex-shrink-0 rounded-full p-2 transition-colors ${
                          saved
                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                            : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                        }`}
                        title={saved ? 'Remove from saved' : 'Save source'}
                      >
                        <svg className="h-4 w-4" fill={saved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </button>
                    </div>
                    {source.description && (
                      <p className="line-clamp-2 text-xs leading-relaxed text-gray-500">
                        {source.description}
                      </p>
                    )}
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto text-[10px] font-medium text-emerald-600 hover:text-emerald-700"
                    >
                      Visit site
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ══════════ MY SOURCES TAB ══════════ */}
      {tab === 'saved' && (
        <>
          {savedLoading ? (
            <div className="py-12 text-center text-sm text-gray-400">Loading saved sources…</div>
          ) : savedSources.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-gray-400">No saved sources yet.</p>
              <button
                onClick={() => setTab('sources')}
                className="mt-2 text-sm font-medium text-emerald-600 hover:text-emerald-700"
              >
                Browse sources to add some
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {savedSources.map((source) => (
                <div
                  key={source.id}
                  className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm"
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-gray-900">{source.name}</h3>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                      {source.category && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 font-medium capitalize">
                          {source.category}
                        </span>
                      )}
                      {source.url && (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-emerald-600 hover:text-emerald-700"
                        >
                          Visit site
                        </a>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeSource(source.sourceId)}
                    className="rounded-full p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    title="Remove source"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
