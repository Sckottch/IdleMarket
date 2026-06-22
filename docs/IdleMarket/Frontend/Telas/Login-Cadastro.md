# Login e Cadastro

> Telas de entrada (`Login.tsx` / `Register.tsx`), fora do `MainLayout` — não têm barra de navegação. São o único ponto antes de o jogador cair no app autenticado. Componentes controlados (estado em `useState`), submit assíncrono apontando pro seam `AuthService`.

## Layout

As duas telas compartilham o mesmo molde: card centralizado sobre fundo gradiente escuro (`bg-linear-to-tr from-slate-950 to-fuchsia-950`), título **IdleMarket**, subtítulo e um formulário em coluna.

- **Login:** campos Usuário e Senha + botão **Entrar**. Link "Não tem conta? Criar conta" → `/register`.
- **Cadastro:** mesmos campos + **Confirmar Senha** + botão **Registrar**. Link "Já tem conta? Entrar" → `/login`.

## Fluxo

Ambos os formulários têm `handleSubmit` **assíncrono** que faz `await` no seam e navega via `useNavigate` (React Router).

### Login
1. `await login(username, password)`.
2. Sucesso → `navigate("/game")`.
3. Falha → a mensagem do erro é exibida inline abaixo do botão (`error` em estado, `<p>` vermelho).

### Cadastro
Antes de chamar o backend, valida no próprio front (UX — não substitui a validação do servidor):
1. Campos vazios → "preencha usuário e senha".
2. Senhas diferentes → "as senhas não são iguais".
3. Passando, `await register(username, password)` → `navigate("/login")`.
4. Falha → erro inline abaixo do botão **Registrar**.

## Seam de autenticação (`AuthService`)

`data/authService.ts` é o ponto onde a chamada real entra na Fase 5 — a assinatura (`async`, recebe `username`/`password`) não muda.

- **Fase 4 (hoje):** `login` valida um stub local (`admin` / `1234`); `register` é um no-op que resolve com sucesso. Sem token, sem persistência.
- **Fase 5:** `login` vira `POST /api/auth/login` e guarda o JWT; `register` vira `POST /api/auth/register`.
- `logout()` (usado pelo [[Componentes#TopNav|TopNav]]) limpa `localStorage`/`sessionStorage`; na Fase 5 é onde entra a invalidação do token no servidor antes da limpeza local.

A doc original previa "armazena o token de sessão e redireciona pro Jogo" — o redirecionamento já existe; o armazenamento do token fica plugado no seam, ativado na Fase 5.
