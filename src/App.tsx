import Footer from './components/custom/footer'
import Navbar from './components/custom/navbar'
import logo from '/wu-logo.png'
import {
  Box,
  Button,
  Container,
  Flex,
  Input,
  SimpleGrid,
  Text,
  HStack,
} from '@chakra-ui/react'
import { useState } from 'react'
import { useAppState } from './state/app-state'

function App() {
  const { location, setLocation } = useAppState()
  const [city, setCity] = useState(location.city)
  const [country, setCountry] = useState(location.country)
  const [error, setError] = useState<string | null>(null)

  const saveLocation = () => {
    const nextCity = city.trim()
    const nextCountry = country.trim().toUpperCase()

    if (!nextCity || !nextCountry) {
      setError('Enter a city and 2-letter country code.')
      return
    }

    setLocation({ city: nextCity, country: nextCountry })
    setError(null)
  }

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
            <img
              src={logo}
              alt="Logo"
              width={256}
              style={{ margin: '0 auto 1rem', display: 'block' }}
            />
            <Text fontSize="3xl" fontWeight="bold" color="gray.800">
              Welcome
            </Text>
            <Text mt={2} color="gray.600">
              Your weather dashboard starts here.
            </Text>

            <Box mt={6} textAlign="left">
              <Text fontSize="sm" color="gray.600" mb={2}>
                Set Default Location
              </Text>
              <SimpleGrid columns={{ base: 1, md: 3 }} gap={3}>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City (e.g. Pretoria)"
                  bg="white"
                />
                <Input
                  value={country}
                  onChange={(e) => setCountry(e.target.value.toUpperCase())}
                  placeholder="Country Code (e.g. ZA)"
                  maxLength={2}
                  bg="white"
                />
                <Button colorPalette="blue" onClick={saveLocation}>
                  Save Location
                </Button>
              </SimpleGrid>
              <HStack mt={3} gap={3} flexWrap="wrap">
                <Text fontSize="sm" color="gray.500">
                  Active: {location.city}, {location.country}
                </Text>
                {error ? (
                  <Text fontSize="sm" color="red.600">
                    {error}
                  </Text>
                ) : null}
              </HStack>
            </Box>
          </Box>
        </Flex>
      </Container>

      <Footer />
    </Flex>
  )
}

export default App
