import type { DailyForecastDay, DailyForecastResponse } from '@/schemas/dailyForecastSchemas';
import type { DailyHistoryDay, DailyHistoryResponse } from '@/schemas/dailyHistorySchemas';
import type { CurrentObservation, MetricItem, ActiveSnapshotView } from './types';
import type { SnapshotSelection } from './types';
import { formatDayLabel, formatTimeFromUnix } from './utils';

export function buildCurrentMetrics(weather?: CurrentObservation | null): MetricItem[] {
  if (!weather) return [];

  return [
    {
      label: 'Temperature',
      value: `${weather.temp.toFixed(1)}°C`,
      subtext: `Feels like ${weather.app_temp.toFixed(1)}°C`,
    },
    {
      label: 'Condition',
      value: weather.weather.description,
      subtext: `Cloud cover ${weather.clouds}%`,
    },
    {
      label: 'Wind',
      value: `${weather.wind_spd.toFixed(1)} m/s`,
      subtext: `${weather.wind_cdir_full} (${weather.wind_dir}°)${
        weather.gust ? ` • Gust ${weather.gust.toFixed(1)} m/s` : ''
      }`,
    },
    {
      label: 'Solar Radiation',
      value: weather.solar_rad != null ? `${weather.solar_rad.toFixed(0)} W/m²` : 'N/A',
      subtext:
        weather.ghi != null || weather.dni != null || weather.dhi != null
          ? `GHI ${weather.ghi ?? 'N/A'} • DNI ${weather.dni ?? 'N/A'} • DHI ${weather.dhi ?? 'N/A'}`
          : undefined,
    },
    {
      label: 'Humidity',
      value: `${weather.rh}%`,
      subtext: `Dew point ${weather.dewpt.toFixed(1)}°C`,
    },
    {
      label: 'UV Index',
      value: `${weather.uv}`,
      subtext: weather.aqi != null ? `Air quality index ${weather.aqi}` : undefined,
    },
    {
      label: 'Pressure',
      value: `${weather.pres.toFixed(1)} mb`,
      subtext: weather.slp != null ? `Sea level ${weather.slp.toFixed(1)} mb` : undefined,
    },
    {
      label: 'Visibility',
      value: `${weather.vis} km`,
      subtext: `Precipitation ${weather.precip} mm/hr`,
    },
    {
      label: 'Sun',
      value: `${weather.sunrise} / ${weather.sunset}`,
      subtext: 'Sunrise / Sunset',
    },
  ];
}

export function buildForecastMetrics(day?: DailyForecastDay | null): MetricItem[] {
  if (!day) return [];

  return [
    {
      label: 'Average Temp',
      value: `${day.temp.toFixed(1)}°C`,
      subtext: `Feels like ${day.app_min_temp.toFixed(1)}°C to ${day.app_max_temp.toFixed(1)}°C`,
    },
    {
      label: 'High / Low',
      value: `${day.max_temp.toFixed(1)}°C / ${day.min_temp.toFixed(1)}°C`,
      subtext: `High ${day.high_temp.toFixed(1)}°C • Low ${day.low_temp.toFixed(1)}°C`,
    },
    {
      label: 'Condition',
      value: day.weather.description,
      subtext: `Clouds ${day.clouds}% • POP ${day.pop}%`,
    },
    {
      label: 'Wind',
      value: `${day.wind_spd.toFixed(1)} m/s`,
      subtext: `${day.wind_cdir_full} (${day.wind_dir}°)${
        day.wind_gust_spd != null ? ` • Gust ${day.wind_gust_spd.toFixed(1)} m/s` : ''
      }`,
    },
    {
      label: 'Humidity',
      value: `${day.rh}%`,
      subtext: `Dew point ${day.dewpt.toFixed(1)}°C`,
    },
    {
      label: 'Precip / Snow',
      value: `${day.precip} mm`,
      subtext: `Snow ${day.snow ?? 0} • Depth ${day.snow_depth ?? 0}`,
    },
    {
      label: 'Pressure',
      value: `${day.pres} mb`,
      subtext: day.slp != null ? `Sea level ${day.slp} mb` : undefined,
    },
    {
      label: 'UV / Visibility',
      value: `UV ${day.uv}`,
      subtext: `Visibility ${day.vis} km`,
    },
    {
      label: 'Sunrise / Sunset',
      value: `${formatTimeFromUnix(day.sunrise_ts)} / ${formatTimeFromUnix(day.sunset_ts)}`,
      subtext: 'Local time',
    },
    {
      label: 'Moonrise / Moonset',
      value: `${formatTimeFromUnix(day.moonrise_ts)} / ${formatTimeFromUnix(day.moonset_ts)}`,
      subtext: `Phase ${Math.round(day.moon_phase * 100)}%`,
    },
    {
      label: 'Cloud Layers',
      value: `${day.clouds_hi ?? 0}% / ${day.clouds_mid ?? 0}% / ${day.clouds_low ?? 0}%`,
      subtext: 'High / Mid / Low',
    },
    {
      label: 'Ozone / Max DHI',
      value: `${day.ozone ?? 'N/A'}`,
      subtext: day.max_dhi != null ? `Max DHI ${day.max_dhi}` : 'Max DHI unavailable',
    },
  ];
}

