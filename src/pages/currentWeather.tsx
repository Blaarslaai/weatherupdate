import Footer from '@/components/custom/footer';
import Navbar from '@/components/custom/navbar';
import {
  Badge,
  Box,
  Button,
  Container,
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogPositioner,
  DialogRoot,
  DialogTitle,
  Flex,
  HStack,
  Input,
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

function CurrentWeather() {
  const defaultLocation = { city: 'Pretoria', country: 'ZA' };
  const [currentWeather, setCurrentWeather] = useState<CurrentWeatherResponse | null>(null);
  const [dailyForecast, setDailyForecast] = useState<DailyForecastResponse | null>(null);
  const [dailyHistory, setDailyHistory] = useState<DailyHistoryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [forecastError, setForecastError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [searchCountryCode, setSearchCountryCode] = useState(defaultLocation.country);
  const [searchCityName, setSearchCityName] = useState(defaultLocation.city);
  const [activeLocation, setActiveLocation] = useState(defaultLocation);
  const [selectedForecastDay, setSelectedForecastDay] = useState<DailyForecastDay | null>(null);
  const [isForecastDialogOpen, setIsForecastDialogOpen] = useState(false);
  const [selectedHistoryDay, setSelectedHistoryDay] = useState<DailyHistoryDay | null>(null);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);

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
        if (currentResult.status === 'fulfilled') {
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
      })
      .finally(() => {
        setIsRefreshing(false);
      });
  };

  useEffect(() => {
    void loadWeatherData(defaultLocation.city, defaultLocation.country, false);
  }, []);

  const handleSearchLocation = () => {
    const city = searchCityName.trim();
    const country = searchCountryCode.trim().toUpperCase();

    if (!city || !country) {
      setLocationError('Enter a city and 2-letter country code before searching.');
      return;
    }

    setLocationError(null);
    setIsSearchingLocation(true);
    setActiveLocation({ city, country });

    void loadWeatherData(city, country, false).finally(() => {
      setIsSearchingLocation(false);
    });
  };

  const weather = currentWeather?.data?.[0];
  const forecastDays = dailyForecast?.data?.slice(0, 3) ?? [];
  const historyDays = (dailyHistory?.data ?? []).slice(0, 3);

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

  return (
    <Flex direction="column" minH="100vh" bg="gray.50">
      <Navbar />

      <Container as="main" maxW="6xl" py={12} flex="1">
        <Flex direction="column" gap={6}>
          <Box
            bg="white"
            p={{ base: 5, md: 6 }}
            rounded="xl"
            boxShadow="md"
            border="1px solid"
            borderColor="gray.200"
          >
            <Text fontSize="xl" fontWeight="bold" color="gray.800">
              Location Search
            </Text>
            <Text fontSize="sm" color="gray.600" mt={1}>
              Enter a city and a 2-letter country code to update all weather panels.
            </Text>

            <SimpleGrid columns={{ base: 1, md: 3 }} gap={4} mt={4}>
              <Box>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  City
                </Text>
                <Input
                  value={searchCityName}
                  onChange={(event) => setSearchCityName(event.target.value)}
                  placeholder="e.g. Pretoria"
                />
              </Box>

              <Box>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  Country Code
                </Text>
                <Input
                  value={searchCountryCode}
                  onChange={(event) => setSearchCountryCode(event.target.value.toUpperCase())}
                  placeholder="e.g. ZA"
                  maxLength={2}
                />
              </Box>

              <Flex align="end">
                <Button
                  colorPalette="blue"
                  w="full"
                  onClick={handleSearchLocation}
                  disabled={
                    isSearchingLocation ||
                    !searchCityName.trim() ||
                    !searchCountryCode.trim()
                  }
                >
                  {isSearchingLocation ? (
                    <>
                      <Spinner size="xs" mr={2} />
                      Searching...
                    </>
                  ) : (
                    'Search'
                  )}
                </Button>
              </Flex>
            </SimpleGrid>

            <HStack mt={4} gap={3} flexWrap="wrap">
              <Badge colorPalette="green" variant="subtle" px={3} py={1} rounded="full">
                Active: {activeLocation.city}, {activeLocation.country}
              </Badge>
              {locationError ? (
                <Text fontSize="sm" color="red.600">
                  {locationError}
                </Text>
              ) : null}
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
                  Current Weather
                </Text>
                <Text mt={2} color="gray.600">
                  {weather
                    ? `${weather.city_name}${weather.state_code ? `, ${weather.state_code}` : ''} • ${weather.country_code}`
                    : 'Loading current conditions...'}
                </Text>
                {weather ? (
                  <Text mt={1} color="gray.500" fontSize="sm">
                    Observed at {weather.ob_time} ({weather.timezone})
                  </Text>
                ) : null}
              </Box>

              <HStack gap={3} align="center">
                {weather ? (
                  <Badge colorPalette="blue" variant="subtle" px={3} py={1} rounded="full">
                    {weather.weather.description}
                  </Badge>
                ) : null}
                <Button
                  size="sm"
                  variant="outline"
                  colorPalette="blue"
                  onClick={() =>
                    void loadWeatherData(activeLocation.city, activeLocation.country, true)
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

          {weather ? (
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={4}>
              {metrics.map((metric) => (
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
                      setSelectedForecastDay(day);
                      setIsForecastDialogOpen(true);
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
                      setSelectedHistoryDay(day);
                      setIsHistoryDialogOpen(true);
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

      <DialogRoot
        open={isForecastDialogOpen}
        onOpenChange={(details) => {
          setIsForecastDialogOpen(details.open);
          if (!details.open) {
            setSelectedForecastDay(null);
          }
        }}
      >
        <DialogBackdrop />
        <DialogPositioner>
          <DialogContent maxW="3xl">
            <DialogHeader>
              <DialogTitle>
                {selectedForecastDay
                  ? `Forecast Details • ${formatDayLabel(selectedForecastDay.valid_date)}`
                  : 'Forecast Details'}
              </DialogTitle>
              {selectedForecastDay ? (
                <Text fontSize="sm" color="gray.600" mt={1}>
                  {selectedForecastDay.valid_date} • {selectedForecastDay.weather.description}
                </Text>
              ) : null}
              <DialogCloseTrigger />
            </DialogHeader>
            <DialogBody pb={6}>
              {selectedForecastDay ? (
                <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
                  {selectedDayMetrics.map((metric) => (
                    <MetricCard
                      key={metric.label}
                      label={metric.label}
                      value={metric.value}
                      subtext={metric.subtext}
                    />
                  ))}
                </SimpleGrid>
              ) : (
                <Text color="gray.600">No forecast day selected.</Text>
              )}
            </DialogBody>
          </DialogContent>
        </DialogPositioner>
      </DialogRoot>

      <DialogRoot
        open={isHistoryDialogOpen}
        onOpenChange={(details) => {
          setIsHistoryDialogOpen(details.open);
          if (!details.open) {
            setSelectedHistoryDay(null);
          }
        }}
      >
        <DialogBackdrop />
        <DialogPositioner>
          <DialogContent maxW="3xl">
            <DialogHeader>
              <DialogTitle>
                {selectedHistoryDay
                  ? `History Details • ${formatDayLabel(selectedHistoryDay.datetime)}`
                  : 'History Details'}
              </DialogTitle>
              {selectedHistoryDay ? (
                <Text fontSize="sm" color="gray.600" mt={1}>
                  {selectedHistoryDay.datetime} • Revision {selectedHistoryDay.revision_status ?? 'N/A'}
                </Text>
              ) : null}
              <DialogCloseTrigger />
            </DialogHeader>
            <DialogBody pb={6}>
              {selectedHistoryDay ? (
                <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
                  {selectedHistoryMetrics.map((metric) => (
                    <MetricCard
                      key={metric.label}
                      label={metric.label}
                      value={metric.value}
                      subtext={metric.subtext}
                    />
                  ))}
                </SimpleGrid>
              ) : (
                <Text color="gray.600">No history day selected.</Text>
              )}
            </DialogBody>
          </DialogContent>
        </DialogPositioner>
      </DialogRoot>

      <Footer />
    </Flex>
  );
}

export default CurrentWeather;
