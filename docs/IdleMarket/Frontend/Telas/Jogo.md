# Jogo

> Tela onde o jogo Unity roda embutido (`Game.tsx`), dentro do `MainLayout`. Hoje a área do jogo é um placeholder; o canvas WebGL real entra na Fase 5. Os dados ao redor (nível, XP, stats, equipados) já vêm do [[Documentação Frontend#PlayerContext|PlayerContext]].

## Layout

Três regiões, conforme a doc original:

### Painel esquerdo (full-height)
Faixa fixa à esquerda (`w-80`, sem scroll) com:

- **Nível** atual.
- **Barra de XP** preenchida por `xp/xpForNextLevel` (largura proporcional, limitada a 100%), com o texto de progresso embaixo.
- **Atributos:** os stats de combate do personagem, cada um com ícone e valor. Vida/Ataque/Defesa em inteiro, Chance/Dano Crítico em `%`.
- **Drops:** feed dos últimos equipamentos obtidos, em `DropCard` compacto (ícone + raridade + rating). Limitado aos últimos itens (`MAX_DROPS`).

### Área do jogo (centro)
Placeholder 16:9 (`w-[65vw] aspect-video`) com borda — o "Jogo (WebGL)". Na Fase 5 entra aqui o canvas Unity, escalando por múltiplo inteiro de 640×360 pra ficar pixel-perfect.

### Painel inferior
Abaixo da área do jogo: os equipados em cards `md` (ordenados espada→capacete→armadura→botas via `sortByTypeOrder`) + botão **Gerenciar**.

- Clicar num card de equipado abre o [[Componentes#EquipmentManager|EquipmentManager]] **já no tipo daquele item**.
- O botão **Gerenciar** leva ao [[Dashboard]].

## Stats calculados no front

Os atributos vêm de **`computeCharacterStats(level, equipados)`** (`lib/characterStats.ts`), que roda **no front** — não vêm do backend.

- Os stats-base do player vivem na Unity (`PlayerStats.asset` / `CharacterBaseSO`); o backend não os guarda. Replicar a fórmula no front evita um chamado de API só pra isso.
- A função soma o base por nível com os bônus dos equipados: Vida/Ataque/Defesa são **multiplicativos** (`base * (1 + bônus%)`); Velocidade e Críticos são **aditivos**.
- É **display cosmético**, não regra cheatável — quem decide combate de verdade é a Unity/backend. Ver a decisão registrada em [[Decisões]].

## Drops — mock na Fase 4

Sem combate rodando na web, o feed de Drops usa uma lista fixa (`FIXTURE_DROPS`) só pra compor o layout. Na Fase 5 ele passa a refletir os drops reais vindos do resultado de vitória (que o backend persiste — ver [[Integração API]]).
