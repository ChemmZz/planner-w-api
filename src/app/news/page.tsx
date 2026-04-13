export default function NewsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 py-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">News</h1>
        <p className="mt-1 text-sm text-gray-500">
          Your daily news outlets — add your sources to get started.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-16">
        <svg className="mb-3 h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
        <p className="text-sm font-medium text-gray-500">No outlets configured yet</p>
        <p className="mt-1 text-xs text-gray-400">News sources will appear here as link cards</p>
      </div>
    </div>
  );
}
