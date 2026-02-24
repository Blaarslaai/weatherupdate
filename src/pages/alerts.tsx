import Footer from '@/components/custom/footer';
import Navbar from '@/components/custom/navbar';
import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Link,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { getWeatherAlerts } from '@/lib/http';
import type { WeatherAlertsResponse } from '@/schemas/weatherAlertSchemas';
import { useAppState } from '@/state/app-state';

type AlertsPageCache = {
  alerts: WeatherAlertsResponse | null;
};

function alertsCacheKey(city: string, country: string) {
  return `weatherupdate.alertsPage.${country.toUpperCase()}.${city.toLowerCase()}`;
}

function Alerts() {
  const { location } = useAppState();
  const [alertsData, setAlertsData] = useState<WeatherAlertsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);

  const loadAlerts = (city: string, country: string, forceRefresh = false) => {
    if (forceRefresh) setIsRefreshing(true);
    if (!forceRefresh) setIsInitialLoading(true);

    return getWeatherAlerts(city, country)
      .then((data) => {
        setAlertsData(data);
        setError(null);
        try {
          const payload: AlertsPageCache = { alerts: data };
          window.localStorage.setItem(alertsCacheKey(city, country), JSON.stringify(payload));
        } catch {
          // Ignore cache write failures.
        }
      })
      .catch((err: unknown) => {
        console.error('Error fetching weather alerts data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load weather alerts.');
      })
      .finally(() => {
        setIsRefreshing(false);
        setIsInitialLoading(false);
      });
  };

  useEffect(() => {
    const city = location.city.trim();
    const country = location.country.trim().toUpperCase();
    if (!city || !country) return;

    try {
      const raw = window.localStorage.getItem(alertsCacheKey(city, country));
      if (raw) {
        const parsed = JSON.parse(raw) as AlertsPageCache;
        if (parsed.alerts) {
          setAlertsData(parsed.alerts);
          setError(null);
          return;
        }
      }
    } catch {
      // Ignore cache read failures.
    }

    void loadAlerts(city, country, false);
  }, [location.city, location.country]);

  const headerLocation =
    alertsData
      ? `${alertsData.city_name}${alertsData.state_code ? `, ${alertsData.state_code}` : ''} • ${alertsData.country_code}`
      : `${location.city}, ${location.country}`;

  const alerts = alertsData?.alerts ?? [];

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
                  Weather Alerts
                </Text>
                <Text mt={2} color="gray.600">
                  {headerLocation}
                </Text>
                {alertsData ? (
                  <Text mt={1} fontSize="sm" color="gray.500">
                    Timezone: {alertsData.timezone}
                  </Text>
                ) : null}
              </Box>

              <HStack gap={3}>
                <Badge colorPalette={alerts.length > 0 ? 'red' : 'green'} variant="subtle" px={3} py={1} rounded="full">
                  {alerts.length} alert{alerts.length === 1 ? '' : 's'}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  colorPalette="blue"
                  onClick={() => void loadAlerts(location.city, location.country, true)}
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

          {isInitialLoading && !alertsData && !error ? (
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
              <Text color="gray.600">Fetching weather alerts...</Text>
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
              <Text fontWeight="semibold">Could not load alerts</Text>
              <Text fontSize="sm" mt={1}>
                {error}
              </Text>
            </Box>
          ) : null}

          {alertsData && alerts.length === 0 ? (
            <Box
              bg="white"
              p={6}
              rounded="xl"
              boxShadow="sm"
              border="1px solid"
              borderColor="gray.200"
            >
              <Text fontWeight="semibold" color="gray.800">
                No active alerts
              </Text>
              <Text mt={1} color="gray.600" fontSize="sm">
                No weather alerts were returned for this location.
              </Text>
            </Box>
          ) : null}

          {alerts.length > 0 ? (
            <VStack align="stretch" gap={4}>
              {alerts.map((alert) => (
                <Box
                  key={alert.uri}
                  bg="white"
                  p={{ base: 4, md: 5 }}
                  rounded="xl"
                  boxShadow="sm"
                  border="1px solid"
                  borderColor="gray.200"
                >
                  <HStack justify="space-between" align="start" flexWrap="wrap" gap={3}>
                    <Box>
                      <Text fontWeight="bold" color="gray.800">
                        {alert.title}
                      </Text>
                      <Text mt={1} color="gray.600" fontSize="sm">
                        {alert.severity}
                      </Text>
                    </Box>
                    <Badge colorPalette="red" variant="subtle">
                      {alert.severity}
                    </Badge>
                  </HStack>

                  <Text mt={3} fontSize="sm" color="gray.700" whiteSpace="pre-wrap">
                    {alert.description}
                  </Text>

                  <VStack align="stretch" gap={1} mt={4}>
                    <Text fontSize="sm" color="gray.600">
                      Effective: {alert.effective_local ?? alert.effective_utc ?? 'N/A'}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Ends: {alert.ends_local ?? alert.ends_utc ?? alert.expires_local ?? 'N/A'}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Regions: {alert.regions.join(', ')}
                    </Text>
                    <Link href={alert.uri} color="blue.600" fontSize="sm" target="_blank" rel="noreferrer">
                      View source
                    </Link>
                  </VStack>
                </Box>
              ))}
            </VStack>
          ) : null}
        </Flex>
      </Container>

      <Footer />
    </Flex>
  );
}

export default Alerts;
