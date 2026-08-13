# Setup e Execução

> Guia para instalar e rodar o IdleMarket do zero em uma máquina nova. Cobre **Arch/CachyOS**, **Ubuntu** e **Windows**. A visão de como as três camadas conversam está em [[Arquitetura e Fluxo de Dados]]; aqui só interessa colocar tudo de pé.

---

## 1. Sumário da instalação

### O que compõe o projeto

O repositório tem três frentes, e nem todas precisam ser instaladas para jogar:

| Pasta | O que é | Precisa rodar? |
| --- | --- | --- |
| `backend/` | API REST (Fastify + Prisma + PostgreSQL) | **Sim** |
| `web/` | Frontend React (Vite + Tailwind) | **Sim** |
| `game/` | Projeto Unity do auto battler | **Não** — o build WebGL já vem versionado |
| `docs/` | Este vault de documentação (Obsidian) | Não |

> **O Unity não é necessário para rodar o ecossistema.** O build WebGL do jogo está commitado em `web/public/unity/` e o React o carrega direto de lá. Instalar a Unity só faz sentido se você for **editar** o jogo (ver [[Documentação Jogo]]).

### O que precisa estar instalado

| Programa | Para quê | Versão |
| --- | --- | --- |
| **Git** | clonar o repositório | qualquer recente |
| **Node.js + npm** | rodar backend (`tsx`) e frontend (`vite`) | Node 20 ou superior |
| **Docker + Docker Compose** | subir o PostgreSQL 17 definido em `backend/docker-compose.yml` | qualquer recente |
| *(opcional)* **Unity** | editar o jogo | **6000.3.13f1** (exata, do `ProjectSettings/ProjectVersion.txt`) + módulo *WebGL Build Support* |

