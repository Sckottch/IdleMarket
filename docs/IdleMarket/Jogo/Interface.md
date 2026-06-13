# Planejamento da Interface e Visuais

> Camada de apresentação do jogo (Unity). Cobre o HUD de combate, as animações dos personagens, os feedbacks visuais e o cenário. Complementa o [[Sistema de Turnos]] — que define o fluxo do combate — e o [[Combate]] — que define atributos e fórmulas. Aqui o foco é **o que aparece na tela e quando**.

## Visão Geral

No produto final, o jogo roda como **Unity WebGL embutido numa página React**. Por isso a Unity é responsável apenas pela **janela de combate**: o que acontece dentro da luta. Toda a interface informacional persistente (perfil, inventário, mercado, gerenciamento de equipamento) vive no React, em volta do WebGL.

A interface in-game cobre, então, três coisas:

- **HUD de combate** — barras de HP (jogador e inimigo) e barra de XP do jogador.
- **Animações** — movimentação e ataques dos personagens, sincronizadas com o combate.
- **Feedback visual** — números de dano e indicação de crítico.

Mais um cenário estático de fundo.

---

## Fronteira Unity ↔ React

Decisão central: o que cada lado desenha. Tudo que é **estado persistente** do jogador é do React; tudo que é **momento de combate** é da Unity.

|Elemento|Unity (WebGL)|React (painel)|
|---|---|---|
|Barras de HP (player + inimigo)|Sim|—|
|Nível do inimigo|Sim|—|
|Barra de XP|Sim (só a barra)|Sim (detalhada)|
|Nível do player (número)|—|Sim|
|Ouro|—|Sim (total + "+X")|
|Animações de combate|Sim|—|
|Números de dano / crítico|Sim|—|
|Log de equipamentos dropados|—|Sim|
|Inventário / equipar / mercado|—|Sim|

### Contrato de dados do jogo

O jogo (Unity) tem **três canais de entrada** e nada mais:

- **Carga inicial** (no boot/login): `{ username, level, xp, equipados }`. Retoma o progresso salvo — sem isso o jogo começaria do zero a cada login. _(Fase 1: o mock cria isso no `Awake`. Fase 3: login → `GET /status`.)_
- **Resposta de vitória** (`/victory`): `{ level, xp }`. Atualiza a barra de XP e o rebuild de stats.
- **Snapshot de equipados**: as (até) 4 peças equipadas, recebidas quando o React altera o equipamento (ver [[Equipamentos]]).

A carga inicial é o snapshot completo; os outros dois são atualizações incrementais das suas duas metades (progressão e equipamento).

Ouro, inventário completo e log de drops **não trafegam pro jogo** — são responsabilidade do backend/React.

> **Realidade da Fase 1:** o React não existe ainda. Então o feedback de recompensa (ouro "+X", log de equipamento, XP detalhado) **não aparece in-combat** na Fase 1. Na tela você vê a barra de XP enchendo e as animações. Ouro ganho e item dropado se conferem pelo harness de debug e pelos logs — não é bug, o "suco" de loot só materializa na fase do front.

---

## Decisões de Design

- **HP é transiente e mora só na Unity.** Vida só existe durante a luta; mandar pro front seria tráfego à toa. O front nunca vê HP.
- **UI ligada por eventos.** Os sistemas disparam, a UI escuta. Vale na Fase 1 e na Fase 3 (lá os mesmos eventos alimentam o React / a ponte do WebGL). A renderização por cima é trocável; a fiação por eventos é a parte durável.
- **Dois tipos de interação visual:**
    - **Reativa** — o combate dispara e _não espera_: barra de HP, número de dano, aviso de wave, barra de XP, **morte**. Só escutam e desenham.
    - **Bloqueante** — o combate dispara e _aguarda terminar_: run (avanço/volta), impacto do ataque (OnHit), fim do clipe de ataque. O cronograma do combate depende delas. (Ver [[Sistema de Turnos]].)
- **DamageResult antes da animação.** O resultado do golpe (dano + se foi crítico) é calculado _antes_ de tocar a animação, pra escolher entre ataque normal e ataque crítico. O dano só é **aplicado** no frame de impacto. (Fórmulas em [[Combate]].)

---

## HUD de Combate

Barras **fixas no topo da tela**:

|Posição|Conteúdo|
|---|---|
|Topo direito|Nome do player + barra de HP + barra de XP (abaixo do HP)|
|Topo esquerdo|Retrato do inimigo + nível + barra de HP|

- A barra de XP mostra **só o preenchimento** — sem número de quanto falta e sem o nível atual (isso é detalhe do painel React).
- O inimigo não tem nome nem XP, só retrato, nível e barra de HP.

### Aviso de Wave

No início de cada wave, um aviso aparece por **~0,5s** antes do combate começar:

- Waves comuns: aviso padrão indicando a wave atual.
- Wave final (chefão): cor diferente e texto especial — ex. _"Chefe se aproxima"_, _"Inimigo forte adiante"_, _"WAVE FINAL"_.

> Consequência de fluxo: o estado `WaveStart` deixa de ser instantâneo — mostra o aviso, segura ~0,5s, e só então transiciona pro Battle.

---

## Animações

Pacote de arte: **Tiny Swords**. Vêm 5 clipes prontos; a morte é feita à mão.

