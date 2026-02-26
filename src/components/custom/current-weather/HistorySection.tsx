import { Badge, Box, Button, Flex, HStack, SimpleGrid, Spinner, Text, VStack } from '@chakra-ui/react';
import type { DailyHistoryDay, DailyHistoryResponse } from '@/schemas/dailyHistorySchemas';
import type { SnapshotSelection } from './types';
import { formatDayLabel } from './utils';

type HistorySectionProps = {
  dailyHistory: DailyHistoryResponse | null;
  historyError: string | null;
  days: DailyHistoryDay[];
  selectedSnapshot?: SnapshotSelection;
  onSelect: (snapshot: SnapshotSelection) => void;
};

export function HistorySection({
  dailyHistory,
  historyError,
  days,
  selectedSnapshot,
  onSelect,
}: HistorySectionProps) {
  return (
    <Box
      bg="white"
      p={{ base: 5, md: 6 }}
      rounded="xl"
      boxShadow="md"
      border="1px solid"
      borderColor="gray.200"
      zIndex={10}
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
        {dailyHistory ? (
          <Text fontSize="sm" color="gray.500">
            {dailyHistory.city_name}
            {dailyHistory.state_code ? `, ${dailyHistory.state_code}` : ''} • {dailyHistory.country_code}
          </Text>
        ) : null}
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

      {days.length > 0 ? (
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
          {days.map((day) => {
            const isActive =
              selectedSnapshot?.kind === 'history' &&
              selectedSnapshot.day.datetime === day.datetime;

            return (
              <Button
              key={day.datetime}
              variant="outline"
              h="auto"
              p={0}
              textAlign="left"
              borderColor={isActive ? 'blue.200' : 'gray.200'}
              bg={isActive ? 'blue.100' : 'gray.50'}
              _hover={{ bg: 'blue.50', borderColor: 'blue.200' }}
              _active={{ bg: 'blue.100', borderColor: 'blue.200' }}
              onClick={() => onSelect({ kind: 'history', day })}
            >
              <VStack align="stretch" w="full" p={4} gap={2}>
                <HStack justify="space-between">
                  <Text fontWeight="bold" color="gray.800">
                    {formatDayLabel(day.datetime)}
                  </Text>
                  <Badge colorPalette={(day.max_uv ?? 0) > 5 ? 'red' : (day.max_uv ?? 0) > 2 ? 'yellow' : 'green'} variant="subtle">
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
            );
          })}
        </SimpleGrid>
      ) : null}
    </Box>
  );
}
