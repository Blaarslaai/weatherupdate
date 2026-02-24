import Footer from '@/components/custom/footer';
import Navbar from '@/components/custom/navbar';
import { useSession } from '@/hooks/useSession';
import { Container, Flex, SkeletonText } from '@chakra-ui/react';
import { Navigate, Outlet, useLocation } from "react-router-dom";

export function ProtectedRoute() {
  const { data, isLoading, isError } = useSession();
  const location = useLocation();

  // While we check session, show a simple gate screen (or skeleton)
  if (isLoading) {
    return (
      <Flex direction="column" minH="100vh" bg="gray.50">
        <Navbar />

        <Container as="main" maxW="6xl" py={12} flex="1">
          <Flex direction="column" gap={6}>
          <SkeletonText noOfLines={3} gap="4" />
          </Flex>
        </Container>

        <Footer />
      </Flex>
    );
  }

  // If session check failed, treat as logged out (or show error page)
  if (isError) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // Not authenticated -> block route
  if (!data?.authenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // Authenticated -> allow route
  return <Outlet />;
}