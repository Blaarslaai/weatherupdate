import { Badge, Box, Button, Flex, HStack, SimpleGrid, Spinner, Text, VStack } from '@chakra-ui/react';
import type { DailyForecastDay, DailyForecastResponse } from '@/schemas/dailyForecastSchemas';
import type { SnapshotSelection } from './types';
import { formatDayLabel } from './utils';

type ForecastSectionProps = {
  dailyForecast: DailyForecastResponse | null;
  forecastError: string | null;
  days: DailyForecastDay[];
  onSelect: (snapshot: SnapshotSelection) => void;
};

export function ForecastSection({ dailyForecast, forecastError, days, onSelect }: ForecastSectionProps) {
  return (
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
            Click a day to populate the main weather cards.
          </Text>
        </Box>
        {dailyForecast ? (
          <Text fontSize="sm" color="gray.500">
            {dailyForecast.city_name}
            {dailyForecast.state_code ? `, ${dailyForecast.state_code}` : ''} • {dailyForecast.country_code}
          </Text>
        ) : null}
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

      {days.length > 0 ? (
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
          {days.map((day) => (
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
              onClick={() => onSelect({ kind: 'forecast', day })}
            >
              <VStack align="stretch" w="full" p={4} gap={2}>
                <HStack justify="space-between">
                  <Text fontWeight="bold" color="gray.800">
                    {formatDayLabel(day.valid_date)}
                  </Text>
                  <Badge colorPalette={day.uv > 5 ? 'red' : day.uv > 2 ? 'yellow' : 'green'} variant="subtle">
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
  );
}
