# Dashboard

> Hub de perfil e inventário (`Dashboard.tsx`). Roda dentro do `MainLayout` (com [[Componentes#TopNav|TopNav]]), que é por onde se chega até ele.

## Layout — 3 colunas

A tela ocupa a altura cheia (`h-full`) e é dividida horizontalmente:

1. **Painel do jogador (esquerda):** ícone de perfil (pixel art), nome do usuário, nível, progresso de XP (`xp/xpForNextLevel`) e ouro. No rodapé do painel, os itens **equipados** em cards `md` — clicar abre o modal de detalhe.
2. **Filtros (centro):** o componente [[Componentes#EquipmentFilters|EquipmentFilters]], em coluna estreita rolável.
3. **Grade do inventário (direita):** a área principal, **a única que rola**. Mostra os itens guardados (não equipados ainda aparecem; itens à venda ficam de fora — `!i.isForSale`), em cards `lg`.

Só a grade tem scroll: a cadeia `h-full` → `min-h-0` → `overflow-y-auto` isola a rolagem na coluna principal, mantendo painel e filtros fixos.

## Filtros e ordenação

- **`EquipmentFilters`** é controlado (`value` + `onChange`): o Dashboard guarda o `Filters` em estado e o componente só reflete/edita. No Dashboard ele roda com `showRating` e `showRarity` (sem preço — mesmo conjunto da aba Vender do [[Mercado]]).
- **`filterEquipment(items, filters)`** (em `lib/equipmentFilters.ts`) é uma **função pura**: recebe a lista e os filtros, devolve a lista filtrada. Tipo, faixa de status principal, sub-status, rating mínimo e raridade. Fica fora do componente pra ser testável e reusável (Dashboard e Mercado usam a mesma).
- **`sortInventory`** ordena por **raridade decrescente**, e em empate por **rating decrescente**.

A pipeline é sempre: `sortInventory(filterEquipment(inventário, filtros))`.

## Modal de item

Clicar num card (equipado ou do inventário) abre o `ItemModal`, que mostra o detalhe (tipo, raridade em estrelas, rating, status principal e sub-status) e as ações:

- **Equipar** — se o item não está equipado.
- **Desequipar** — se já está equipado.
- **Deletar** — com confirmação inline ("Deletar este item permanentemente?", Sim/Cancelar) antes de remover.

As ações chamam `equip` / `unequip` / `deleteItem` do [[Documentação Frontend#PlayerContext|PlayerContext]]. `Esc` fecha o modal. Se a ação falha, a mensagem de erro do backend aparece num **toast** (ver [[Componentes#Toast|Toast]]); no sucesso não há toast — a própria mudança da tela já é o feedback.

## Desvio da doc original

A doc previa um botão **"Anunciar no Mercado"** dentro deste modal. Na implementação, anunciar saiu daqui e foi pra **aba Vender** do [[Mercado]] — o modal do Dashboard cuida só de equipar/desequipar/deletar. Concentrar a venda no Mercado mantém a responsabilidade de cada tela mais limpa.