export function buildHistoryMetrics(day?: DailyHistoryDay | null): MetricItem[] {
  if (!day) return [];

  return [
    {
      label: 'Average Temperature',
      value: `${day.temp.toFixed(1)}°C`,
      subtext: `Max ${day.max_temp.toFixed(1)}°C • Min ${day.min_temp.toFixed(1)}°C`,
    },
    {
      label: 'Humidity',
      value: `${day.rh.toFixed(0)}%`,
      subtext: `Dew point ${day.dewpt.toFixed(1)}°C`,
    },
    {
      label: 'Wind',
      value: `${day.wind_spd.toFixed(1)} m/s`,
      subtext: `Dir ${day.wind_dir}° • Gust ${day.wind_gust_spd ?? 'N/A'} m/s`,
    },
    {
      label: 'Max Wind',
      value: `${day.max_wind_spd ?? 'N/A'} m/s`,
      subtext: day.max_wind_dir != null ? `Direction ${day.max_wind_dir}°` : undefined,
    },
    {
      label: 'Pressure',
      value: `${day.pres.toFixed(1)} mb`,
      subtext: day.slp != null ? `Sea level ${day.slp.toFixed(1)} mb` : undefined,
    },
    {
      label: 'Precipitation',
      value: `${day.precip} mm`,
      subtext: day.precip_gpm != null ? `GPM precip ${day.precip_gpm} mm` : undefined,
    },
    {
      label: 'Snow',
      value: `${day.snow ?? 0}`,
      subtext: `Snow depth ${day.snow_depth ?? 0}`,
    },
    {
      label: 'Clouds / DHI',
      value: `${day.clouds ?? 'N/A'}%`,
      subtext: `DHI ${day.dhi ?? 'N/A'} • Max DHI ${day.max_dhi ?? 'N/A'}`,
    },
    {
      label: 'UV / tDHI',
      value: `UV ${day.max_uv ?? 'N/A'}`,
      subtext: `tDHI ${day.t_dhi ?? 'N/A'}`,
    },
    {
      label: 'Revision',
      value: day.revision_status ?? 'N/A',
      subtext: day.revision_version != null ? `Version ${day.revision_version}` : undefined,
    },
  ];
}

type BuildActiveSnapshotArgs = {
  selection: SnapshotSelection;
  location: { city: string; country: string };
  weather?: CurrentObservation | null;
  dailyForecast?: DailyForecastResponse | null;
  dailyHistory?: DailyHistoryResponse | null;
};

export function buildActiveSnapshotView({
  selection,
  location,
  weather,
  dailyForecast,
  dailyHistory,
}: BuildActiveSnapshotArgs): ActiveSnapshotView {
  if (selection.kind === 'forecast') {
    const day = selection.day;
    return {
      title: `Forecast Snapshot • ${formatDayLabel(day.valid_date)}`,
      subtitle: `${dailyForecast?.city_name ?? location.city}${dailyForecast?.state_code ? `, ${dailyForecast.state_code}` : ''} • ${dailyForecast?.country_code ?? location.country}`,
      meta: `${day.valid_date} • ${day.weather.description}`,
      badge: day.weather.description,
      metrics: buildForecastMetrics(day),
    };
  }

  if (selection.kind === 'history') {
    const day = selection.day;
    return {
      title: `History Snapshot • ${formatDayLabel(day.datetime)}`,
      subtitle: `${dailyHistory?.city_name ?? location.city}${dailyHistory?.state_code ? `, ${dailyHistory.state_code}` : ''} • ${dailyHistory?.country_code ?? location.country}`,
      meta: `${day.datetime} • Revision ${day.revision_status ?? 'N/A'}`,
      badge: 'Historical',
      metrics: buildHistoryMetrics(day),
    };
  }

  return {
    title: 'Current Weather',
    subtitle: weather
      ? `${weather.city_name}${weather.state_code ? `, ${weather.state_code}` : ''} • ${weather.country_code}`
      : 'Loading current conditions...',
    meta: weather ? `Observed at ${weather.ob_time} (${weather.timezone})` : undefined,
    badge: weather?.weather.description,
    metrics: buildCurrentMetrics(weather),
  };
}
