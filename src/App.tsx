import Footer from './components/custom/footer'
import Navbar from './components/custom/navbar'
import logo from '/wu-logo.png'
import {
  Box,
  Container,
  Flex,
  Text,
} from '@chakra-ui/react'

function App() {
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
          </Box>
        </Flex>
      </Container>

      <Footer />
    </Flex>
  )
}

export default App
