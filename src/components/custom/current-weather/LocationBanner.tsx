import { Badge, Box, HStack, Text } from '@chakra-ui/react';

type LocationBannerProps = {
  location: { city: string; country: string };
};

export function LocationBanner({ location }: LocationBannerProps) {
  return (
    <Box
      bg="white"
      p={{ base: 4, md: 5 }}
      rounded="xl"
      boxShadow="sm"
      border="1px solid"
      borderColor="gray.200"
      zIndex={10}
    >
      <HStack gap={2} flexWrap="wrap">
        <Badge colorPalette="green" variant="subtle" px={3} py={1} rounded="full">
          Active: {location.city}, {location.country}
        </Badge>
        <Text fontSize="sm" color="gray.500">
          Update city/country on the settings page.
        </Text>
      </HStack>
    </Box>
  );
}
