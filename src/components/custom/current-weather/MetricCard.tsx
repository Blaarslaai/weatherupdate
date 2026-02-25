import { Box, Text } from '@chakra-ui/react';
import type { MetricItem } from './types';

export function MetricCard({ label, value, subtext }: MetricItem) {
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
