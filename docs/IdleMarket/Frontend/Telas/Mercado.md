# Mercado

> Centro de trocas entre jogadores (`Marketplace.tsx`), dentro do `MainLayout`. Duas abas internas — **Comprar** e **Vender** — alternadas por estado local; a aba ativa é **mantida após o F5** (guardada em `sessionStorage`). Toda ação passa pelo seam `marketService` (fixtures na Fase 4, `fetch` real no `/api/market` na Fase 5).

## Aba Comprar

Lista os equipamentos que outros jogadores anunciaram (`getListings`, guardado em estado local).

- Coluna de **filtros** ([[Componentes#EquipmentFilters|EquipmentFilters]]) com `showRating`, `showRarity` **e `showPrice`** — a faixa de preço só faz sentido na compra.
- Grade de cards `lg`; abaixo de cada card, o preço e o botão **Comprar**.
- A grade usa `grid auto-fit` centralizado: as colunas se alinham no meio, mas os itens preenchem da esquerda pra direita (a última linha fica encostada à esquerda).

### UX de affordability
- O preço aparece **branco** se o jogador tem ouro suficiente, **vermelho** se não tem.
- Ao clicar em **Comprar**, se o ouro local já cobre o preço, vai direto pro `ConfirmDialog`. Se o preço está vermelho (ouro insuficiente pelo estado local), faz um `await refresh()` pra reconferir o ouro real antes de barrar — só então mostra o toast **"Ouro insuficiente."** (popup que some em ~2s).
- A confirmação (`ConfirmDialog`) pergunta antes de efetivar. No confirmar, revalida que o item ainda está na lista (senão toast "Item não está mais disponível."), chama `buyItem` e, no sucesso, **re-busca a lista** (`getListings`, a fonte real da aba) e mostra toast de **sucesso**. Em erro, o toast traz a mensagem vinda do backend (ver [[Componentes#Toast|Toast]]).

> O front faz só checagem de UX. A transação autoritativa (debita ouro, transfere o item) é do backend — `POST /api/market/buy` — que rejeita auto-compra e ouro insuficiente server-side.

## Aba Vender

Sem filtro de preço (`showRating` + `showRarity` apenas — mesmo conjunto do [[Dashboard]]). Ao entrar na aba, dispara um `refresh()` — assim um item vendido enquanto o jogador estava em outra tela some, em vez de virar fantasma. Duas seções:

1. **Anúncios ativos:** itens com `isForSale`, mostrando o preço pedido + botão **Cancelar**, que chama `unlistItem` (volta o item pro inventário) — `POST /api/market/unlist`.
2. **Itens disponíveis pra anunciar:** itens não equipados e não anunciados. Clicar abre o `SellForm` — formulário simples onde o jogador digita o preço em ouro e confirma (`sellItem`), botão habilitado só com valor válido (`> 0`).

Anunciar e cancelar dão feedback por toast (sucesso/erro).

## Desvio da doc original

A doc previa o "Anunciar" saindo do **modal do Dashboard**. Na implementação, **anunciar mora aqui**, na aba Vender — o Dashboard cuida só de equipar/desequipar/deletar (ver nota em [[Dashboard]]). Concentrar compra e venda no Mercado deixa cada tela com uma responsabilidade só.
