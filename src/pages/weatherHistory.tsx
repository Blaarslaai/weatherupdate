import Footer from '@/components/custom/footer';
import Navbar from '@/components/custom/navbar';
import { Container, Flex } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useAppState } from '@/state/app-state';
import type { SnapshotSelection } from '@/components/custom/current-weather/types';
import { buildActiveSnapshotView } from '@/components/custom/current-weather/metric-builders';
import { LocationBanner } from '@/components/custom/current-weather/LocationBanner';
import { MetricGrid } from '@/components/custom/current-weather/MetricGrid';
import { HistorySection } from '@/components/custom/current-weather/HistorySection';
import { useCurrentWeatherPageData } from '@/hooks/useCurrentWeatherPageData';
import CloudBackground from '@/components/custom/cloudBackground';

function WeatherHistory() {
  const { location } = useAppState();
  const [selectedSnapshot, setSelectedSnapshot] = useState<SnapshotSelection | undefined>();

  const {
    currentWeather,
    dailyHistory,
    historyError,
  } = useCurrentWeatherPageData({
    city: location.city,
    country: location.country,
  });

  useEffect(() => {
    if (dailyHistory?.data?.[0]) {
      setSelectedSnapshot({ kind: 'history', day: dailyHistory.data[0] });
    }
  }, [location.city, location.country, dailyHistory]);

  const weather = currentWeather?.data?.[0];
  const historyDays = (dailyHistory?.data ?? []).slice(0, 3);

  const activeHeader = selectedSnapshot ? buildActiveSnapshotView({
    selection: selectedSnapshot,
    location,
    weather,
    dailyHistory,
  }) : { metrics: [] };

  return (
    <Flex direction="column" minH="100vh" bg="gray.50">
      <Navbar />

      <Container as="main" py={12} flex="1">
      <CloudBackground />

        <Flex direction="column" gap={6}>
          <LocationBanner location={location} />

          <HistorySection
            dailyHistory={dailyHistory}
            historyError={historyError}
            days={historyDays}
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

export default WeatherHistory;
