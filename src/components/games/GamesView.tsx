'use client';

const GAMES = [
  {
    name: 'Wordle',
    description: 'Guess the hidden word in 6 tries',
    url: 'https://www.nytimes.com/games/wordle/index.html',
    color: '#6aaa64',
    icon: (
      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <rect x="3" y="3" width="5" height="5" rx="1" fill="#6aaa64" stroke="none" />
        <rect x="10" y="3" width="5" height="5" rx="1" fill="#c9b458" stroke="none" />
        <rect x="17" y="3" width="5" height="5" rx="1" fill="#787c7e" stroke="none" />
        <rect x="3" y="10" width="5" height="5" rx="1" fill="#787c7e" stroke="none" />
        <rect x="10" y="10" width="5" height="5" rx="1" fill="#6aaa64" stroke="none" />
      </svg>
    ),
  },
];

export default function GamesView() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 py-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Games</h1>
        <p className="mt-1 text-sm text-gray-500">
          Quick brain warmups to get your mind going.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GAMES.map((game) => (
          <a
            key={game.name}
            href={game.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-gray-300"
          >
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl transition-transform group-hover:scale-105"
              style={{ backgroundColor: `${game.color}15` }}
            >
              {game.icon}
            </div>
            <div className="text-center">
              <h3 className="text-sm font-bold text-gray-800">{game.name}</h3>
              <p className="mt-1 text-xs text-gray-500">{game.description}</p>
            </div>
            <span
              className="rounded-full px-3 py-1 text-[10px] font-semibold transition-colors group-hover:opacity-100 opacity-70"
              style={{ backgroundColor: `${game.color}15`, color: game.color }}
            >
              Play now
            </span>
          </a>
        ))}
      </div>

      <p className="text-xs text-gray-400 text-center">
        More games coming soon
      </p>
    </div>
  );
}
