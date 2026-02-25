import { SimpleGrid } from '@chakra-ui/react';
import type { MetricItem } from './types';
import { MetricCard } from './MetricCard';

type MetricGridProps = {
  metrics: MetricItem[];
};

export function MetricGrid({ metrics }: MetricGridProps) {
  if (metrics.length === 0) return null;

  return (
    <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={4}>
      {metrics.map((metric) => (
        <MetricCard key={metric.label} {...metric} />
      ))}
    </SimpleGrid>
  );
}
