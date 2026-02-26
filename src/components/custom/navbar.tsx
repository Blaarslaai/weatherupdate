import logo from '/wu-logo.png'
import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  IconButton,
  Link,
  Menu,
  MenuContent,
  MenuItem,
  MenuPositioner,
  MenuRoot,
  MenuTrigger,
  Portal,
  Spacer,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { LuMenu } from 'react-icons/lu';
import { useSession } from '@/hooks/useSession';
import { loginRequest, logoutRequest } from '@/services/auth';

function Navbar() {
  const { data, isLoading, refetch } = useSession();
  const queryClient = useQueryClient();
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);

  const loginHandler = async () => {
    try {
      setIsAuthSubmitting(true);
      await loginRequest(import.meta.env.VITE_AUTH_TOKEN!);
      await queryClient.invalidateQueries({ queryKey: ['session'] });
      await refetch();
    } finally {
      setIsAuthSubmitting(false);
    }
  }

  const logoutHandler = async () => {
    try {
      setIsAuthSubmitting(true);
      await logoutRequest();
      await queryClient.invalidateQueries({ queryKey: ['session'] });
      await refetch();
    } finally {
      setIsAuthSubmitting(false);
    }
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
                <Menu.Root>
                  <Menu.Trigger asChild>
                    <Button
                      variant="ghost"
                      bg="transparent"
                      _hover={{
                        bg: "transparent",
                        textDecoration: "underline",
                        textDecorationColor: "gray.200",
                      }}
                      _active={{
                        bg: "transparent",
                      }}
                      _focus={{
                        boxShadow: "none",
                      }}
                    >
                      Weather
                    </Button>
                  </Menu.Trigger>
                  <Portal>
                    <Menu.Positioner>
                      <Menu.Content>
                        <Menu.Item value="currentWeather">
                          <Link href="/currentWeather" flex="1">Current Weather</Link>
                        </Menu.Item>
                        <Menu.Item value="weatherForecast">
                          <Link href="/weatherForecast" flex="1">Weather Forecast</Link>
                        </Menu.Item>
                        <Menu.Item value="weatherHistory">
                          <Link href="/weatherHistory" flex="1">Weather History</Link>
                        </Menu.Item>
                      </Menu.Content>
                    </Menu.Positioner>
                  </Portal>
                </Menu.Root>
                <Link href="/alerts" color="gray.700" fontWeight="medium">
                  Alerts
                </Link>
                <Link href="/settings" color="gray.700" fontWeight="medium">
                  Settings
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
                      <MenuItem value="currentWeather">
                        <Link href="/currentWeather" color="gray.700" fontWeight="medium">
                          Current Weather
                        </Link>
                      </MenuItem>
                      <MenuItem value="weatherForecast">
                        <Link href="/weatherForecast" color="gray.700" fontWeight="medium">
                          Weather Forecast
                        </Link>
                      </MenuItem>
                      <MenuItem value="weatherHistory">
                        <Link href="/weatherHistory" color="gray.700" fontWeight="medium">
                          Weather History
                        </Link>
                      </MenuItem>
                      <MenuItem value="alerts">
                        <Link href="/alerts" color="gray.700" fontWeight="medium">
                          Alerts
                        </Link>
                      </MenuItem>
                      <MenuItem value="settings">
                        <Link href="/settings" color="gray.700" fontWeight="medium">
                          Settings
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
              loading={isLoading || isAuthSubmitting}
            >
              Login
            </Button>
          ) : (
            <Button
              colorPalette="blue"
              size="sm"
              display={{ base: 'none', sm: 'inline-flex' }}
              onClick={logoutHandler}
              loading={isLoading || isAuthSubmitting}
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
