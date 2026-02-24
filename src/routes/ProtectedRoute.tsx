import { useSession } from '@/hooks/useSession';
import { Navigate, Outlet, useLocation } from "react-router-dom";

export function ProtectedRoute() {
  const { data, isLoading, isError } = useSession();
  const location = useLocation();

  // While we check session, show a simple gate screen (or skeleton)
  if (isLoading) {
    return (
      <div style={{ padding: 24 }}>
        <h3>Checking session…</h3>
        <p>Please wait.</p>
      </div>
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