export async function loginRequest(token: string) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ token }),
    credentials: "include", // important for cookies
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function logoutRequest() {
  await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
}