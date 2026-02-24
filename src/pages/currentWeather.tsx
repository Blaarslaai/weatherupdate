import Footer from '@/components/custom/footer';
import Navbar from '@/components/custom/navbar';
import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  HStack,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import {
  getCurrentWeather,
  getDailyForecast,
  getDailyHistory,
} from '@/lib/http';
import type { CurrentWeatherResponse } from '@/schemas/currentWeatherSchemas';
import type { DailyForecastDay, DailyForecastResponse } from '@/schemas/dailyForecastSchemas';
import type { DailyHistoryDay, DailyHistoryResponse } from '@/schemas/dailyHistorySchemas';
import { useAppState } from '@/state/app-state';

type MetricCardProps = {
  label: string;
  value: string;
  subtext?: string;
};

function MetricCard({ label, value, subtext }: MetricCardProps) {
  return (
    <Box
      bg="white"
      p={5}
      rounded="xl"
      border="1px solid"
      borderColor="gray.200"
      boxShadow="sm"
    >
      <Text fontSize="sm" color="gray.500" mb={1}>
        {label}
      </Text>
      <Text fontSize="2xl" fontWeight="bold" color="gray.800" lineHeight="1.1">
        {value}
      </Text>
      {subtext ? (
        <Text mt={2} fontSize="sm" color="gray.600">
          {subtext}
        </Text>
      ) : null}
    </Box>
  );
}

