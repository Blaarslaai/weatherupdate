import logo from '/wu-logo.png'
import { Box, Container, Flex, Spacer, HStack, Link, Text } from '@chakra-ui/react';

function Footer() {
  return (
    <Box as="footer" bg="gray.900" color="gray.100" mt="auto">
      <Container maxW="6xl" py={6}>
        <Flex
          direction={{ base: 'column', md: 'row' }}
          align={{ base: 'start', md: 'center' }}
          gap={3}
        >
          <img
            src={logo}
            alt="Weather Update logo"
            style={{ height: '2.5rem', width: 'auto' }}
          />
          <Text fontWeight="semibold">Weather Update</Text>
          <Spacer display={{ base: 'none', md: 'block' }} />
          <HStack gap={4} flexWrap="wrap">
            <Link href="#" color="gray.300">
              Privacy
            </Link>
            <Link href="#" color="gray.300">
              Terms
            </Link>
            <Link href="#" color="gray.300">
              Contact
            </Link>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}

export default Footer;
