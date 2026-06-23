import { clearToken, post, setToken } from "./api";

type LoginResponse = { token: string }

export async function login(username: string, password: string): Promise<void> {
  const data = await post<LoginResponse>("/auth/login", { username, password })

  setToken(data.token)
}

export async function register(username: string, password: string): Promise<void> {
  await post<void>("/auth/register", { username, password })
}

export async function logout(): Promise<void> {
  clearToken()
}