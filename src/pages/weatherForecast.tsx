import Footer from '@/components/custom/footer';
import Navbar from '@/components/custom/navbar';
import { Container, Flex } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useAppState } from '@/state/app-state';
import type { SnapshotSelection } from '@/components/custom/current-weather/types';
import { buildActiveSnapshotView } from '@/components/custom/current-weather/metric-builders';
import { LocationBanner } from '@/components/custom/current-weather/LocationBanner';
import { MetricGrid } from '@/components/custom/current-weather/MetricGrid';
import { ForecastSection } from '@/components/custom/current-weather/ForecastSection';
import { useCurrentWeatherPageData } from '@/hooks/useCurrentWeatherPageData';

function WeatherForecast() {
  const { location } = useAppState();
  const [selectedSnapshot, setSelectedSnapshot] = useState<SnapshotSelection | undefined>();

  const {
    currentWeather,
    dailyForecast,
    forecastError,
  } = useCurrentWeatherPageData({
    city: location.city,
    country: location.country,
  });

  useEffect(() => {
    if (dailyForecast?.data?.[0]) {
      setSelectedSnapshot({ kind: 'forecast', day: dailyForecast.data[0] });
    }
  }, [location.city, location.country, dailyForecast]);

  const weather = currentWeather?.data?.[0];
  const forecastDays = dailyForecast?.data?.slice(0, 3) ?? [];

  const activeHeader = selectedSnapshot ? buildActiveSnapshotView({
    selection: selectedSnapshot,
    location,
    weather,
    dailyForecast,
  }) : { metrics: [] };

  return (
    <Flex direction="column" minH="100vh" bg="gray.50">
      <Navbar />

      <Container as="main" maxW="6xl" py={12} flex="1">
        <Flex direction="column" gap={6}>
          <LocationBanner location={location} />

          <ForecastSection
            dailyForecast={dailyForecast}
            forecastError={forecastError}
            days={forecastDays}
            selectedSnapshot={selectedSnapshot}
            onSelect={setSelectedSnapshot}
          />

          <MetricGrid metrics={activeHeader.metrics} />
        </Flex>
      </Container>

      <Footer />
    </Flex>
  );
}

export default WeatherForecast;