function formatDayLabel(date: string) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${date}T12:00:00`));
}

function formatTimeFromUnix(timestamp?: number) {
  if (!timestamp) return 'N/A';

  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(timestamp * 1000));
}

function cacheKey(city: string, country: string) {
  return `weatherupdate.currentWeatherPage.${country.toUpperCase()}.${city.toLowerCase()}`;
}

type CurrentWeatherPageCache = {
  currentWeather: CurrentWeatherResponse | null;
  dailyForecast: DailyForecastResponse | null;
  dailyHistory: DailyHistoryResponse | null;
};

type SnapshotSelection =
  | { kind: 'current' }
  | { kind: 'forecast'; day: DailyForecastDay }
  | { kind: 'history'; day: DailyHistoryDay };

function CurrentWeather() {
  const { location } = useAppState();
  const [currentWeather, setCurrentWeather] = useState<CurrentWeatherResponse | null>(null);
  const [dailyForecast, setDailyForecast] = useState<DailyForecastResponse | null>(null);
  const [dailyHistory, setDailyHistory] = useState<DailyHistoryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [forecastError, setForecastError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedSnapshot, setSelectedSnapshot] = useState<SnapshotSelection>({ kind: 'current' });

  const loadWeatherData = (city: string, country: string, forceRefresh = false) => {
    setIsRefreshing(forceRefresh);
    if (!currentWeather) setError(null);
    if (!dailyForecast) setForecastError(null);
    if (!dailyHistory) setHistoryError(null);

    return Promise.allSettled([
      getCurrentWeather(city, country, { forceRefresh }),
      getDailyForecast(city, country, { forceRefresh, days: 3 }),
      getDailyHistory(city, country, { forceRefresh }),
    ])
      .then(([currentResult, forecastResult, historyResult]) => {
        let nextCurrent: CurrentWeatherResponse | null = null;
        let nextForecast: DailyForecastResponse | null = null;
        let nextHistory: DailyHistoryResponse | null = null;

        if (currentResult.status === 'fulfilled') {
          nextCurrent = currentResult.value;
          setCurrentWeather(currentResult.value);
          setError(null);
        } else {
          console.error('Error fetching current weather data:', currentResult.reason);
          setError(
            currentResult.reason instanceof Error
              ? currentResult.reason.message
              : 'Failed to load current weather.',
          );
        }

        if (forecastResult.status === 'fulfilled') {
          nextForecast = forecastResult.value;
          setDailyForecast(forecastResult.value);
          setForecastError(null);
        } else {
          console.error('Error fetching daily forecast data:', forecastResult.reason);
          setForecastError(
            forecastResult.reason instanceof Error
              ? forecastResult.reason.message
              : 'Failed to load daily forecast.',
          );
        }

        if (historyResult.status === 'fulfilled') {
          nextHistory = historyResult.value;
          setDailyHistory(historyResult.value);
          setHistoryError(null);
        } else {
          console.error('Error fetching daily history data:', historyResult.reason);
          setHistoryError(
            historyResult.reason instanceof Error
              ? historyResult.reason.message
              : 'Failed to load daily history.',
          );
        }

        if (nextCurrent || nextForecast || nextHistory) {
          const payload: CurrentWeatherPageCache = {
            currentWeather: nextCurrent ?? currentWeather,
            dailyForecast: nextForecast ?? dailyForecast,
            dailyHistory: nextHistory ?? dailyHistory,
          };
          try {
            window.localStorage.setItem(cacheKey(city, country), JSON.stringify(payload));
          } catch {
            // Ignore cache write failures.
          }
        }
      })
      .finally(() => {
        setIsRefreshing(false);
      });
  };

  useEffect(() => {
    const city = location.city.trim();
    const country = location.country.trim().toUpperCase();

    if (!city || !country) return;

    try {
      const raw = window.localStorage.getItem(cacheKey(city, country));
      if (raw) {
        const cached = JSON.parse(raw) as CurrentWeatherPageCache;
        if (cached.currentWeather) setCurrentWeather(cached.currentWeather);
        if (cached.dailyForecast) setDailyForecast(cached.dailyForecast);
        if (cached.dailyHistory) setDailyHistory(cached.dailyHistory);
        setError(null);
        setForecastError(null);
        setHistoryError(null);
        return;
      }
    } catch {
      // Ignore cache read failures.
    }

    void loadWeatherData(city, country, false);
  }, [location.city, location.country]);

  const weather = currentWeather?.data?.[0];
  const forecastDays = dailyForecast?.data?.slice(0, 3) ?? [];
  const historyDays = (dailyHistory?.data ?? []).slice(0, 3);
  const selectedForecastDay = selectedSnapshot.kind === 'forecast' ? selectedSnapshot.day : null;
  const selectedHistoryDay = selectedSnapshot.kind === 'history' ? selectedSnapshot.day : null;

  useEffect(() => {
    setSelectedSnapshot({ kind: 'current' });
  }, [location.city, location.country]);

  const metrics = weather
    ? [
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
      ]
    : [];

  const selectedDayMetrics = selectedForecastDay
    ? [
        {
          label: 'Average Temp',
          value: `${selectedForecastDay.temp.toFixed(1)}°C`,
          subtext: `Feels like ${selectedForecastDay.app_min_temp.toFixed(1)}°C to ${selectedForecastDay.app_max_temp.toFixed(1)}°C`,
        },
        {
          label: 'High / Low',
          value: `${selectedForecastDay.max_temp.toFixed(1)}°C / ${selectedForecastDay.min_temp.toFixed(1)}°C`,
          subtext: `High ${selectedForecastDay.high_temp.toFixed(1)}°C • Low ${selectedForecastDay.low_temp.toFixed(1)}°C`,
        },
        {
          label: 'Condition',
          value: selectedForecastDay.weather.description,
          subtext: `Clouds ${selectedForecastDay.clouds}% • POP ${selectedForecastDay.pop}%`,
        },
        {
          label: 'Wind',
          value: `${selectedForecastDay.wind_spd.toFixed(1)} m/s`,
          subtext: `${selectedForecastDay.wind_cdir_full} (${selectedForecastDay.wind_dir}°)${
            selectedForecastDay.wind_gust_spd != null
              ? ` • Gust ${selectedForecastDay.wind_gust_spd.toFixed(1)} m/s`
              : ''
          }`,
        },
        {
          label: 'Humidity',
          value: `${selectedForecastDay.rh}%`,
          subtext: `Dew point ${selectedForecastDay.dewpt.toFixed(1)}°C`,
        },
        {
          label: 'Precip / Snow',
          value: `${selectedForecastDay.precip} mm`,
          subtext: `Snow ${selectedForecastDay.snow ?? 0} • Depth ${selectedForecastDay.snow_depth ?? 0}`,
        },
        {
          label: 'Pressure',
          value: `${selectedForecastDay.pres} mb`,
          subtext:
            selectedForecastDay.slp != null
              ? `Sea level ${selectedForecastDay.slp} mb`
              : undefined,
        },
        {
          label: 'UV / Visibility',
          value: `UV ${selectedForecastDay.uv}`,
          subtext: `Visibility ${selectedForecastDay.vis} km`,
        },
        {
          label: 'Sunrise / Sunset',
          value: `${formatTimeFromUnix(selectedForecastDay.sunrise_ts)} / ${formatTimeFromUnix(selectedForecastDay.sunset_ts)}`,
          subtext: 'Local time',
        },
        {
          label: 'Moonrise / Moonset',
          value: `${formatTimeFromUnix(selectedForecastDay.moonrise_ts)} / ${formatTimeFromUnix(selectedForecastDay.moonset_ts)}`,
          subtext: `Phase ${Math.round(selectedForecastDay.moon_phase * 100)}%`,
        },
        {
          label: 'Cloud Layers',
          value: `${selectedForecastDay.clouds_hi ?? 0}% / ${selectedForecastDay.clouds_mid ?? 0}% / ${selectedForecastDay.clouds_low ?? 0}%`,
          subtext: 'High / Mid / Low',
        },
        {
          label: 'Ozone / Max DHI',
          value: `${selectedForecastDay.ozone ?? 'N/A'}`,
          subtext:
            selectedForecastDay.max_dhi != null
              ? `Max DHI ${selectedForecastDay.max_dhi}`
              : 'Max DHI unavailable',
        },
      ]
    : [];

  const selectedHistoryMetrics = selectedHistoryDay
    ? [
        {
          label: 'Average Temperature',
          value: `${selectedHistoryDay.temp.toFixed(1)}°C`,
          subtext: `Max ${selectedHistoryDay.max_temp.toFixed(1)}°C • Min ${selectedHistoryDay.min_temp.toFixed(1)}°C`,
        },
        {
          label: 'Humidity',
          value: `${selectedHistoryDay.rh.toFixed(0)}%`,
          subtext: `Dew point ${selectedHistoryDay.dewpt.toFixed(1)}°C`,
        },
        {
          label: 'Wind',
          value: `${selectedHistoryDay.wind_spd.toFixed(1)} m/s`,
          subtext: `Dir ${selectedHistoryDay.wind_dir}° • Gust ${selectedHistoryDay.wind_gust_spd ?? 'N/A'} m/s`,
        },
        {
          label: 'Max Wind',
          value: `${selectedHistoryDay.max_wind_spd ?? 'N/A'} m/s`,
          subtext:
            selectedHistoryDay.max_wind_dir != null
              ? `Direction ${selectedHistoryDay.max_wind_dir}°`
              : undefined,
        },
        {
          label: 'Pressure',
          value: `${selectedHistoryDay.pres.toFixed(1)} mb`,
          subtext:
            selectedHistoryDay.slp != null
              ? `Sea level ${selectedHistoryDay.slp.toFixed(1)} mb`
              : undefined,
        },
        {
          label: 'Precipitation',
          value: `${selectedHistoryDay.precip} mm`,
          subtext:
            selectedHistoryDay.precip_gpm != null
              ? `GPM precip ${selectedHistoryDay.precip_gpm} mm`
              : undefined,
        },
        {
          label: 'Snow',
          value: `${selectedHistoryDay.snow ?? 0}`,
          subtext: `Snow depth ${selectedHistoryDay.snow_depth ?? 0}`,
        },
        {
          label: 'Clouds / DHI',
          value: `${selectedHistoryDay.clouds ?? 'N/A'}%`,
          subtext: `DHI ${selectedHistoryDay.dhi ?? 'N/A'} • Max DHI ${selectedHistoryDay.max_dhi ?? 'N/A'}`,
        },
        {
          label: 'UV / tDHI',
          value: `UV ${selectedHistoryDay.max_uv ?? 'N/A'}`,
          subtext: `tDHI ${selectedHistoryDay.t_dhi ?? 'N/A'}`,
        },
        {
          label: 'Revision',
          value: selectedHistoryDay.revision_status ?? 'N/A',
          subtext:
            selectedHistoryDay.revision_version != null
              ? `Version ${selectedHistoryDay.revision_version}`
              : undefined,
        },
      ]
    : [];

  const activeHeader = (() => {
    if (selectedSnapshot.kind === 'forecast' && selectedForecastDay) {
      return {
        title: `Forecast Snapshot • ${formatDayLabel(selectedForecastDay.valid_date)}`,
        subtitle: `${dailyForecast?.city_name ?? location.city}${dailyForecast?.state_code ? `, ${dailyForecast.state_code}` : ''} • ${dailyForecast?.country_code ?? location.country}`,
        meta: `${selectedForecastDay.valid_date} • ${selectedForecastDay.weather.description}`,
        badge: selectedForecastDay.weather.description,
        metrics: selectedDayMetrics,
      };
    }

    if (selectedSnapshot.kind === 'history' && selectedHistoryDay) {
      return {
        title: `History Snapshot • ${formatDayLabel(selectedHistoryDay.datetime)}`,
        subtitle: `${dailyHistory?.city_name ?? location.city}${dailyHistory?.state_code ? `, ${dailyHistory.state_code}` : ''} • ${dailyHistory?.country_code ?? location.country}`,
        meta: `${selectedHistoryDay.datetime} • Revision ${selectedHistoryDay.revision_status ?? 'N/A'}`,
        badge: 'Historical',
        metrics: selectedHistoryMetrics,
      };
    }

    return {
      title: 'Current Weather',
      subtitle: weather
        ? `${weather.city_name}${weather.state_code ? `, ${weather.state_code}` : ''} • ${weather.country_code}`
        : 'Loading current conditions...',
      meta: weather ? `Observed at ${weather.ob_time} (${weather.timezone})` : undefined,
      badge: weather?.weather.description,
      metrics,
    };
  })();

  return (
    <Flex direction="column" minH="100vh" bg="gray.50">
      <Navbar />

      <Container as="main" maxW="6xl" py={12} flex="1">
        <Flex direction="column" gap={6}>
          <Box
            bg="white"
            p={{ base: 4, md: 5 }}
            rounded="xl"
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.200"
          >
            <HStack gap={3} flexWrap="wrap">
              <Badge colorPalette="blue" variant="subtle" px={3} py={1} rounded="full">
                Homepage Selection
              </Badge>
              <Badge colorPalette="green" variant="subtle" px={3} py={1} rounded="full">
                Active: {location.city}, {location.country}
              </Badge>
              <Text fontSize="sm" color="gray.500">
                Update city/country on the home page.
              </Text>
            </HStack>
          </Box>

          <Box
            bg="white"
            p={{ base: 5, md: 8 }}
            rounded="xl"
            boxShadow="md"
            border="1px solid"
            borderColor="gray.200"
          >
            <HStack justify="space-between" align="start" flexWrap="wrap" gap={4}>
              <Box>
                <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold" color="gray.800">
                  {activeHeader.title}
                </Text>
                <Text mt={2} color="gray.600">
                  {activeHeader.subtitle}
                </Text>
                {activeHeader.meta ? (
                  <Text mt={1} color="gray.500" fontSize="sm">
                    {activeHeader.meta}
                  </Text>
                ) : null}
              </Box>

              <HStack gap={3} align="center">
                {activeHeader.badge ? (
                  <Badge colorPalette="blue" variant="subtle" px={3} py={1} rounded="full">
                    {activeHeader.badge}
                  </Badge>
                ) : null}
                {selectedSnapshot.kind !== 'current' ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedSnapshot({ kind: 'current' })}
                  >
                    Show Current
                  </Button>
                ) : null}
                <Button
                  size="sm"
                  variant="outline"
                  colorPalette="blue"
                  onClick={() =>
                    void loadWeatherData(location.city, location.country, true)
                  }
                  disabled={isRefreshing}
                >
                  {isRefreshing ? (
                    <>
                      <Spinner size="xs" mr={2} />
                      Refreshing...
                    </>
                  ) : (
                    'Refresh'
                  )}
                </Button>
              </HStack>
            </HStack>
          </Box>

          {!currentWeather && !error ? (
            <Flex
              bg="white"
              border="1px solid"
              borderColor="gray.200"
              rounded="xl"
              p={8}
              justify="center"
              align="center"
              gap={3}
            >
              <Spinner size="sm" color="blue.500" />
              <Text color="gray.600">Fetching current weather data...</Text>
            </Flex>
          ) : null}

          {error ? (
            <Box
              bg="red.50"
              border="1px solid"
              borderColor="red.200"
              color="red.700"
              rounded="xl"
              p={5}
            >
              <Text fontWeight="semibold">Could not load current weather</Text>
              <Text fontSize="sm" mt={1}>
                {error}
              </Text>
            </Box>
          ) : null}

          {activeHeader.metrics.length > 0 ? (
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={4}>
              {activeHeader.metrics.map((metric) => (
                <MetricCard
                  key={metric.label}
                  label={metric.label}
                  value={metric.value}
                  subtext={metric.subtext}
                />
              ))}
            </SimpleGrid>
          ) : null}

          <Box
            bg="white"
            p={{ base: 5, md: 6 }}
            rounded="xl"
            boxShadow="md"
            border="1px solid"
            borderColor="gray.200"
          >
            <HStack justify="space-between" align="center" flexWrap="wrap" gap={3} mb={4}>
              <Box>
                <Text fontSize="xl" fontWeight="bold" color="gray.800">
                  3-Day Forecast
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Click a day to view detailed forecast metrics.
                </Text>
              </Box>
              <HStack gap={2} flexWrap="wrap" justify="flex-end">
                {dailyForecast ? (
                  <Text fontSize="sm" color="gray.500" ml={{ base: 0, md: 2 }}>
                    {dailyForecast.city_name}
                    {dailyForecast.state_code ? `, ${dailyForecast.state_code}` : ''} •{' '}
                    {dailyForecast.country_code}
                  </Text>
                ) : null}
              </HStack>
            </HStack>

            {!dailyForecast && !forecastError ? (
              <Flex justify="center" align="center" gap={3} py={8}>
                <Spinner size="sm" color="blue.500" />
                <Text color="gray.600">Loading daily forecast...</Text>
              </Flex>
            ) : null}

            {forecastError ? (
              <Box bg="red.50" border="1px solid" borderColor="red.200" rounded="lg" p={4}>
                <Text color="red.700" fontWeight="semibold">
                  Could not load daily forecast
                </Text>
                <Text color="red.600" fontSize="sm" mt={1}>
                  {forecastError}
                </Text>
              </Box>
            ) : null}

            {forecastDays.length > 0 ? (
              <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                {forecastDays.map((day) => (
                  <Button
                    key={day.valid_date}
                    variant="outline"
                    h="auto"
                    p={0}
                    textAlign="left"
                    borderColor="gray.200"
                    bg="gray.50"
                    _hover={{ bg: 'blue.50', borderColor: 'blue.200' }}
                    _active={{ bg: 'blue.100' }}
                    onClick={() => {
                      setSelectedSnapshot({ kind: 'forecast', day });
                    }}
                  >
                    <VStack align="stretch" w="full" p={4} gap={2}>
                      <HStack justify="space-between">
                        <Text fontWeight="bold" color="gray.800">
                          {formatDayLabel(day.valid_date)}
                        </Text>
                        <Badge colorPalette={`${day.uv > 5 ? 'red' : day.uv > 2 ? 'yellow' : 'green'}`} variant="subtle">
                          UV {day.uv}
                        </Badge>
                      </HStack>
                      <Text color="gray.700" fontWeight="medium">
                        {day.weather.description}
                      </Text>
                      <Text color="gray.600" fontSize="sm">
                        High {day.max_temp.toFixed(1)}°C • Low {day.min_temp.toFixed(1)}°C
                      </Text>
                      <Text color="gray.600" fontSize="sm">
                        Wind {day.wind_cdir} {day.wind_spd.toFixed(1)} m/s
                      </Text>
                      <Text color="gray.500" fontSize="xs">
                        Rain chance {day.pop}% • Precip {day.precip} mm
                      </Text>
                    </VStack>
                  </Button>
                ))}
              </SimpleGrid>
            ) : null}
          </Box>

          <Box
            bg="white"
            p={{ base: 5, md: 6 }}
            rounded="xl"
            boxShadow="md"
            border="1px solid"
            borderColor="gray.200"
          >
            <HStack justify="space-between" align="center" flexWrap="wrap" gap={3} mb={4}>
              <Box>
                <Text fontSize="xl" fontWeight="bold" color="gray.800">
                  3-Day History
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Daily historical observations for yesterday through three days back.
                </Text>
              </Box>
              <HStack gap={2} flexWrap="wrap" justify="flex-end">
                {dailyHistory ? (
                  <Text fontSize="sm" color="gray.500" ml={{ base: 0, md: 2 }}>
                    {dailyHistory.city_name}
                    {dailyHistory.state_code ? `, ${dailyHistory.state_code}` : ''} •{' '}
                    {dailyHistory.country_code}
                  </Text>
                ) : null}
              </HStack>
            </HStack>

            {!dailyHistory && !historyError ? (
              <Flex justify="center" align="center" gap={3} py={8}>
                <Spinner size="sm" color="blue.500" />
                <Text color="gray.600">Loading daily history...</Text>
              </Flex>
            ) : null}

            {historyError ? (
              <Box bg="red.50" border="1px solid" borderColor="red.200" rounded="lg" p={4}>
                <Text color="red.700" fontWeight="semibold">
                  Could not load daily history
                </Text>
                <Text color="red.600" fontSize="sm" mt={1}>
                  {historyError}
                </Text>
              </Box>
            ) : null}

            {historyDays.length > 0 ? (
              <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                {historyDays.map((day) => (
                  <Button
                    key={day.datetime}
                    variant="outline"
                    h="auto"
                    p={0}
                    textAlign="left"
                    borderColor="gray.200"
                    bg="gray.50"
                    _hover={{ bg: 'blue.50', borderColor: 'blue.200' }}
                    _active={{ bg: 'blue.100' }}
                    onClick={() => {
                      setSelectedSnapshot({ kind: 'history', day });
                    }}
                  >
                    <VStack align="stretch" w="full" p={4} gap={2}>
                      <HStack justify="space-between">
                        <Text fontWeight="bold" color="gray.800">
                          {formatDayLabel(day.datetime)}
                        </Text>
                        <Badge colorPalette={`${day.max_uv ?? 0 > 5 ? 'red' : day.max_uv ?? 0 > 2 ? 'yellow' : 'green'}`} variant="subtle">
                          UV {day.max_uv ?? 'N/A'}
                        </Badge>
                      </HStack>
                      <Text color="gray.700" fontWeight="medium">
                        Avg {day.temp.toFixed(1)}°C
                      </Text>
                      <Text color="gray.600" fontSize="sm">
                        Max {day.max_temp.toFixed(1)}°C • Min {day.min_temp.toFixed(1)}°C
                      </Text>
                      <Text color="gray.600" fontSize="sm">
                        Wind {day.wind_spd.toFixed(1)} m/s • RH {day.rh.toFixed(0)}%
                      </Text>
                      <Text color="gray.500" fontSize="xs">
                        Precip {day.precip} mm • Clouds {day.clouds ?? 'N/A'}%
                      </Text>
                    </VStack>
                  </Button>
                ))}
              </SimpleGrid>
            ) : null}
          </Box>
        </Flex>
      </Container>

      <Footer />
    </Flex>
  );
}

export default CurrentWeather;
