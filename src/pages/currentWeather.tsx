import Footer from '@/components/custom/footer';
import Navbar from '@/components/custom/navbar';
import { Box, Container, Flex, Spinner, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useAppState } from '@/state/app-state';
import type { SnapshotSelection } from '@/components/custom/current-weather/types';
import { buildActiveSnapshotView } from '@/components/custom/current-weather/metric-builders';
import { LocationBanner } from '@/components/custom/current-weather/LocationBanner';
import { SnapshotHeaderCard } from '@/components/custom/current-weather/SnapshotHeaderCard';
import { MetricGrid } from '@/components/custom/current-weather/MetricGrid';
import { useCurrentWeatherPageData } from '@/hooks/useCurrentWeatherPageData';
import CloudBackground from '@/components/custom/cloudBackground';

function CurrentWeather() {
  const { location } = useAppState();
  const [selectedSnapshot, setSelectedSnapshot] = useState<SnapshotSelection>({ kind: 'current' });

  const {
    currentWeather,
    dailyForecast,
    dailyHistory,
    error,
    isRefreshing,
    loadWeatherData,
  } = useCurrentWeatherPageData({
    city: location.city,
    country: location.country,
  });

  useEffect(() => {
    setSelectedSnapshot({ kind: 'current' });
  }, [location.city, location.country]);

  const weather = currentWeather?.data?.[0];

  const activeHeader = buildActiveSnapshotView({
    selection: selectedSnapshot,
    location,
    weather,
    dailyForecast,
    dailyHistory,
  });

  return (
    <Flex direction="column" minH="100vh" bg="blue.50">
      <Navbar />

      <Container as="main" py={12} flex="1">
      <CloudBackground />

        <Flex direction="column" gap={6}>
          <LocationBanner location={location} />

          <SnapshotHeaderCard
            view={activeHeader}
            selectedSnapshot={selectedSnapshot}
            isRefreshing={isRefreshing}
            onShowCurrent={() => setSelectedSnapshot({ kind: 'current' })}
            onRefresh={() => void loadWeatherData(true)}
          />

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

          <MetricGrid metrics={activeHeader.metrics} />
        </Flex>
      </Container>

      <Footer />
    </Flex>
  );
}

export default CurrentWeather;
