import logo from '/wu-logo.png'
import { Box, Container, Flex, Text } from '@chakra-ui/react';

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
          <Flex
            direction={{ base: 'column', md: 'row' }}
            align={{ base: 'end', md: 'center' }}
            ml={{ base: 0, md: "auto" }}
          >
            <Text fontSize="sm">Copyright © {new Date().getFullYear()} - All right reserved</Text>
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
}

export default Footer;
