// Seam de autenticação. Fase 4: validação stub local, sem token/persistência.
// Fase 5: chamadas REST reais (POST /api/auth/login e /register) que guardam o JWT.

export async function login(username: string, password: string): Promise<void> {
  // Fase 5: await api.post("/auth/login", { username, password }) → guarda o token
  if (username === "admin" && password === "1234") return;
  throw new Error("usuário ou senha inválidos");
}

export async function register(username: string, password: string): Promise<void> {
  // Fase 5: await api.post("/auth/register", { username, password })
  void username; void password;
}

export async function logout(): Promise<void> {
  // Fase 5: invalidar o token no servidor (se houver rota) antes de limpar localmente.
  // Limpa o token e qualquer dado em cache do jogador pra não vazar dados entre contas.
  localStorage.clear();
  sessionStorage.clear();
}