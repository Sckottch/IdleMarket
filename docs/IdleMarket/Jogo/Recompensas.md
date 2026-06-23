# Planejamento do Sistema de Recompensas

## Experiência (XP)

### XP para Subir de Nível

A quantidade de XP necessária para avançar do nível N para N+1 segue a fórmula:

```
XP para Subir = 10 * N² + 100 * N
```

### XP por Inimigo Derrotado

A quantidade de XP concedida por um inimigo de nível N segue a fórmula:

```
XP do Inimigo (comum) = 25 * N
XP do Chefão          = XP do Inimigo * 2
```

---

## Ouro

### Ouro por Inimigo Derrotado

A quantidade de ouro concedida por um inimigo de nível N segue a fórmula:

```
Ouro do Inimigo (comum) = 15 * N
Ouro do Chefão          = Ouro do Inimigo * 2
```

### Ouro Inicial

O jogador inicia com **100 de ouro**.

### Penalidade de Derrota

Ao perder um confronto, o jogador perde **5% do ouro atual**. O ouro pode chegar a zero mas **nunca será negativo**.

---

## Drops de Equipamento

- **Wave comum:** 60% de chance de dropar um equipamento
- **Chefão (wave 5):** sempre dropa um equipamento com a raridade máxima baseada em seu nível

A raridade do item dropado é baseada no nível do inimigo no momento da vitória:

| Nível do Jogador | 1★  | 2★  | 3★  | 4★  | 5★   |
| ---------------- | --- | --- | --- | --- | ---- |
| 1-4              | 75% | 25% | 0%  | 0%  | 0%   |
| 5-14             | 10% | 60% | 30% | 0%  | 0%   |
| 15-24            | 0%  | 10% | 60% | 30% | 0%   |
| 25-34            | 0%  | 0%  | 10% | 60% | 30%  |
| 35-44            | 0%  | 0%  | 0%  | 25% | 75%  |
| 45-50            | 0%  | 0%  | 0%  | 0%  | 100% |

---

## Subida de Nível Durante o Confronto

Ao subir de nível no meio de um confronto:

- Os **atributos do jogador são atualizados imediatamente**
- O **nível dos inimigos não é alterado** — permanece o calculado no início do confronto
- O jogador **não tem acesso imediato** às recompensas do novo nível (drops, ouro e XP continuam baseados nos inimigos já gerados)

---

## Tabela de Progressão Completa

| Nível | XP p/ Subir | XP do Inimigo | Inimigos p/ Subir | Inimigos (-1 nível) | XP Total Acumulado |
| ----- | ----------- | ------------- | ----------------- | ------------------- | ------------------ |
| 1     | 110         | 25            | 5                 | —                   | 0                  |
| 2     | 240         | 50            | 5                 | 10                  | 110                |
| 3     | 390         | 75            | 6                 | 8                   | 350                |
| 4     | 560         | 100           | 6                 | 8                   | 740                |
| 5     | 750         | 125           | 6                 | 8                   | 1.300              |
| 6     | 960         | 150           | 7                 | 8                   | 2.050              |
| 7     | 1.190       | 175           | 7                 | 8                   | 3.010              |
| 8     | 1.440       | 200           | 8                 | 9                   | 4.200              |
| 9     | 1.710       | 225           | 8                 | 9                   | 5.640              |
| 10    | 2.000       | 250           | 8                 | 9                   | 7.350              |
| 11    | 2.310       | 275           | 9                 | 10                  | 9.350              |
| 12    | 2.640       | 300           | 9                 | 10                  | 11.660             |
| 13    | 2.990       | 325           | 10                | 10                  | 14.300             |
| 14    | 3.360       | 350           | 10                | 11                  | 17.290             |
| 15    | 3.750       | 375           | 10                | 11                  | 20.650             |
| 16    | 4.160       | 400           | 11                | 12                  | 24.400             |
| 17    | 4.590       | 425           | 11                | 12                  | 28.560             |
| 18    | 5.040       | 450           | 12                | 12                  | 33.150             |
| 19    | 5.510       | 475           | 12                | 13                  | 38.190             |
| 20    | 6.000       | 500           | 12                | 13                  | 43.700             |
| 21    | 6.510       | 525           | 13                | 14                  | 49.700             |
| 22    | 7.040       | 550           | 13                | 14                  | 56.210             |
| 23    | 7.590       | 575           | 14                | 14                  | 63.250             |
| 24    | 8.160       | 600           | 14                | 15                  | 70.840             |
| 25    | 8.750       | 625           | 14                | 15                  | 79.000             |
| 26    | 9.360       | 650           | 15                | 15                  | 87.750             |
| 27    | 9.990       | 675           | 15                | 16                  | 97.110             |
| 28    | 10.640      | 700           | 16                | 16                  | 107.100            |
| 29    | 11.310      | 725           | 16                | 17                  | 117.740            |
| 30    | 12.000      | 750           | 16                | 17                  | 129.050            |
| 31    | 12.710      | 775           | 17                | 17                  | 141.050            |
| 32    | 13.440      | 800           | 17                | 18                  | 153.760            |
| 33    | 14.190      | 825           | 18                | 18                  | 167.200            |
| 34    | 14.960      | 850           | 18                | 19                  | 181.390            |
| 35    | 15.750      | 875           | 18                | 19                  | 196.350            |
| 36    | 16.560      | 900           | 19                | 19                  | 212.100            |
| 37    | 17.390      | 925           | 19                | 20                  | 228.660            |
| 38    | 18.240      | 950           | 20                | 20                  | 246.050            |
| 39    | 19.110      | 975           | 20                | 21                  | 264.290            |
| 40    | 20.000      | 1.000         | 20                | 21                  | 283.400            |
| 41    | 20.910      | 1.025         | 21                | 21                  | 303.400            |
| 42    | 21.840      | 1.050         | 21                | 22                  | 324.310            |
| 43    | 22.790      | 1.075         | 22                | 22                  | 346.150            |
| 44    | 23.760      | 1.100         | 22                | 23                  | 368.940            |
| 45    | 24.750      | 1.125         | 22                | 23                  | 392.700            |
| 46    | 25.760      | 1.150         | 23                | 23                  | 417.450            |
| 47    | 26.790      | 1.175         | 23                | 24                  | 443.210            |
| 48    | 27.840      | 1.200         | 24                | 24                  | 470.000            |
| 49    | 28.910      | 1.225         | 24                | 25                  | 497.840            |
| 50    | — (máximo)  | 1.250         | —                 | —                   | 526.750            |
