# Planejamento do Sistema de Combate

## Atributos Base do Personagem (Nível 1)

| Atributo       | Valor Base | Escalonamento |
| -------------- | ---------- | ------------- |
| Vida           | 200        | +50 por nível |
| Ataque         | 20         | +5 por nível  |
| Defesa         | 10         | +3 por nível  |
| Velocidade     | 10         | Fixo          |
| Chance Crítica | 15%        | Fixo          |
| Dano Crítico   | 50%        | Fixo          |

Velocidade, Chance Crítica e Dano Crítico só aumento via equipamentos

--------------

## Fórmulas de Combate 

	DanoNormal = Ataque * (100 / (100 + Defesa))
	DanoCritico = DanoNormal * (1 + (danoCritico% / 100))

-----

## Mecânica de Turnos

- Cada turno, jogador e inimigo atacam **uma vez**
- O de maior velocidade ataca primeiro
- Em caso de velocidades iguais o jogador age primeiro

----

## Inimigos

- Mesmo atributos base e escalonamento do jogador
- **Chance Crítica base: 5% | Dano Crítico base: 30%**
- Gerados com equipamentos aleatórios com base no nível em q são gerados

| Nível | Qtd. de Peças(Comum) | Raridade | Chefão(Peças e Raridade) |
| ----- | -------------------- | -------- | ------------------------ |
| 1-5   | 0-1 peças            | 1★       | 1 peça de 1★             |
| 6-10  | 1-2 peças            | 1-2★     | 2 peças de 2★            |
| 11-20 | 2-3 peças            | 1-3★     | 3 peças de 3★            |
| 21-30 | 2-4 peças            | 2-3★     | 4 peças de 3★            |
| 31-40 | 3-4 peças            | 2-4★     | 4 peças de 4★            |
| 41-50 | 4 peças              | 4-5★     | 4 peças de 5★            |
| 51-55 | 4 peças              | 5★       | 4 peças de 5★            |
as chances de um inimigo vir com uma peça a mais, indicado como o máximo de pecas q pode possuir é de 40%, por exemplo um inimigo de nível 3 tem 40% de chance de ser criado com um equipamento. Para inimigos nos níveis 21-30, possuem 15% de chance de vir com 2 peças, 60% para 3, e 25% de vir com 4 equipamentos, em relação às raridades segue a tabela:

| nível\Raridade | 1★   | 2★  | 3★  | 4★  | 5★   |
| -------------- | ---- | --- | --- | --- | ---- |
| 1-5            | 100% | 0%  | 0%  | 0%  | 0%   |
| 6-10           | 75%  | 25% | 0%  | 0%  | 0%   |
| 11-20          | 15%  | 60% | 25% | 0%  | 0%   |
| 21-30          | 0%   | 30% | 70% | 0%  | 0%   |
| 31-40          | 0%   | 15% | 60% | 25% | 0%   |
| 41-50          | 0%   | 0%  | 0%  | 80% | 20%  |
| 51-55          | 0%   | 0%  | 0%  | 0%  | 100% |

### Nível dos Inimigos nas waves

O nível dos inimigos nas waves é baseado no nível do jogador no inicio do confronto, com eles podendo ser do mesmo nível do jogador(60% de chance) ou estar um abaixo(40%). O nível do Chefão é sempre 1 acima do jogador. O calculo é feito ao inicio do confronto não alterando o nível dos inimigos caso o jogador suba de nível no meio do confronto.
