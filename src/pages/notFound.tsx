import Footer from '@/components/custom/footer';
import Navbar from '@/components/custom/navbar';
import { Flex, Container, Box, Text } from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudSun } from '@fortawesome/free-solid-svg-icons';
import CloudBackground from '@/components/custom/cloudBackground';

function NotFound() {
  return (
    <Flex direction="column" minH="100vh" bg="blue.50">
      <Navbar />

      <Container as="main" py={12} flex="1">
      <CloudBackground />
  
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
            zIndex={10}
          >
            <Text fontSize="3xl" fontWeight="bold" color="gray.800">
              Welcome
            </Text>
            <Text mt={2} color="gray.600">
              Your page is not found.
              <FontAwesomeIcon icon={faCloudSun} style={{ marginLeft: '0.5rem' }} />
            </Text>
          </Box>
        </Flex>
      </Container>

      <Footer />
    </Flex>
  );
}

export default NotFound;
