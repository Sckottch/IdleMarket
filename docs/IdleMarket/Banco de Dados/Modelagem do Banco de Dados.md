# Modelagem do Banco de Dados

> Stack: PostgreSQL + Prisma ORM

## Decisões de Design

- **Tipos categóricos (peça, status):** `enum` nativo do Prisma/Postgres, ao invés de String solta ou Int. O banco valida os valores, continua legível em queries e é armazenado de forma eficiente.
- **Um único enum `TipoStatus`:** serve tanto para `statusPrincipal` quanto para os sub-status. As restrições (velocidade não pode ser sub-status; status principal é definido pela peça) são garantidas pela **lógica do gerador**, não por enums separados.
- **Sub-status no banco:** ficam como 4 pares de colunas achatadas. No código C# viram uma `List<SubStatus>`. O **Backend faz a tradução**: lê as colunas e monta um array no JSON da API, então a Unity recebe uma lista limpa.
- **Serialização na Unity:** usaremos Newtonsoft.Json (não o JsonUtility nativo), por causa dos campos anuláveis e da conversão enum↔string.
- **Limite de 200 itens:** regra de negócio validada no Backend, não é constraint do schema.

## Enums

```prisma
enum TipoPeca {
  Cabeca
  Espada
  Armadura
  Bota
}

enum TipoStatus {
  Vida
  Ataque
  Defesa
  Velocidade
  ChanceCritica
  DanoCritico
}
```

## model Usuario

| Campo        | Tipo          | Notas                        |
| ------------ | ------------- | ---------------------------- |
| id           | String        | @id @default(uuid())         |
| username     | String        | @unique                      |
| passwordHash | String        | senha criptografada (bcrypt) |
| ouro         | Int           | @default(100)                |
| personagem   | Personagem?   | relação 1:1                  |
| equipamentos | Equipamento[] | limite de 200 via Backend    |

## model Personagem

| Campo       | Tipo    | Notas                                           |
| ----------- | ------- | ----------------------------------------------- |
| id          | String  | @id @default(uuid())                            |
| usuarioId   | String  | @unique                                         |
| usuario     | Usuario | @relation(fields: [usuarioId], references: [id])|
| nivel       | Int     | @default(1)                                     |
| experiencia | Int     | @default(0)                                     |

## model Equipamento

### Status Base
| Campo           | Tipo       | Notas                            |
| --------------- | ---------- | -------------------------------- |
| id              | String     | @id @default(uuid())             |
| usuarioId       | String     | dono atual do item               |
| usuario         | Usuario    | @relation(fields: [usuarioId], references: [id]) |
| peca            | TipoPeca   | enum                             |
| raridade        | Int        | 1 a 5 (estrelas)                 |
| statusPrincipal | TipoStatus | enum                             |
| valorPrincipal  | Float      | valor rolado do status principal |
| rating          | Int        | 0 a 100, calculado na geração    |

### Sub-Status (até 4, conforme raridade)
| Campo            | Tipo        | Notas               |
| ---------------- | ----------- | ------------------- |
| subStatus1_Tipo  | TipoStatus? | nulo se não existir |
| subStatus1_Valor | Float?      |                     |
| subStatus2_Tipo  | TipoStatus? |                     |
| subStatus2_Valor | Float?      |                     |
| subStatus3_Tipo  | TipoStatus? |                     |
| subStatus3_Valor | Float?      |                     |
| subStatus4_Tipo  | TipoStatus? |                     |
| subStatus4_Valor | Float?      |                     |

### Controle de Mercado e Inventário
| Campo        | Tipo    | Notas                        |
| ------------ | ------- | ---------------------------- |
| estaEquipado | Boolean | @default(false)              |
| estaAVenda   | Boolean | @default(false)              |
| precoVenda   | Int?    | nulo quando não está à venda |