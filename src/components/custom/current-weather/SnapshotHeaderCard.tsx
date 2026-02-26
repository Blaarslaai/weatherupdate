import { Badge, Box, Button, HStack, Spinner, Text } from '@chakra-ui/react';
import type { ActiveSnapshotView, SnapshotSelection } from './types';

type SnapshotHeaderCardProps = {
  view: ActiveSnapshotView;
  selectedSnapshot: SnapshotSelection;
  isRefreshing: boolean;
  onShowCurrent: () => void;
  onRefresh: () => void;
};

export function SnapshotHeaderCard({
  view,
  selectedSnapshot,
  isRefreshing,
  onShowCurrent,
  onRefresh,
}: SnapshotHeaderCardProps) {
  return (
    <Box
      bg="white"
      p={{ base: 5, md: 8 }}
      rounded="xl"
      boxShadow="md"
      border="1px solid"
      borderColor="gray.200"
      zIndex={10}
    >
      <HStack justify="space-between" align="start" flexWrap="wrap" gap={4}>
        <Box>
          <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold" color="gray.800">
            {view.title}
          </Text>
          <Text mt={2} color="gray.600">
            {view.subtitle}
          </Text>
          {view.meta ? (
            <Text mt={1} color="gray.500" fontSize="sm">
              {view.meta}
            </Text>
          ) : null}
        </Box>

        <HStack gap={3} align="center">
          {view.badge ? (
            <Badge colorPalette="blue" variant="subtle" px={3} py={1} rounded="full">
              {view.badge}
            </Badge>
          ) : null}
          {selectedSnapshot.kind !== 'current' ? (
            <Button size="sm" variant="outline" onClick={onShowCurrent}>
              Show Current
            </Button>
          ) : null}
          <Button size="sm" variant="outline" colorPalette="blue" onClick={onRefresh} disabled={isRefreshing}>
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
  );
}
