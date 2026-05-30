# Planejamento do Sistema de Equipamentos

## Peças e Status Principal

|Peça|Status Principal|
|---|---|
|Cabeça|Vida%|
|Espada|Ataque%|
|Armadura|Defesa%|
|Bota|Velocidade|

---

## Raridades

|Raridade|Range do Status Principal|Qtd. de Sub Status|
|---|---|---|
|1★|5-10%|0|
|2★|10-20%|1|
|3★|20-30%|2|
|4★|30-40%|3|
|5★|40-50%|4|

---

## Sub Status

Os sub status são atributos adicionais do equipamento, com quantidade definida pela raridade. Seguem as regras:

- Não podem se repetir no mesmo equipamento
- Podem ser iguais ao status principal da peça
- Velocidade **não pode** ser sub status

|Tipo|Range de Valor|
|---|---|
|Status% (Vida, Ataque ou Defesa)|10-20%|
|Chance Crítica%|5-15%|
|Dano Crítico%|10-30%|

---

## Aplicação de Status no Personagem

Status percentuais (Vida, Ataque, Defesa) são **multiplicativos** sobre o valor base:

```
VidaTotal    = VidaBase    * (1 + Vida%    / 100)
AtaqueTotal  = AtaqueBase  * (1 + Ataque%  / 100)
DefesaTotal  = DefesaBase  * (1 + Defesa%  / 100)
```

Velocidade, Chance Crítica e Dano Crítico são **aditivos** sobre o valor base:

```
VelocidadeTotal    = VelocidadeBase    + Velocidade dos equipamentos
ChanceCriticaTotal = ChanceCriticaBase + ChanceCritica% dos equipamentos
DanoCriticoTotal   = DanoCriticoBase   + DanoCritico% dos equipamentos
```

---

## Rating

Cada equipamento recebe uma pontuação de **0 a 100** baseada na qualidade de seus valores:

- **0** representa o min roll de todos os status
- **100** representa o max roll de todos os status
- O rating é calculado pela **média** entre o status principal e todos os sub status presentes
- Cada status é avaliado individualmente comparando seu valor atual contra o range possível daquele tipo

**Exemplo:** Uma espada 1★ com 7.5% de Ataque (range 5-10%) tem rating **50**, pois está exatamente no meio do range possível.

---

## Sistema de Drops

### Chance de Drop por Wave

- **Wave comum:** 70% de chance de dropar um equipamento
- **Chefão (wave 5):** sempre dropa um equipamento, com a raridade máxima baseado em seu nível

### Raridade do Drop

A raridade do item dropado é baseada no nível do jogador no momento da vitória:

| Nível do Jogador | 1★  | 2★  | 3★  | 4★  | 5★   |
| ---------------- | --- | --- | --- | --- | ---- |
| 1-4              | 75% | 25% | 0%  | 0%  | 0%   |
| 5-14             | 10% | 60% | 30% | 0%  | 0%   |
| 15-24            | 0%  | 10% | 60% | 30% | 0%   |
| 25-34            | 0%  | 0%  | 10% | 60% | 30%  |
| 35-44            | 0%  | 0%  | 0%  | 25% | 75%  |
| 45-50            | 0%  | 0%  | 0%  | 0%  | 100% |
