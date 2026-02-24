import Footer from '@/components/custom/footer';
import Navbar from '@/components/custom/navbar';
import { Flex, Container, Box, Text } from '@chakra-ui/react';
import { useEffect } from 'react';

function Forecast() {
  useEffect(() => {
    // Fetch forecast data from the API when the component mounts
    fetch('/api/weather')
      .then((response) => response.json())
      .then((data) => {
        console.log('Forecast data:', data);
        // You can set this data to state and display it in the UI
      })
      .catch((error) => {
        console.error('Error fetching forecast data:', error);
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
            </Text>
          </Box>
        </Flex>
      </Container>

      <Footer />
    </Flex>
  );
}

export default Forecast;
