## Visão Geral

Interface web construída em React que serve como o hub do jogador fora da Unity. Nela, o usuário poderá gerenciar sua conta, visualizar os atributos do seu personagem, equipar ou desequipar itens e interagir com a economia viva do jogo através do mercado de trocas.

**Framework:** React (Vite / TypeScript) 
**Estilo:** CSS Moderno (Tailwind CSS ou similar, focado em uma interface escura estilo RPG)

## Telas e Fluxos

O sistema será composto por 3 telas principais, acessíveis após o login, tendo uma barra na parte superior para transicionar entre elas:

### 1. Tela de Autenticação(Login/Cadastro)
 - **Comportamento:** Uma tela simples com formulários para alternar entre "Entrar" e "Criar Conta".
- **Campos:** Usuário e Senha.
- **Ação:** Envia os dados para o Backend. Se bem-sucedido, armazena o token de sessão e redireciona o usuário para o Jogo.
- **Cadastro:** possuirá os mesmos campos do login, apenas adicionando um de confirmar senha.

### 2. Dashboard do Jogador (Perfil e Inventário)

Esta tela é dividida em duas colunas ou seções principais:

- **Painel de Status:** Exibe o nome do usuário, nível atual, barra de experiência e a quantidade de ouro na conta.
- **Grade de Equipamentos (Slots Ativos):** Mostra o que o personagem está vestindo atualmente (4 slots: Cabeça, Espada, Armadura, Botas).
- **Inventário (Baú):** Uma grade (grid) exibindo os itens que o jogador possui guardados (respeitando o limite de até 200 itens).
    - Ao clicar em um item do inventário, abre um modal/painel mostrando seus atributos (Status Principal, Raridade em estrelas e os Sub status).
    - Se o slot correspondente no corpo estiver vazio, exibe o botão **"Equipar"**. Se o item já estiver equipado, exibe **"Desequipar"**.
    - Exibe o botão **"Anunciar no Mercado"**.

### 3. Marketplace

O mercado é o centro de trocas entre os jogadores e possui duas abas internas:

- **Aba: Comprar Itens**
    - Exibe uma lista com todos os equipamentos que outros usuários colocaram à venda.
    - Cada card de item mostra a peça, a raridade, o preço em ouro e o botão **"Comprar"**.
    - Ao clicar em comprar, o sistema valida se o jogador tem ouro suficiente. Se tiver, desconta o valor e move o item para o inventário dele.
    - Terá opções de filtro avançadas, podendo selecionar peças a partir de seus valores, sub status dela, tipo de peça e preço
- **Aba: Anunciar Item**
    - Abre um formulário simples ao selecionar um item do inventário.
    - O jogador digita o valor em ouro que deseja cobrar e clica em **"Confirmar Venda"**. O item some do inventário local e vai para a lista global de vendas.

### 4. Jogo

O jogo rodará integrado diretamente na página web através do player do Unity WebGL. A tela será dividida em três regiões:

- **Painel Lateral Esquerdo (Faixa):** Exibe de forma fixa os dados estáticos do jogador (Nome, Nível, Barra de Experiência e Ouro). Além de possuir uma área onde mostrará ao jogador os últimos equipamentos obtidos, mostrando valores e sub status de forma simplificada. 
- **Painel Superior Direito (Destaque):** A janela onde o jogo da Unity roda e os combates acontecem automaticamente.
- **Painel Inferior (Rodapé):** Exibe visualmente os 4 equipamentos que o personagem está vestindo atualmente (Cabeça, Espada, Armadura, Botas). além de possuir um botão para gerenciar os equipamentos q abrirá uma janela em pop-up onde ele poderá alterar seus equipamentos.