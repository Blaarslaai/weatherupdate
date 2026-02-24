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
} from '@chakra-ui/react';
import { LuMenu } from 'react-icons/lu';
import { useSession } from '@/hooks/useSession';
import { loginRequest, logoutRequest } from '@/services/auth';

function Navbar() {
  const { data, isLoading } = useSession();

  const loginHandler = () => {
    loginRequest(import.meta.env.VITE_AUTH_TOKEN!);
  }

  const logoutHandler = () => {
    logoutRequest();
  }

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
            <Link href='/' fontSize="lg" fontWeight="bold" color="blue.700">
              Weather Update
            </Link>
          </HStack>

          <Spacer />

          {data?.authenticated ? (
            <>
              <HStack gap={6} display={{ base: 'none', md: 'flex' }}>
                <Link href="/" color="gray.700" fontWeight="medium">
                  Home
                </Link>
                <Link href="/forecast" color="gray.700" fontWeight="medium">
                  Forecast
                </Link>
                <Link href="/alerts" color="gray.700" fontWeight="medium">
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
                      <MenuItem value="home">
                        <Link href="/" color="gray.700" fontWeight="medium">
                          Home
                        </Link>
                      </MenuItem>
                      <MenuItem value="forecast">
                        <Link href="/forecast" color="gray.700" fontWeight="medium">
                          Forecast
                        </Link>
                      </MenuItem>
                      <MenuItem value="alerts">
                        <Link href="/alerts" color="gray.700" fontWeight="medium">
                          Alerts
                        </Link>
                      </MenuItem>
                    </MenuContent>
                  </MenuPositioner>
                </MenuRoot>
              </Box>
            </>
          ) : null}

          {!data?.authenticated ? (
            <Button
              colorPalette="blue"
              size="sm"
              display={{ base: 'none', sm: 'inline-flex' }}
              onClick={loginHandler}
              loading={isLoading}
            >
              Login
            </Button>
          ) : (
            <Button
              colorPalette="blue"
              size="sm"
              display={{ base: 'none', sm: 'inline-flex' }}
              onClick={logoutHandler}
              loading={isLoading}
            >
              Logout
            </Button>
          )}
        </Flex>
      </Container>
    </Box>
  );
}

export default Navbar;
