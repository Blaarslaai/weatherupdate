import logo from '/wu-logo.png'
import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  IconButton,
  Link,
  MenuContent,
  MenuItem,
  MenuPositioner,
  MenuRoot,
  MenuTrigger,
  Spacer,
  Text,
} from '@chakra-ui/react';
import { LuMenu } from 'react-icons/lu';

function Navbar() {
  return (
    <Box
        as="nav"
        bg="white"
        borderBottom="1px solid"
        borderColor="gray.200"
        position="sticky"
        top={0}
        zIndex={10}
        boxShadow="sm"
      >
      <Container maxW="6xl">
        <Flex align="center" py={4} gap={4}>
          <HStack gap={3}>
            <img
              src={logo}
              alt="Weather Update logo"
              style={{ height: '2.5rem', width: 'auto' }}
            />
            <Text fontSize="lg" fontWeight="bold" color="blue.700">
              Weather Update
            </Text>
          </HStack>

          <Spacer />

          <HStack gap={6} display={{ base: 'none', md: 'flex' }}>
            <Link href="#" color="gray.700" fontWeight="medium">
              Home
            </Link>
            <Link href="#" color="gray.700" fontWeight="medium">
              Forecast
            </Link>
            <Link href="#" color="gray.700" fontWeight="medium">
              Alerts
            </Link>
          </HStack>

          <Box display={{ base: 'block', md: 'none' }}>
            <MenuRoot positioning={{ placement: 'bottom-end' }}>
              <MenuTrigger asChild>
                <IconButton
                  aria-label="Open navigation menu"
                  variant="outline"
                  size="sm"
                >
                  <LuMenu />
                </IconButton>
              </MenuTrigger>
              <MenuPositioner>
                <MenuContent minW="10rem">
                  <MenuItem value="home">Home</MenuItem>
                  <MenuItem value="forecast">Forecast</MenuItem>
                  <MenuItem value="alerts">Alerts</MenuItem>
                </MenuContent>
              </MenuPositioner>
            </MenuRoot>
          </Box>

          <Button colorPalette="blue" size="sm" display={{ base: 'none', sm: 'inline-flex' }}>
            Get Updates
          </Button>
        </Flex>
      </Container>
    </Box>
  );
}

export default Navbar;
