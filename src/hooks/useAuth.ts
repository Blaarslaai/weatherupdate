import { useQueryClient } from "@tanstack/react-query";
import { loginRequest, logoutRequest } from "../services/auth";

export function useAuth() {
  const queryClient = useQueryClient();

  async function login(token: string) {
    const data = await loginRequest(token);

    // Immediately update session cache
    queryClient.setQueryData(["session"], {
      authenticated: true,
      role: data.role ?? "user",
    });

    return data;
  }

  async function logout() {
    await logoutRequest();

    // Immediately clear session cache
    queryClient.setQueryData(["session"], {
      authenticated: false,
    });
  }

  return { login, logout };
}