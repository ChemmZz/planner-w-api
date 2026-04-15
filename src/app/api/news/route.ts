// NewsAPI.org — free dev key (100 requests/day).
// Key is server-only (no NEXT_PUBLIC_ prefix) so it never reaches the browser.

export async function GET(request: Request) {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: 'NEWS_API_KEY is not configured in .env.local' },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const browseSources = searchParams.get('sources') === 'browse';
  const categoryFilter = searchParams.get('category');
  const fromSources = searchParams.get('from'); // comma-separated source IDs

  try {
    // Browse available sources
    if (browseSources) {
      const url = new URL('https://newsapi.org/v2/top-headlines/sources');
      if (categoryFilter) url.searchParams.set('category', categoryFilter);
      url.searchParams.set('language', 'en');
      url.searchParams.set('apiKey', apiKey);

      const res = await fetch(url.toString(), { next: { revalidate: 300 } });
      if (!res.ok) {
        const body = await res.text();
        return Response.json(
          { error: `NewsAPI responded ${res.status}: ${body}` },
          { status: 502 }
        );
      }

      const data = await res.json();
      const sources = (data.sources ?? []).map(
        (s: { id: string; name: string; description: string; url: string; category: string; country: string }) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          url: s.url,
          category: s.category,
          country: s.country,
        })
      );

      return Response.json({ sources });
    }

    // Headlines (optionally filtered by sources)
    const url = new URL(
      query
        ? 'https://newsapi.org/v2/everything'
        : 'https://newsapi.org/v2/top-headlines'
    );
    if (query) {
      url.searchParams.set('q', query);
      url.searchParams.set('sortBy', 'publishedAt');
    } else if (fromSources) {
      url.searchParams.set('sources', fromSources);
    } else {
      url.searchParams.set('country', 'us');
    }
    url.searchParams.set('pageSize', '12');
    url.searchParams.set('apiKey', apiKey);

    const res = await fetch(url.toString(), { next: { revalidate: 300 } });
    if (!res.ok) {
      const body = await res.text();
      return Response.json(
        { error: `NewsAPI responded ${res.status}: ${body}` },
        { status: 502 }
      );
    }

    const data = await res.json();

    // Shape articles — strip anything the client doesn't need.
    const articles = (data.articles ?? [])
      .filter((a: Record<string, unknown>) => a.title && a.title !== '[Removed]')
      .map(
        (a: {
          title: string;
          description: string | null;
          url: string;
          urlToImage: string | null;
          source: { name: string };
          publishedAt: string;
        }) => ({
          title: a.title,
          description: a.description ?? '',
          url: a.url,
          image: a.urlToImage,
          source: a.source.name,
          publishedAt: a.publishedAt,
        })
      );

    return Response.json({ articles });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : 'News fetch failed' },
      { status: 500 }
    );
  }
}
