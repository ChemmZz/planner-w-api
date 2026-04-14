// Open-Meteo — free, no API key needed.
// Default: Chicago (UChicago campus).

const LAT = 41.8781;
const LON = -87.6298;

// WMO weather codes → description + emoji
const WMO_DESCRIPTIONS: Record<number, { label: string; icon: string }> = {
  0: { label: 'Clear', icon: '☀️' },
  1: { label: 'Mostly clear', icon: '🌤️' },
  2: { label: 'Partly cloudy', icon: '⛅' },
  3: { label: 'Overcast', icon: '☁️' },
  45: { label: 'Foggy', icon: '🌫️' },
  48: { label: 'Rime fog', icon: '🌫️' },
  51: { label: 'Light drizzle', icon: '🌦️' },
  53: { label: 'Drizzle', icon: '🌦️' },
  55: { label: 'Heavy drizzle', icon: '🌧️' },
  61: { label: 'Light rain', icon: '🌦️' },
  63: { label: 'Rain', icon: '🌧️' },
  65: { label: 'Heavy rain', icon: '🌧️' },
  71: { label: 'Light snow', icon: '🌨️' },
  73: { label: 'Snow', icon: '❄️' },
  75: { label: 'Heavy snow', icon: '❄️' },
  77: { label: 'Snow grains', icon: '❄️' },
  80: { label: 'Rain showers', icon: '🌧️' },
  81: { label: 'Moderate showers', icon: '🌧️' },
  82: { label: 'Heavy showers', icon: '🌧️' },
  85: { label: 'Snow showers', icon: '🌨️' },
  86: { label: 'Heavy snow showers', icon: '🌨️' },
  95: { label: 'Thunderstorm', icon: '⛈️' },
  96: { label: 'Thunderstorm + hail', icon: '⛈️' },
  99: { label: 'Severe thunderstorm', icon: '⛈️' },
};

function describeWeather(code: number) {
  return WMO_DESCRIPTIONS[code] ?? { label: 'Unknown', icon: '🌡️' };
}

export async function GET() {
  try {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', String(LAT));
    url.searchParams.set('longitude', String(LON));
    url.searchParams.set('current', 'temperature_2m,apparent_temperature,weather_code');
    url.searchParams.set('temperature_unit', 'celsius');

    const res = await fetch(url.toString(), { next: { revalidate: 600 } });
    if (!res.ok) {
      return Response.json(
        { error: `Open-Meteo responded ${res.status}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const temp = Math.round(data.current.temperature_2m);
    const feelsLike = Math.round(data.current.apparent_temperature);
    const code = data.current.weather_code;
    const { label, icon } = describeWeather(code);

    return Response.json({ temp, feelsLike, label, icon, unit: '°C' });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : 'Weather fetch failed' },
      { status: 500 }
    );
  }
}
