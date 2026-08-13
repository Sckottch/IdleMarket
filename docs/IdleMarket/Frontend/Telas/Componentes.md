# Componentes reutilizáveis

> Componentes compartilhados entre telas. Elementos de uma tela só (modais de confirmação, modal de detalhe do Dashboard, formulário de venda, filtros) ficam documentados na própria tela que os usa — aqui ficam só os reaproveitados em mais de um lugar.

## ItemCard

Card retangular que representa um equipamento. Usado no [[Dashboard]], [[Jogo]], [[Mercado]] e no EquipmentManager.

- **Tamanhos:** `md` (compacto, painéis) e `lg` (grades principais).
- **Conteúdo:** ícone do tipo (pixel art), rating no canto, raridade em estrelas, status principal e a coluna de sub-status.
- **Cor de raridade:** borda e fundo derivam da raridade (1→5). O fundo usa tokens `color-mix` definidos em `index.css` (`--rarity-N-bg`); a borda usa classes de cor por raridade (`rarityBorder`). Os mapeamentos ficam em `lib/equipmentVisuals.ts`.
- **`onClick` opcional:** quando presente, vira clicável (cursor + hover). Sem ele, o card é só display.

## TopNav

A barra de navegação superior (`TopNav.tsx`), renderizada pelo `MainLayout` em todas as telas autenticadas.

- **Esquerda:** marca **IdleMarket**.
- **Centro:** links de navegação **Jogo** e **Mercado** (`NavLink`, destaca o ativo).
- **Direita:** pílula de **ouro** (lida do [[Documentação Frontend#PlayerContext|PlayerContext]], e âncora do número flutuante de +/- ouro — ver `FloatingNumber`), ícone do usuário + nome (leva ao [[Dashboard]]) e o botão de **logout**.
- **Logout:** abre um modal de **confirmação** ("Deseja sair da sua conta?"). Confirmando, chama `logout()` do PlayerContext — que limpa o cache via `AuthService.logout()` (token + dados em cache) **e** zera o estado em memória (status/inventário, pra não vazar dados entre contas) — e navega de volta pro `/login`.

## EquipmentManager

Popup de gerenciamento de equipamentos, aberto a partir da [[Jogo|tela do Jogo]] clicando num card de equipado — abre já no tipo correspondente.

- **Tamanho fixo** (`w-280 h-160`, limitado à viewport); cabeçalho e linha de slots ficam fixos, só a grade rola.
- **Slots por tipo:** uma linha com os 4 tipos na ordem espada→capacete→armadura→botas. O slot mostra o `ItemCard` do item equipado (com um ✕ pra desequipar na hora) ou um `EmptySlot` (placeholder tracejado com o ícone do tipo) quando vazio. Clicar num slot seleciona aquele tipo.
- **Grade filtrada por tipo:** abaixo dos slots, os itens do inventário **do tipo selecionado** que ainda não estão equipados, ordenados por `sortInventory`. Clicar num item o equipa.
- Equip/unequip chamam o PlayerContext. `Esc` ou clique fora fecham. Erros sobem por `onError` pra tela do [[Jogo]] mostrar o toast.

## Toast

Aviso flutuante temporário (`Toast.tsx` + hook `useToast`), reusado no [[Mercado]], [[Dashboard]] e [[Jogo]]. Aparece no topo, fica ~2s e some sozinho. Tem variante de **sucesso** (verde) e **erro** (vermelho); o hook guarda a mensagem e cuida do auto-dismiss, o componente só desenha. O grosso do uso é **feedback de erro**, com a mensagem que o backend mandou (o `api` lança em respostas de erro — ver [[Documentação Frontend]]).

## FloatingNumber

Número que aparece e some sozinho (~1s), usado nos feedbacks da [[Jogo|tela do Jogo]]: **+XP** sobre a barra de XP e **+/- ouro** no contador da TopNav. Verde pra positivo, vermelho pra negativo; o pai posiciona via `className`. O caso do ouro cruza componentes (Game → TopNav) por um contexto leve (`GoldFxContext`).
