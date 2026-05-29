# Elementos das Tabelas
## 1. Tabela das contas dos usuários

### model Usuario

id - String - @id @default(uuid())
username - String - @unique
passwordHash - String - Criptografada
ouro - Int - @default(100)
personagem - Personagem?
equipamentos - Equipamento[200]

## model Personagem

id - String - @id @default(uuid())
usuarioId - String - @unique
usuario - Usuario - @relation(fields: [usuarioId], references: [id])
nivel -  Int - @default(1)
experiencia -  Int - @default(0)

## model Equipamento

id - String - @id @default(uuid())
usuarioId - String
usuario - Usuario - @relation(fields: [usuarioId], references: [id])

#### Status Base do Item
peca - String 
raridade - Int
statusPrincipal - String
valorPrincipal - Float
rating - Int

#### Sub Status
subStatus1_Tipo - String?
subStatus1_Valor - Float?

subStatus2_Tipo - String?
subStatus2_Valor - Float?

subStatus3_Tipo - String?
subStatus3_Valor - Float?

subStatus4_Tipo - String?
subStatus4_Valor - Float?

#### Controle de Mercado e Inventario
estaEquipado - Boolean - @default(false)
estaAVenda - Boolean - @default(false)
precoVenda - Int?