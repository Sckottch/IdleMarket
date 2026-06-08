# Planejamento da Interface e Visuais

> Camada de apresentação do jogo (Unity). Cobre o HUD de combate, as animações dos personagens, os feedbacks visuais e o cenário. Complementa o [[Sistema de Turnos]] — que define o fluxo do combate — e o [[Combate]] — que define atributos e fórmulas. Aqui o foco é **o que aparece na tela e quando**.

## Visão Geral

No produto final, o jogo roda como **Unity WebGL embutido numa página React**. Por isso a Unity é responsável apenas pela **janela de combate**: o que acontece dentro da luta. Toda a interface informacional persistente (perfil, inventário, mercado, gerenciamento de equipamento) vive no React, em volta do WebGL.

A interface in-game cobre, então, três coisas:

- **HUD de combate** — barras de HP (jogador e inimigo) e barra de XP do jogador.
- **Animações** — movimentação e ataques dos personagens, sincronizadas com o combate.
- **Feedback visual** — números de dano, indicação de crítico e moedas de loot.

Mais um cenário estático de fundo.

---

## Fronteira Unity ↔ React

Decisão central: o que cada lado desenha. Tudo que é **estado persistente** do jogador é do React; tudo que é **momento de combate** é da Unity.

|Elemento|Unity (WebGL)|React (painel)|
|---|---|---|
|Barras de HP (player + inimigo)|Sim|—|
|Barra de XP|Sim (só a barra)|Sim (detalhada)|
|Nível (número)|—|Sim|
|Ouro|—|Sim (total + "+X")|
|Animações de combate|Sim|—|
|Números de dano / crítico|Sim|—|
|Moedas de loot|Sim (enfeite)|—|
|Log de equipamentos dropados|—|Sim|
|Inventário / equipar / mercado|—|Sim|

### Contrato de dados do jogo

O jogo (Unity) tem **três canais de entrada** e nada mais:

- **Carga inicial** (no boot/login): `{ username, level, xp, equipados }`. Retoma o progresso salvo — sem isso o jogo começaria do zero a cada login. _(Fase 1: o mock cria isso no `Awake`. Fase 3: login → `GET /status`.)_
- **Resposta de vitória** (`/victory`): `{ level, xp }`. Atualiza a barra de XP e o rebuild de stats.
- **Snapshot de equipados**: as (até) 4 peças equipadas, recebidas quando o React altera o equipamento (ver [[Equipamentos]]).

A carga inicial é o snapshot completo; os outros dois são atualizações incrementais das suas duas metades (progressão e equipamento).

Ouro, inventário completo e log de drops **não trafegam pro jogo** — são responsabilidade do backend/React.

> **Realidade da Fase 1:** o React não existe ainda. Então o feedback de recompensa (ouro "+X", log de equipamento, XP detalhado) **não aparece in-combat** na Fase 1. Na tela você vê só as moedas, a barra de XP enchendo e as animações. Ouro ganho e item dropado se conferem pelo harness de debug e pelos logs — não é bug, o "suco" de loot só materializa na fase do front.

---

## Decisões de Design

- **HP é transiente e mora só na Unity.** Vida só existe durante a luta; mandar pro front seria tráfego à toa. O front nunca vê HP.
- **UI ligada por eventos.** Os sistemas disparam, a UI escuta. Vale na Fase 1 e na Fase 3 (lá os mesmos eventos alimentam o React / a ponte do WebGL). A renderização por cima é trocável; a fiação por eventos é a parte durável.
- **Dois tipos de interação visual:**
    - **Reativa** — o combate dispara e _não espera_: barra de HP, número de dano, aviso de wave, barra de XP. Só escutam e desenham.
    - **Bloqueante** — o combate dispara e _aguarda terminar_: run, impacto do ataque, morte. O cronograma do combate depende delas. (É aqui que mora o trabalho de implementação — ver [[Sistema de Turnos]].)
- **DamageResult antes da animação.** O resultado do golpe (dano + se foi crítico) é calculado _antes_ de tocar a animação, pra escolher entre ataque normal e ataque crítico. O dano só é **aplicado** no frame de impacto. (Fórmulas em [[Combate]].)
- **Moedas desacopladas do dado.** O loot é calculado no backend e chega depois (com latência). Pra não ter "inimigo morre e o loot aparece 1-2s depois", o inimigo solta moedas **decorativas** (2-3, sem relação com o ouro real) na hora da morte, local. O reveal real das recompensas fica no WaveWon, quando a resposta já chegou — e a animação das moedas voando cobre justamente essa espera.

