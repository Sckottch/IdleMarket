## Visão Geral

Responsável pelo loop de gameplay focado em progressão automática e obtenção de equipamentos através do ganho de combates para fortalecer o personagem, esses que podem ser comprados de um marketplace interno.

**Engine:** Unity (versão 6000.3.13f)
**Gênero:** Auto Battler/Idle
**Estilo de Arte:** 2D

## Funcionalidades

- **Auto Battler:** Os combates ocorrem automaticamente sem necessidade de input do jogador, com ele e o inimigo trocando turnos até que os pontos de vida de algum deles acabe.
- **Sistema de Drops:** Ao fim de cada combate caso o jogador vença ele, receberá itens, ouro e experiencia, com o Backend validando e salvando os ganhos
- Interface: HUD de combate com barras de HP (jogador e inimigo) e XP, mais mais voltada a feedbacks visuais. Dados persistentes e gerenciamento de equipamento ficam no front

## Progressão

### [[Combate]]
será baseado em waves, cada combate terá 5 waves, as 4 primeiras são inimigos comuns com a ultima sendo um chefão. O nível dos inimigos será definido no inicio de cada confronto se baseando no nível do jogador.

### [[Recompensas]]
irão escalar conforme o nível dos inimigos, sendo que conforme o nível aumenta as recompensas melhoram, aumentando quantidade de ouro e experiencia além da chance de vir um equipamento. Os chefões sempre dão equipamentos e a qualidade deles são maior que os deixados por inimigos comuns.

### Nível
O jogador inicia no nível 1, podendo chegar até o 50, com os inimigos podendo ir até o 55.

### Derrota
Ao perder um combate, reinicia o confronto a partir da primeira wave, perdendo 5% de seus ouros.

### [[Equipamentos]]
São divididos em 4 peças: capacete, espada, armadura e botas, tendo 5 raridades(indicadas por estrelas e cor da borda do item). Esses itens darão status baseados em sua peça(definindo o status principal) e raridade(definindo o valor), além de terem até 4 sub status com a quantidade sendo baseada na raridade. Os valores de Status q darão será um range, segue a tabela explicando melhor:

| Peça     | Status     |
| -------- | ---------- |
| Cabeça   | Vida%      |
| Espada   | Ataque%    |
| Armadura | Defesa%    |
| Bota     | Velocidade |

| Raridade | Range de Status | Qtd. de Sub Status |
| -------- | --------------- | ------------------ |
| 1*       | 5-10%           | 0                  |
| 2*       | 10-20%          | 1                  |
| 3*       | 20-30%          | 2                  |
| 4*       | 30-40%          | 3                  |
| 5*       | 40-50%          | 4                  |

Os sub status podem variar entre Status%(n podendo ser velocidade) e chance e dano critico, não podendo repetir o mesmo duas vezes no mesmo equipamento, mas pode ser igual ao principal do equipamento. Seus valores seguem sempre o mesmo range independente da raridade, variando apenas entre o tipo de status. Segue a tabela com os possíveis valores:

| Tipo de Status  | Range de Valor |
| --------------- | -------------- |
| Status%         | 10-20          |
| Chance Critica% | 5-15           |
| Dano Critico%   | 10-30          |
A cada equipamento é dado uma pontuação baseado na qualidade de seus valores, quanto mais próximo do maior valor possível, maior a pontuação. Sendo avaliados em um numero de 1-100.

### [[Interface]]

A interface in-game (Unity) cobre só o que pertence à janela de combate: barras de HP do jogador e do inimigo, barra de XP e feedbacks visuais (dano, crítico). Os dados persistentes (ouro, nível, XP detalhado) e o gerenciamento de itens ficam no painel React em volta do WebGL.
## Integração

O jogo receberá as informações do jogador ao iniciar, com o Backend sendo responsável pelo sistema de login, com isso enviará sinais sempre q o jogador derrotar um inimigo, e irá esperar receber as recompensas(que serão calculadas pelo Backend) antes de seguir para próxima wave.

## Market Place


Local onde o jogador poderá colocar os equipamentos obtidos a venda e comprar itens anunciados por outros jogadores.

## Arte
Será usado o pacote [Tiny Swords](https://assetstore.unity.com/packages/2d/environments/tiny-swords-352566), que é gratuito na Asset Store. 