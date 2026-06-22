import type { FastifyInstance } from "fastify/types/instance.js";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../lib/auth.js";
import { getXpForLevelUp } from "../game/playerHelper.js";
import type { PlayerDataDTO } from "../DTOs/playerDTO.js";

export async function playerRoute(app:FastifyInstance) {
    app.get("/me", { onRequest: authenticate }, async (request, reply) => {
        const { sub } = request.user as { sub: string }

        const user = await prisma.user.findUnique({
            where: { id: sub },
            include: { character: true, equipments: { include: {subStats: true }}}
        })

        if (!user || !user.character) {
            return reply.status(404).send({ error: "Usuário não encontrado" })
        }

        const responseData: PlayerDataDTO = {
            status: {
                username: user.username,
                gold: user.gold,
                level: user.character.level,
                xp: user.character.xp,
                xpForNextLevel: getXpForLevelUp(user.character.level),
            }, 
            inventory: user.equipments.map(e => ({
                id: e.id,
                equipmentType: e.equipmentType,
                rarity: e.rarity,
                mainStat: e.mainStat,
                mainStatValue: e.mainStatValue,
                rating: e.rating,
                isEquipped: e.isEquipped,
                isForSale: e.isForSale,
                salePrice: e.salePrice,
                subStats: e.subStats.map(s => ({
                    id: s.id,
                    statType: s.statType,
                    statValue: s.statValue,
                })),
            })),
        }

        return reply.send(responseData)
    })
}