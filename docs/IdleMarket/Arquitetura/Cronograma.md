# Cronograma — IdleMarket

## Estratégia de Desenvolvimento

O projeto é dividido em **5 fases sequenciais**, onde cada fase precisa estar funcionando de forma estável antes de avançar para a próxima. O princípio é: _construir, validar, integrar, repetir._

> **Nota de integração:** Mesmo nas fases independentes (especialmente a Unity), o código deve ser escrito já pensando na futura comunicação com o Backend — usando mocks/dados locais temporários nos pontos que serão substituídos por chamadas de API.

---

## Fase 1 — Jogo (Unity)

**Objetivo:** Jogo funcional e testável de forma completamente offline, com mocks substituindo o Backend.

### Entregas

- [x] Estrutura de cenas e navegação básica
- [x] Sistema de combate (auto battler, turnos, cálculo de dano)
- [x] Sistema de waves (4 comuns + 1 chefão)
- [x] Sistema de nível e experiência do jogador
- [x] Sistema de drops (gerado localmente via mock por enquanto)
- [x] Sistema de equipamentos (peças, raridade, status, sub-status, rating)
- [x] Penalidade de derrota (perda de 5% de ouro)
- [x] Interface in-game (vida, nível, XP, ouro)

### Critério de conclusão

> O jogo roda do início ao fim sem erros. Combate, drops, equipamentos e progressão funcionam conforme as regras documentadas.

---

## Fase 2 — Banco de Dados

**Objetivo:** Schema do PostgreSQL modelado, configurado e validado via Prisma.

### Entregas

- [x] Ambiente configurado (PostgreSQL local + Prisma)
- [x] Tabelas criadas: `Usuario`, `Personagem`, `Equipamento`
- [x] Migrations geradas e aplicadas
- [x] Validação manual: inserção, leitura e atualização de registros funcionando

### Critério de conclusão

> É possível criar um usuário, associar um personagem e inserir equipamentos sem erros. Relacionamentos e constraints funcionando corretamente.

---

## Fase 3 — Backend Inicial + Integração com a Unity

**Objetivo:** Servidor Node.js com as rotas necessárias para o jogo funcionar, substituindo os mocks da Unity por chamadas reais.

### Entregas

- [ ] Projeto Node.js configurado (TypeScript + Fastify/Express + Prisma)
- [ ] Documentação detalhada das rotas desta fase (`Backend_Jogo.md`)
- [ ] Autenticação (`/api/auth`): registro e login com JWT
- [ ] Rota de status do jogador (`/api/battle/status`)
- [ ] Rota de vitória com gerador de loot (`/api/battle/victory`)
- [ ] Rota de derrota com penalidade de ouro (`/api/battle/defeat`)
- [ ] Rotas de inventário e equipamentos (`/api/inventory`)
- [ ] Unity integrada: mocks removidos, todas as chamadas apontando para a API real
- [ ] Testes do fluxo completo: login → combate → drops → equip

### Critério de conclusão

> O jogo roda conectado ao Backend real. Login, progressão, drops e equipamentos persistem no banco de dados corretamente.

---

## Fase 4 — Frontend (React)

**Objetivo:** Interface web funcional e testável de forma independente, com mocks substituindo o Backend onde necessário.

### Entregas

- [ ] Projeto React configurado (Vite + TypeScript + Tailwind)
- [ ] Documentação detalhada das telas (`Frontend_Detalhado.md`)
- [ ] Tela de autenticação (Login / Cadastro)
- [ ] Dashboard do jogador (status, slots de equipamento, inventário)
- [ ] Marketplace — aba Comprar (listagem e filtros)
- [ ] Marketplace — aba Anunciar (formulário de venda)
- [ ] Tela do Jogo (layout com painel lateral, WebGL e painel inferior)
- [ ] Fluxo de equip/unequip via modal funcionando

### Critério de conclusão

> Todas as telas navegam corretamente, os fluxos visuais funcionam com dados mockados e a interface está pronta para receber dados reais.

---

## Fase 5 — Integração Final (Frontend + Backend completo)

**Objetivo:** Todos os sistemas conectados, mocks removidos, fluxo completo funcionando end-to-end.

### Entregas

- [ ] Documentação das rotas restantes (`Backend_Market.md`, etc.)
- [ ] Rotas do Marketplace implementadas no Backend (`/api/market`)
- [ ] Frontend integrado ao Backend: autenticação real com JWT
- [ ] Frontend integrado ao Backend: inventário e equipamentos reais
- [ ] Frontend integrado ao Backend: Marketplace com transações reais
- [ ] Jogo WebGL embutido e comunicando com o Backend dentro da página React
- [ ] Testes do fluxo completo: cadastro → jogo → drops → mercado → compra

### Critério de conclusão

> O ecossistema completo funciona: um usuário consegue criar conta, jogar, coletar itens, equipá-los pelo Frontend e negociá-los no Marketplace com outro usuário.

---

## Visão Geral das Fases

| Fase | Frente           | Depende de  | Status      |
| ---- | ---------------- | ----------- | ----------- |
| 1    | Unity (Jogo)     | —           | ✅ Concluída |
| 2    | Banco de Dados   | —           | ✅ Concluída |
| 3    | Backend + Unity  | Fases 1 e 2 | 🔲 Pendente |
| 4    | Frontend         | —           | 🔲 Pendente |
| 5    | Integração Final | Fases 3 e 4 | 🔲 Pendente |