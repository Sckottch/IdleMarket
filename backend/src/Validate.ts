import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../generated/prisma/client.js"
import prismaConfig from "../prisma.config.js"
import { use } from "react"

const adapter = new PrismaPg({connectionString: process.env.DATABASE_URL})
const prisma = new PrismaClient({ adapter })

async function main() {

    await prisma.user.deleteMany()

    const user = await prisma.user.create({
        data: {
            username: "sckottch",
            passwordHash: "fake_hash",
            character: {
                create: {}
            }
        },

        include: { character: true }
    })

    console.log("User criado:", user)

    const equipment = await prisma.equipment.create({
        data: { 
            equipmentType: "Sword",
            rarity: 3,
            mainStat: "Attack",
            mainStatValue: 27.5,
            rating: 85,
            user: {
                connect: { id: user.id }
            },
            subStats: {
                create: [{
                    "statType": "CriticalChance",
                    "statValue": 12.5
                }, {
                    "statType": "CriticalDamage",
                    "statValue": 25.0
                }]
            },
        },

    })

    const findEquipment = await prisma.equipment.findMany({ include: { subStats: true }})

    console.log("Equipamento criado: ", findEquipment)

    await prisma.equipment.update({
        where: {
            id: equipment.id
        },
        data: {
            isEquipped: true
        }
    })

    const updatedEquipment = await prisma.equipment.findMany({include: { subStats: true }})
    console.log("Atualizações feitas.", updatedEquipment)
}

main()
    .catch((e) => console.error(e))
    .finally(() => prisma.$disconnect)