---

## HUD de Combate

Barras **fixas no topo da tela**:

|Posição|Conteúdo|
|---|---|
|Topo direito|Nome do player + barra de HP + barra de XP (abaixo do HP)|
|Topo esquerdo|Retrato do inimigo + barra de HP|

- A barra de XP mostra **só o preenchimento** — sem número de quanto falta e sem o nível atual (isso é detalhe do painel React).
- O inimigo não tem nome nem XP, só retrato e barra de HP.

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
|_morte_ (custom)|Blink rápido + fade out (sem asset no pacote)|

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

- **2 modelos** + **5 cores**, todos do Tiny Swords. As cores são versões coloridas à mão do pacote (não recolor em runtime), então cada combinação modelo+cor é um conjunto de sprites próprio.
- A cada wave sorteia-se um modelo (1 dos 2) e uma cor. **Puro aleatório** — sem relação com nível, raridade ou dificuldade.
- **Regra de cor:** a cor não repete entre waves consecutivas, e a restrição se mantém **entre confrontos** (precisa lembrar a última cor usada e tirá-la do sorteio). O modelo pode repetir; só a cor é restrita.
- **Player:** modelo fixo, não varia.

### Chefão

Os modelos não têm um "chefão" próprio, e mexer na escala destoa — escalar o sprite quebra a densidade de pixel e perde o acabamento clean do pacote. A distinção da wave final fica por **efeito de shader**: uma aura/brilho saindo do inimigo, dando um ar mais ameaçador sem deformar o sprite. Casa com o aviso "WAVE FINAL" e mantém o personagem com a mesma cara, só "carregado".

> A seleção de modelo/cor e o efeito de chefão vivem no `SetupWave`, **depois** da geração de stats do `EnemyGenerator`. Zero impacto no contrato de dados.

--------
## Feedback Visual

- **Números de dano:** texto flutuante acima da cabeça do alvo, fica ~1-2s. Crítico se distingue por **cor + tamanho + um efeito extra**.
- **Moedas de loot:** o inimigo solta 2-3 moedas (enfeite) ao morrer. No WaveWon elas "voam" até o personagem do player — flourish, sem número. As moedas caem **sempre** (vitória sempre dá ouro); o reveal do equipamento dropado é do React.
- O que **não** é feito na Unity: o número "+X" de ouro, o total de ouro e o log do equipamento dropado — tudo isso é painel React.

---

## Cenário

Fundo **estático**, montado com os assets de ambiente do próprio Tiny Swords. Sem variação por wave/confronto.

---

## Fluxo Visual do Fim de Wave

Amarra o visual aos estados do combate (ver [[Sistema de Turnos]]; valores das recompensas em [[Recompensas]]):

```
Golpe letal (ainda dentro de Battle):
  - inimigo toca a morte (blink + fade)
  - solta 2-3 moedas decorativas
  - o combate aguarda a morte terminar antes de encerrar o Battle

→ WaveWon:
  - moedas voam até o player (enfeite)
  - dispara /victory (ReportVictory) em paralelo
  - ao receber { level, xp }:
      Unity  → barra de XP enche
      React  → "+ouro", total, XP detalhado, log de equipamento
  - transiciona (próxima wave ou Victory)
```

---

## Abordagem de Arquitetura

A UI é ligada por eventos, em **duas direções**:

- **Eventos que o combate emite** (consumidos por listeners reativos):
    - dano aplicado → `{ valor, isCritical, alvo }` — barra de HP + número de dano
    - wave iniciada → `{ número, isFinal }` — aviso de wave
    - vitória resolvida → `{ level, xp }` — barra de XP
- **Sinais que o combate aguarda** (handshake bloqueante com a camada de animação):
    - tocar `run` / aguardar chegada
    - tocar `attack` / aguardar o `onHit` (impacto) e o fim do clipe
    - tocar morte / aguardar o fim

> O desenho detalhado desse handshake — como o `RunBattle` passa a aguardar os sinais de animação em vez de um `turnInterval` fixo — é o passo de implementação a fechar quando formos codar. Este doc fixa **o quê** acontece e **quando**; o **como** vem no código.