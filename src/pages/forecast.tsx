import Footer from '@/components/custom/footer';
import Navbar from '@/components/custom/navbar';
import { Flex, Container, Box, Text } from '@chakra-ui/react';
import { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudSun } from '@fortawesome/free-solid-svg-icons';
import { getCurrentWeather } from '@/lib/http';

function Forecast() {
  useEffect(() => {
      getCurrentWeather('Pretoria', 'ZA')
        .then((data: any) => {
          console.log('Current weather data:', data);
        })
        .catch((error: any) => {
          console.error('Error fetching current weather data:', error);
        });
    }, []);

  return (
    <Flex direction="column" minH="100vh" bg="gray.50">
      <Navbar />

      <Container as="main" maxW="6xl" py={12} flex="1">
        <Flex direction="column" align="center" justify="center" gap={6}>
          <Box
            bg="white"
            p={8}
            rounded="xl"
            boxShadow="md"
            border="1px solid"
            borderColor="gray.200"
            textAlign="center"
            w="full"
            maxW="2xl"
          >
            <Text fontSize="3xl" fontWeight="bold" color="gray.800">
              Welcome
            </Text>
            <Text mt={2} color="gray.600">
              Your weather forecast is ready.
              <FontAwesomeIcon icon={faCloudSun} style={{ marginLeft: '0.5rem' }} />
            </Text>
          </Box>
        </Flex>
      </Container>

      <Footer />
    </Flex>
  );
}

export default Forecast;
