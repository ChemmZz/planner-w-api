'use client';

import { useEffect, useState } from 'react';
import { UserButton } from '@clerk/nextjs';
import { useLogHistory } from '@/lib/useLogHistory';

function TrashIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"
      />
    </svg>
  );
}

interface WeatherData {
  temp: number;
  feelsLike: number;
  label: string;
  icon: string;
  unit: string;
}

type LocationState =
  | { status: 'loading' }
  | { status: 'denied' }
  | { status: 'ready'; lat: number; lon: number };

function useGeolocation(): LocationState {
  const [state, setState] = useState<LocationState>(() => {
    if (typeof window === 'undefined') return { status: 'loading' };
    const lat = localStorage.getItem('weather-lat');
    const lon = localStorage.getItem('weather-lon');
    if (lat && lon) return { status: 'ready', lat: Number(lat), lon: Number(lon) };
    return { status: 'loading' };
  });

  useEffect(() => {
    // If we already have coords from localStorage, skip geolocation prompt.
    if (state.status === 'ready') return;

    if (!navigator.geolocation) {
      setState({ status: 'denied' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        localStorage.setItem('weather-lat', String(latitude));
        localStorage.setItem('weather-lon', String(longitude));
        setState({ status: 'ready', lat: latitude, lon: longitude });
      },
      () => {
        setState({ status: 'denied' });
      }
    );
    // Only run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}

function WeatherBadge() {
  const location = useGeolocation();
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    if (location.status !== 'ready') return;
    let cancelled = false;
    fetch(`/api/weather?lat=${location.lat}&lon=${location.lon}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data && !data.error) setWeather(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [location]);

  // Denied or unavailable — show placeholder.
  if (location.status === 'denied') {
    return (
      <div
        className="hidden sm:flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs text-gray-400"
        style={{ borderColor: 'var(--color-surface-border)' }}
        title="Location access not granted"
      >
        <span>🌡️</span>
        <span>—</span>
      </div>
    );
  }

  // Still loading location or weather data.
  if (!weather) return null;

  return (
    <div
      className="hidden sm:flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs"
      style={{ borderColor: 'var(--color-surface-border)' }}
    >
      <span title={weather.label} className="cursor-default">
        {weather.icon}
      </span>
      <span
        title="Feels like"
        className="cursor-default font-semibold text-gray-800"
      >
        {weather.feelsLike}{weather.unit}
      </span>
      <span
        title="Actual temperature"
        className="cursor-default text-gray-400"
      >
        / {weather.temp}{weather.unit}
      </span>
    </div>
  );
}

interface TopBarProps {
  onMenuToggle?: () => void;
}

export default function TopBar({ onMenuToggle }: TopBarProps) {
  const { deleteAllHistory, savedHistory } = useLogHistory();

  async function handleDeleteHistory() {
    const n = savedHistory.length;
    const msg =
      n === 0
        ? 'You have no saved log entries to delete. Proceed anyway?'
        : `Delete all ${n} saved log entr${n === 1 ? 'y' : 'ies'}? This cannot be undone. Your current session (unsaved) entries are not affected.`;
    if (!window.confirm(msg)) return;
    const ok = await deleteAllHistory();
    if (!ok) {
      window.alert('Could not delete history. Check the console for details.');
    }
  }

  return (
    <header
      className="flex h-14 flex-shrink-0 items-center gap-3 border-b px-4 md:px-6 md:justify-end"
      style={{
        backgroundColor: 'var(--color-surface-raised)',
        borderColor: 'var(--color-surface-border)',
      }}
    >
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuToggle}
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 md:hidden"
        aria-label="Toggle navigation"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="ml-auto flex items-center gap-3">
        <WeatherBadge />
        <UserButton>
          <UserButton.MenuItems>
            <UserButton.Action label="manageAccount" />
            <UserButton.Action
              label="Delete log history"
              labelIcon={<TrashIcon />}
              onClick={handleDeleteHistory}
            />
            <UserButton.Action label="signOut" />
          </UserButton.MenuItems>
        </UserButton>
      </div>
    </header>
  );
}