O PostgreSQL **não** precisa ser instalado na máquina — ele sobe como container. Quem prefere instalar nativo tem o caminho alternativo no [Apêndice](#apêndice--rodar-sem-docker-postgresql-nativo).

### O que será feito, em ordem

1. **Clonar** o repositório.
2. **Instalar as dependências** — os programas do sistema (varia por SO) e depois os pacotes npm de `backend/` e `web/`.
3. **Configurar** o `.env` do backend, subir o banco em container e aplicar as migrations do Prisma.
4. **Rodar** os dois servidores (API na `3333`, web na `5173`) e usar.

Tempo estimado numa máquina limpa: ~15 minutos, a maior parte esperando download.

---

## 2. Instalação do projeto

Clone o repositório e entre na pasta:

```bash
git clone <url-do-repositório> IdleMarket
cd IdleMarket
```

No Windows, o mesmo comando funciona no **PowerShell** ou no **Git Bash**.

A estrutura esperada depois do clone:

```
IdleMarket/
├── backend/     API + Prisma + docker-compose.yml
├── web/         React + build WebGL em public/unity/
├── game/        projeto Unity (fonte)
└── docs/        este vault
```

Se a pasta `web/public/unity/` estiver vazia ou com arquivos de poucos KB, o repositório usa **Git LFS** para os binários do build — instale o LFS (`sudo pacman -S git-lfs` / `sudo apt install git-lfs` / incluso no Git for Windows), rode `git lfs install` e depois `git lfs pull`. Os arquivos corretos somam ~76 MB.

---

## 3. Instalação de dependências

### 3.1 Programas do sistema

Escolha a seção do seu SO. O objetivo das três é o mesmo: ter `git`, `node`, `npm` e `docker` funcionando no terminal.

#### Arch / CachyOS / Manjaro

```bash
# Git, Node.js e npm
sudo pacman -S git nodejs npm

# Docker e o plugin do Compose
sudo pacman -S docker docker-compose

# habilita o serviço agora e no boot
sudo systemctl enable --now docker.service

# permite usar o docker sem sudo
sudo usermod -aG docker $USER
```

A mudança de grupo só vale em uma sessão nova: **deslogue e logue de novo**, ou aplique no terminal atual com `newgrp docker`.

Unity (opcional), via AUR:

```bash
yay -S unityhub
```

#### Ubuntu / Debian

O Node do repositório padrão costuma estar desatualizado, então use o NodeSource:

```bash
# Git
sudo apt update && sudo apt install -y git curl ca-certificates

# Node.js 22 LTS + npm
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
```

Docker pelo repositório oficial (o pacote `docker.io` do apt costuma vir sem o plugin `compose`):

```bash
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

sudo systemctl enable --now docker
sudo usermod -aG docker $USER
```

Deslogue e logue de novo (ou `newgrp docker`) para o grupo valer.

Unity (opcional): baixe o Unity Hub em <https://unity.com/download>.

#### Windows 10 / 11

Instaladores oficiais, nesta ordem:

| Programa | Link oficial | Observação |
| --- | --- | --- |
| **Git for Windows** | <https://git-scm.com/download/win> | aceite os defaults; já traz o Git Bash |
| **Node.js LTS** | <https://nodejs.org/en/download> | escolha o instalador **LTS** `.msi` para Windows x64 |
| **Docker Desktop** | <https://www.docker.com/products/docker-desktop/> | requer **WSL2** — o instalador ativa se faltar; pode pedir reinício |
| *(opcional)* **Unity Hub** | <https://unity.com/download> | pelo Hub, instale a versão **6000.3.13f1** |

Depois de instalar, **abra o Docker Desktop** e espere o ícone da baleia ficar verde/estável — o `docker compose` da etapa 4 só funciona com ele rodando.

Use o **PowerShell** (ou o Git Bash) para os comandos deste guia. Todos os comandos `git`, `npm`, `npx` e `docker` são idênticos aos do Linux; só os comandos de instalação de pacote é que mudaram.

#### Verificação (qualquer SO)

```bash
git --version
node --version      # precisa ser 20+
npm --version
docker compose version
docker run --rm hello-world
```

Se o `hello-world` rodar sem `sudo`, o ambiente está pronto.

### 3.2 Pacotes npm do projeto

Na raiz do repositório, instale as dependências das duas frentes:

```bash
cd backend
npm install

cd ../web
npm install
```

Isso cria os `node_modules/` de cada pasta. Ainda **não** rode nada — falta configurar o banco.

---

## 4. Setup do projeto e como usar

### 4.1 Variáveis de ambiente

O `.env` guarda segredos e **não é versionado** — o que o repositório traz é o modelo **`backend/.env.example`**. Copie e edite:

```bash
cd backend
cp .env.example .env
```

No **PowerShell**: `Copy-Item .env.example .env`.

O modelo tem três variáveis, todas com valores de placeholder que **precisam ser trocados**:

```bash
DATABASE_URL="postgresql://idlemarket:trocaessasenha@localhost:5433/idlemarket"
POSTGRES_PASSWORD="trocaessasenha"
JWT_SECRET="troque-por-uma-string-aleatoria-longa"
```

O que cada uma faz, e o que quebra se estiver errada:

- **`POSTGRES_PASSWORD`** — o `docker-compose.yml` a interpola em `${POSTGRES_PASSWORD}` para criar o usuário do Postgres. O Compose lê esse mesmo `backend/.env` por estar na mesma pasta.
- **`DATABASE_URL`** — é como o Prisma se conecta (`prisma.config.ts` e `src/lib/prisma.ts` a leem via `dotenv`). **A senha aqui tem que ser idêntica à `POSTGRES_PASSWORD`**, e a porta é **`5433`**, não a 5432 padrão — o Compose mapeia `"5433:5432"`, expondo 5433 no host para não conflitar com um Postgres já instalado.
- **`JWT_SECRET`** — o `server.ts` faz `process.env.JWT_SECRET!` ao registrar o `@fastify/jwt`. Vazia, o servidor nem sobe.

Para gerar um segredo decente:

```bash
openssl rand -hex 32
```

No **PowerShell**, que não tem `openssl` por padrão:

```powershell
-join ((1..32) | ForEach-Object { '{0:x2}' -f (Get-Random -Maximum 256) })
```

> **Windows:** edite o `.env` em um editor de código, não no Bloco de Notas — se acabar tendo que criar o arquivo do zero por lá, ele salva como `.env.txt` e o arquivo é ignorado.

### 4.2 Subir o banco de dados

A partir de `backend/` (onde vive o `docker-compose.yml`):

```bash
cd backend
docker compose up -d
```

Confirme que o container está de pé:

```bash
docker ps    # deve listar idlemarket-db, postgres:17, 0.0.0.0:5433->5432/tcp
```

Os dados ficam no volume `idlemarket-data`, então parar o container não perde nada.

### 4.3 Preparar o Prisma

Ainda em `backend/`:

```bash
npx prisma generate         # gera o client em backend/generated/prisma
npx prisma migrate deploy   # aplica as migrations e cria as tabelas
```

> **O `generate` é obrigatório, não opcional.** O `schema.prisma` emite o client em `../generated/prisma`, caminho que está no `.gitignore` — ou seja, ele **não vem no clone**. O `src/lib/prisma.ts` importa dali, então sem gerar o client o backend falha no boot com erro de módulo não encontrado.

O `migrate deploy` cria as tabelas `User`, `Character`, `Equipment` e `SubStat` conforme a [[Modelagem do Banco de Dados]]. Para inspecionar os dados depois, `npx prisma studio` abre uma UI no navegador.

### 4.4 Rodar a aplicação

São dois processos, em **dois terminais separados**.

**Terminal 1 — backend** (a partir de `backend/`):

```bash
npm run dev
```

Deve imprimir `Servidor rodando em http://localhost:3333`. Para checar por fora:

```bash
curl http://localhost:3333/health     # {"status":"ok"}
```

**Terminal 2 — frontend** (a partir de `web/`):

```bash
npm run dev
```

O Vite sobe em <http://localhost:5173>.

> **Deixe o frontend na porta 5173.** O CORS do `server.ts` está fixo em `origin: "http://localhost:5173"`. Se a 5173 estiver ocupada, o Vite cai para a 5174 e **todas** as chamadas de API passam a ser bloqueadas pelo navegador. Nesse caso, libere a porta (ou ajuste a origem no `server.ts`).

### 4.5 Usando

Abra <http://localhost:5173> e siga o fluxo:

1. **Cadastrar** — o `POST /api/auth/register` já cria o personagem nível 1 com 100 de ouro (ver [[Documentação Backend]]).
2. **Login** — o token JWT fica no `localStorage` e é repassado ao Unity por `SendMessage`; o jogo embutido não tem login próprio (ver [[Integração API]]).
3. **Jogo** — o auto battler roda dentro da página. Cada wave vencida persiste XP, ouro e drops no banco.
4. **Dashboard** — status, slots e inventário; é onde se equipa e desequipa.
5. **Mercado** — anunciar, cancelar anúncio e comprar itens de outros usuários.

> A primeira abertura da tela de Jogo **demora**: o `.data` + `.wasm` do build WebGL somam ~76 MB e são baixados pelo navegador. Depois disso o cache resolve.

Para testar uma compra no mercado é preciso de **duas contas** — o `GET /api/market/list` esconde os anúncios do próprio usuário e o `POST /buy` rejeita auto-compra no servidor. Cadastre uma segunda conta em uma janela anônima.

### 4.6 Dia a dia

Com tudo já instalado e configurado, retomar o projeto são só dois terminais:

```bash
# terminal 1
cd backend && docker compose up -d && npm run dev

# terminal 2
cd web && npm run dev
```

Encerrando: `Ctrl+C` nos dois servidores e, se quiser derrubar o banco, `docker compose down` a partir de `backend/`. Use `docker compose down -v` **apenas** quando quiser apagar os dados — o `-v` remove o volume.

### 4.7 Problemas comuns

| Sintoma | Causa provável | Solução |
| --- | --- | --- |
| `Cannot find module '../../generated/prisma/client.js'` | client do Prisma não foi gerado | `npx prisma generate` em `backend/` |
| Backend sobe, mas toda rota erra na conexão | porta 5432 no `DATABASE_URL`, ou senha diferente da `POSTGRES_PASSWORD` | corrija o `.env` (porta **5433**, senhas iguais) e reinicie |
| Servidor morre no boot reclamando do JWT | `JWT_SECRET` ausente ou vazia | preencha no `.env` |
| Front carrega, mas login falha com erro de CORS no console | Vite fora da 5173, ou backend desligado | libere a 5173 e confirme o `/health` |
| `port 5433 already allocated` | outro serviço na porta | troque o lado esquerdo do mapeamento em `docker-compose.yml` e o `DATABASE_URL` junto |
| Trocou a senha no `.env` e o Postgres recusa a conexão | o volume foi criado com a senha antiga | `docker compose down -v` e suba de novo (apaga os dados) |
| `permission denied` ao usar `docker` no Linux | grupo `docker` ainda não aplicado à sessão | deslogue/logue, ou `newgrp docker` |
| No Windows, `docker compose` não responde | Docker Desktop não está rodando | abra o Docker Desktop e espere inicializar |
| Tela de Jogo em branco por muito tempo | download dos ~76 MB do WebGL | aguarde; confira a aba Rede do navegador |

---

## Apêndice — rodar sem Docker (PostgreSQL nativo)

Se preferir não usar container, instale o PostgreSQL 17 na máquina e crie o banco à mão.

**Arch/CachyOS:**

```bash
sudo pacman -S postgresql
sudo -u postgres initdb -D /var/lib/postgres/data
sudo systemctl enable --now postgresql
```

**Ubuntu:** `sudo apt install -y postgresql` (o serviço já sobe sozinho).

**Windows:** instalador oficial em <https://www.postgresql.org/download/windows/>.

Depois, crie usuário e banco com os mesmos nomes usados pelo Compose:

```bash
sudo -u postgres psql -c "CREATE USER idlemarket WITH PASSWORD 'trocaessasenha';"
sudo -u postgres psql -c "CREATE DATABASE idlemarket OWNER idlemarket;"
```

Nesse caminho o Postgres escuta na **5432** (padrão), então o `.env` muda:

```bash
DATABASE_URL="postgresql://idlemarket:trocaessasenha@localhost:5432/idlemarket"
JWT_SECRET="uma-string-aleatória-longa-qualquer"
```

A `POSTGRES_PASSWORD` deixa de ser necessária (era só para o Compose). O resto do guia — `prisma generate`, `migrate deploy`, `npm run dev` — segue igual, pulando a etapa 4.2.

---

## Apêndice — abrir o projeto Unity

Necessário apenas para **editar** o jogo.

1. Instale o **Unity Hub** e, por ele, a versão **6000.3.13f1** com o módulo **WebGL Build Support**.
2. No Hub, *Add* → aponte para `game/IdleMarket`.
3. A primeira abertura demora: a Unity reconstrói `Library/`, que não é versionada.

Para atualizar o jogo embutido na web, gere um build WebGL e substitua os quatro arquivos de `web/public/unity/`. Os caminhos estão fixos em `web/src/screens/Game.tsx` (`loaderUrl`, `dataUrl`, `frameworkUrl`, `codeUrl`), então ou mantenha os mesmos nomes, ou ajuste-os lá.
