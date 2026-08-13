# Jogo

> Tela onde o jogo Unity roda embutido (`Game.tsx`), dentro do `MainLayout`. Na **Fase 5** o canvas WebGL real entrou (via `react-unity-webgl`) e a ponte Unity↔React foi ligada. Os dados ao redor (nível, XP, stats, equipados) vêm do [[Documentação Frontend#PlayerContext|PlayerContext]].

## Layout

Três regiões, conforme a doc original:

### Painel esquerdo (full-height)
Faixa fixa à esquerda (`w-80`, sem scroll) com:

- **Nível** atual.
- **Barra de XP** preenchida por `xp/xpForNextLevel` (largura proporcional, limitada a 100%), com o texto de progresso embaixo.
- **Atributos:** os stats de combate do personagem, cada um com ícone e valor. Vida/Ataque/Defesa em inteiro, Chance/Dano Crítico em `%`.
- **Drops:** feed dos últimos equipamentos obtidos, em `DropCard` compacto (ícone + raridade + rating). Limitado aos últimos itens (`MAX_DROPS`).

### Área do jogo (centro)
O **canvas Unity WebGL**, embutido via `react-unity-webgl` (componente `UnityGame`), numa caixa 16:9 (`aspect-video`). A caixa usa `overflow-hidden` + `ring` interno e o canvas preenche `100%` dela — assim o jogo fica contido na borda arredondada sem vazar. Enquanto o build não carrega (`isLoaded`), mostra um "Carregando o jogo...".

A largura da caixa é `min(65vw, (100dvh - 16rem) × 16/9)`: o alvo é 65vw, mas em janela baixa quem manda é a altura útil — os 16rem descontados são o cromo vertical (TopNav, painel inferior, paddings). Sem esse limite, `65vw` derivava a altura só da largura e o conteúdo estourava a vertical em janelas mais baixas.

### Painel inferior
Abaixo da área do jogo: só os equipados, em cards `md` (ordenados espada→capacete→armadura→botas via `sortByTypeOrder`), distribuídos com `justify-between`.

- Clicar num card de equipado abre o [[Componentes#EquipmentManager|EquipmentManager]] **já no tipo daquele item**.
- O card é **fixo em `md`** e não encolhe: o tamanho foi ajustado pro conteúdo interno (sub-status inclusive) caber. É por isso que o botão **Gerenciar** saiu daqui — ver [[Decisões]]. O [[Dashboard]] fica acessível pela [[Componentes#TopNav|TopNav]].
- O painel é `w-fit` com `min-w` igual à largura da caixa do jogo: acompanha o jogo enquanto há espaço e, quando a altura aperta e o jogo encolhe, para de encolher junto — os 4 cards nunca quebram linha. O preço é o painel ficar um pouco mais largo que o jogo nessas janelas, aceito conscientemente por ser melhor que a quebra.

## Stats calculados no front

Os atributos vêm de **`computeCharacterStats(level, equipados)`** (`lib/characterStats.ts`), que roda **no front** — não vêm do backend.

- Os stats-base do player vivem na Unity (`PlayerStats.asset` / `CharacterBaseSO`); o backend não os guarda. Replicar a fórmula no front evita um chamado de API só pra isso.
- A função soma o base por nível com os bônus dos equipados: Vida/Ataque/Defesa são **multiplicativos** (`base * (1 + bônus%)`); Velocidade e Críticos são **aditivos**.
- É **display cosmético**, não regra cheatável — quem decide combate de verdade é a Unity/backend. Ver a decisão registrada em [[Decisões]].

## Ponte Unity ↔ React

A `Game.tsx` escuta os `CustomEvent` que o jogo dispara no `window` (o lado Unity está em [[Integração API]]):

- **`unity:ready`** — o jogo sinaliza que está pronto pra receber o token. A `Game.tsx` então faz `sendMessage` mandando o token pro `ReactBridge`. Há **guarda anti-envio-duplo**: o token só vai uma vez, combinando o evento `unity:ready` com o `isLoaded` do `react-unity-webgl` (cobre a corrida dos dois chegarem fora de ordem).
- **`unity:victory`** / **`unity:defeat`** — disparam `refreshVictory()` / `refreshDefeat()` no [[Documentação Frontend#PlayerContext|PlayerContext]] e, com o resultado do diff, os feedbacks visuais abaixo.

> Os listeners ficam montados o tempo todo, mas chamam **sempre a versão atual** das funções do contexto (via `ref`) — pra o `refreshVictory` enxergar o estado real do jogador, não um snapshot velho do boot.

### Feedbacks de vitória/derrota

- **+XP:** número flutuante verde sobre a barra de XP (só quando ganhou XP).
- **+/- ouro:** número flutuante no contador de ouro da [[Componentes#TopNav|TopNav]] — verde na vitória, vermelho na derrota. Como o contador mora na TopNav (fora da `Game.tsx`), a comunicação passa por um contexto leve só pra isso (`GoldFxContext`), sem variável global nem mexer no DOM.
- **Drops:** os itens novos entram no feed de Drops do painel esquerdo (`DropCard` compacto). A lista tem **teto de 10** (os mais antigos caem) e é **efêmera** — vive só em estado local, **não persiste**, reseta no reload ou na troca de aba.
- **Level-up:** silencioso — o número do nível só atualiza sozinho pelo refresh, sem destaque.