|Clipe|Uso no combate|
|---|---|
|`idle`|Parado entre turnos|
|`run`|Avançar até o alvo e voltar|
|`attack1`|Ataque normal|
|`attack2`|Ataque crítico|
|`guard`|Reação ao levar o hit|
|_morte_ (custom)|Fade out (sem asset no pacote)|

> Contrato do Animator: `Run` (bool), `Attack1` / `Attack2` / `Guard` (triggers). `Attack2` é o ataque crítico.

### Coreografia de um turno

Cada turno é uma **sequência**, mas curta — nenhum turno passa de ~1s (um pro player, um pro inimigo), pra não arrastar.

```
Turno de um atacante (≤ ~1s):
  1. Calcula DamageResult (dano + isCritical)   // antes da animação
  2. run   → avança até o alvo
  3. attack1 (normal) ou attack2 (crítico)
       Animation Event no frame de impacto → onHit:
         - aplica o dano no alvo
         - alvo toca `guard` (reação)
         - número de dano flutua sobre o alvo
  4. run   → volta à posição
```

A morte é checada entre os dois ataques (ver [[Sistema de Turnos]]): se o primeiro golpe mata, o segundo não revida.

---

## Variação de Inimigos

Variedade puramente visual dos inimigos, sem impacto em stats nem no fluxo — nível e atributos seguem vindo do `EnemyGenerator` (ver [[Combate]]); aqui é só "qual modelo e cor mostrar".

- **1 modelo** + **4 cores**, todos do Tiny Swords. As cores são versões coloridas à mão do pacote (não recolor em runtime), então cada cor é um conjunto de sprites próprio (um Animator Controller por cor).
- A cada wave sorteia-se uma cor (das 4). **Puro aleatório** — sem relação com nível, raridade ou dificuldade.
- **Regra de cor:** a cor não repete entre waves consecutivas, e a restrição se mantém **entre confrontos** (lembra a última cor usada e tira-a do sorteio).
- **Player:** modelo fixo, não varia.

### Chefão

Os modelos não têm um "chefão" próprio, e mexer na escala destoa — escalar o sprite quebra a densidade de pixel e perde o acabamento clean do pacote. O chefão usa o mesmo modelo/cor dos comuns; a distinção da wave final fica **só no aviso de wave** ("WAVE FINAL"), sem marca visual no próprio inimigo.

> A seleção de modelo/cor vive no `SetupWave`, **depois** da geração de stats do `EnemyGenerator`. Zero impacto no contrato de dados.

--------
## Feedback Visual

- **Números de dano:** texto flutuante acima da cabeça do alvo, fica ~0,5s (some antes de o atacante voltar pra posição, então nunca há dois na tela). Implementado como um único objeto pré-posicionado, reposicionado e reanimado a cada golpe (sem instanciar/destruir). Crítico se distingue por **cor + tamanho**.
- O que **não** é feito na Unity: o número "+X" de ouro, o total de ouro e o log do equipamento dropado — tudo isso é painel React.

---

## Cenário

Fundo **estático**, montado com os assets de ambiente do próprio Tiny Swords. Sem variação por wave/confronto.

---

## Fluxo Visual do Fim de Wave

Amarra o visual aos estados do combate (ver [[Sistema de Turnos]]; valores das recompensas em [[Recompensas]]):

```
Golpe letal (ainda dentro de Battle):
  - inimigo toca a morte (fade out) — reativa, fire-and-forget
  - o combate NÃO espera a morte: ela roda durante a volta do atacante,
    e o ResetVisual da próxima wave cancela qualquer fade ainda em curso

→ WaveWon:
  - dispara /victory (ReportVictory) em paralelo
  - ao receber { level, xp }:
      Unity  → barra de XP enche
      React  → "+ouro", total, XP detalhado, log de equipamento
  - transiciona (próxima wave ou Victory)
```

---

## Abordagem de Arquitetura

A UI in-game é dirigida por eventos. O estado contínuo flui do modelo direto pros listeners; os comandos pontuais passam por um manager.

**Estado contínuo (reativo) — o modelo dispara, a UI escuta:**

- HP → `Character.OnHealthChanged` (barra de HP do player e do inimigo)
- Progressão → `GameManager.OnProgressionChanged` (barra de XP)
- (Re)inicialização do personagem → `Character.OnInitialized` (nível do inimigo + reset das barras no início da wave)

**Comandos pontuais — o combate chama o `GameUIManager`:**

- Número de dano → `ShowDamageNumber(...)` no momento do OnHit (carrega valor + isCritical)
- Aviso de wave → `ShowWaveAnnouncement(...)` no setup da wave

O `GameUIManager` é **raiz de composição** (liga cada `CharacterInfoUI` ao seu Character via `BindCharacters`) **+ superfície de comando**. Ele **não** entra no caminho de HP/XP — esses fluem direto do modelo. Essa fiação por eventos é a parte durável: na Fase 3 são os mesmos eventos que alimentam a ponte do React.

**Sinais que o combate aguarda (handshake bloqueante com a animação):**

- tocar run / aguardar a chegada (checagem de distância no código)
- tocar attack / aguardar o **OnHit** (impacto, via Animation Event) e o fim do clipe
- _(a morte saiu daqui — virou reativa)_

Implementado: o `RunBattle` aguarda os sinais de animação em vez de um `turnInterval` fixo; o impacto chega por Animation Event (`OnHit`) que destrava o `WaitForHit` da coroutine.