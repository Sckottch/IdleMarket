# Mercado

> Centro de trocas entre jogadores (`Marketplace.tsx`), dentro do `MainLayout`. Duas abas internas — **Comprar** e **Vender** — alternadas por estado local. Toda ação passa pelo seam `marketService` (fixtures na Fase 4, REST na Fase 5).

## Aba Comprar

Lista os equipamentos que outros jogadores anunciaram (`getListings`, guardado em estado local).

- Coluna de **filtros** ([[Componentes#EquipmentFilters|EquipmentFilters]]) com `showRating`, `showRarity` **e `showPrice`** — a faixa de preço só faz sentido na compra.
- Grade de cards `lg`; abaixo de cada card, o preço e o botão **Comprar**.
- A grade usa `grid auto-fit` centralizado: as colunas se alinham no meio, mas os itens preenchem da esquerda pra direita (a última linha fica encostada à esquerda).

### UX de affordability
- O preço aparece **branco** se o jogador tem ouro suficiente, **vermelho** se não tem.
- Ao clicar em **Comprar**, se o ouro local já cobre o preço, vai direto pro `ConfirmDialog`. Se o preço está vermelho (ouro insuficiente pelo estado local), faz um `await refresh()` pra reconferir o ouro real antes de barrar — só então mostra o toast **"Ouro insuficiente."** (popup que some em ~2s).
- A confirmação (`ConfirmDialog`) pergunta antes de efetivar. No confirmar, revalida que o item ainda está na lista (senão toast "Item não está mais disponível."), chama `buyItem` e remove o item da listagem local.

> O front faz só checagem de UX. A transação autoritativa (debita ouro, transfere o item) é do backend na Fase 5 — `POST /api/market/buy`.

## Aba Vender

Sem filtro de preço (`showRating` + `showRarity` apenas — mesmo conjunto do [[Dashboard]]). Duas seções:

1. **Anúncios ativos:** itens com `isForSale`, mostrando o preço pedido + botão **Cancelar**, que chama `unlistItem` (volta o item pro inventário). Depende de uma rota nova no backend (`POST /unlist`, ver [[Documentação Backend]]).
2. **Itens disponíveis pra anunciar:** itens não equipados e não anunciados. Clicar abre o `SellForm` — formulário simples onde o jogador digita o preço em ouro e confirma (`sellItem`), botão habilitado só com valor válido (`> 0`).

## Desvio da doc original

A doc previa o "Anunciar" saindo do **modal do Dashboard**. Na implementação, **anunciar mora aqui**, na aba Vender — o Dashboard cuida só de equipar/desequipar/deletar (ver nota em [[Dashboard]]). Concentrar compra e venda no Mercado deixa cada tela com uma responsabilidade só.
