import { type FastifyInstance } from "fastify"
import { prisma  } from "../lib/prisma.js"
import { authenticate } from "../lib/auth.js"
import { getBossRarity, getCommonRarity } from "../game/rewardHelper.js"
import { generateEquipment } from "../game/equipmentGenerator.js"
import { canLevelUp, getXpForLevelUp } from "../game/playerHelper.js"

export async function battleRoutes(app:FastifyInstance) {
    app.get("/status", { onRequest: authenticate }, async (request, reply) => {
        const { sub } = request.user as { sub: string}

        const user = await prisma.user.findUnique({
            where: { id: sub },
            include: {
                character: true,
                equipments: {
                    where: { isEquipped: true },
                    include: { subStats: true }
                },
            },
        })

        if (!user || !user.character) {
            return reply.status(404).send({ error: "Jogador não encontrado" })
        }

        return {
            username: user.username,
            level: user.character.level,
            xp: user.character.xp,
            equipments: user.equipments
        }
    })

    app.post("/defeat", { onRequest: authenticate }, async (request, reply) => {
        const { sub } = request.user as { sub: string }

        const user = await prisma.user.findUnique({ where: { id: sub } })

        if (!user) {
            return reply.status(404).send({ error: "usuário não encontrado" })
        }

        const penalty = Math.max(1, Math.floor(user.gold * 0.05))
        const newGold = Math.max(0, user.gold - penalty)

        const updated = await prisma.user.update({
            where: { id: sub },
            data: { gold: newGold },
            select: { gold: true }
        })

        return { gold: updated.gold }
    })

    app.post("/victory", { onRequest: authenticate }, async (request, reply) => {
        const { enemyLevel, isBoss }  = request.body as {
            enemyLevel?: number
            isBoss?: boolean
        }

        if (enemyLevel === undefined || isBoss === undefined) {
            return reply.status(400).send({ error: "level ou isBoss não foram passados corretamente" })
        }

        const { sub } = request.user as { sub: string }
        const user = await prisma.user.findUnique({ where: { id: sub }, include: { character: true }})

        if (!user || !user.character) {
            return reply.status(404).send({ error: "usuário não encontrado" })
        }

        let goldEarned = enemyLevel * 15
        let xpEarned = enemyLevel * 25

        if (isBoss) {
            goldEarned *= 2
            xpEarned *= 2
        }

        const hasEquipment = Math.random() < 0.6 || isBoss

        if (hasEquipment) {
            let equipment

            if(isBoss) {
                const rarity = getBossRarity(enemyLevel)
                equipment = generateEquipment(rarity)
            } else {
                const rarity = getCommonRarity(enemyLevel)
                equipment = generateEquipment(rarity)
            }

            await prisma.equipment.create({
                data: {
                    equipmentType: equipment.type,
                    rarity: equipment.rarity,
                    mainStat: equipment.mainStat,
                    mainStatValue: equipment.mainStatValue,
                    rating: equipment.rating,
                    subStats: {
                        create: equipment.subStats
                    },
                    user: {
                        connect: { id: user.id }
                    }
                }
            })
        }

        const newGold = user.gold + goldEarned
        let newXp = user.character.xp + xpEarned
        let newLevel = user.character.level

        while (canLevelUp(newXp, newLevel) && newLevel < 50) {
            const levelUpXp = getXpForLevelUp(newLevel)

            newLevel++
            newXp -= levelUpXp
        }

        const updated = await prisma.user.update({
            where: { id: sub },
            data: {
                gold: newGold,
                character: {
                    update: {
                        xp: newXp,
                        level: newLevel
                    }
                },
            },
            select: { character: { select: { xp: true, level: true } } }
        })

        return { 
            xp: updated.character?.xp,
            level: updated.character?.level
        }
    })
}