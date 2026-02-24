import { useQuery } from "@tanstack/react-query";

type SessionResponse = {
  authenticated: boolean;
  role?: string;
};

async function fetchSession(): Promise<SessionResponse> {
  const res = await fetch("/api/auth/me", {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to check session");
  }

  return res.json();
}

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: fetchSession,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}