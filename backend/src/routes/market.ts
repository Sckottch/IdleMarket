import type { FastifyInstance } from "fastify/types/instance.js";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../lib/auth.js";
import type { EquipmentDTO } from "../DTOs/playerDTO.js";

export async function marketRoute(app:FastifyInstance) {
    app.get("/list", { onRequest: authenticate }, async (request, reply) => {
        const { sub } = request.user as { sub: string }

        const equipmentsListed = await prisma.equipment.findMany({
            where: { isForSale: true, userId: { not: sub }},
            include: { subStats: true }
        })

        const requestData: EquipmentDTO[] =  equipmentsListed.map(e => ({
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
        }))

        return reply.send(requestData)
    })

    app.post("/buy", { onRequest: authenticate }, async (request, reply) => {
        const { itemId } = request.body as { itemId: string }
        const { sub } = request.user as { sub: string }

        try {
            const result = await prisma.$transaction(async (tx) => {
                const user = await tx.user.findUnique({
                    where: { id: sub }
                })

                if (!user) {
                    throw new Error("USER_NOT_FOUND")
                }

                const equipment = await tx.equipment.findUnique({
                    where: { id: itemId }
                })

                if (!equipment || !equipment.isForSale) {
                    throw new Error("ITEM_NOT_AVAILABLE")
                }

                if (!equipment.salePrice) {
                    throw new Error("PRICE_NOT_DEFINED")
                }

                if (equipment.userId === user.id) {
                    throw new Error("CANNOT_BUY_OWN_ITEM")
                }

                if (user.gold < equipment.salePrice) {
                    throw new Error("INSUFFICIENT_GOLD")
                }

                await tx.user.update({
                    where: { id: user.id },
                    data: {
                        gold: { decrement: equipment.salePrice }
                    }
                })

                await tx.user.update({
                    where: { id: equipment.userId },
                    data: { 
                        gold: { increment: equipment.salePrice }
                    }
                })

                const updatedEquipment = await tx.equipment.update({
                    where: { id: equipment.id },
                    data: {
                        userId: user.id,
                        isForSale: false,
                        salePrice: null,
                        isEquipped: false,
                    }
                })

                return updatedEquipment
            })

            return reply.send()

        } catch (error: any) {
            switch (error.message) {
                case "USER_NOT_FOUND":
                    return reply.status(404).send({ error: "Usuário não encontrado" })
                case "ITEM_NOT_AVAILABLE":
                    return reply.status(400).send({ error: "Equipamento não encontrado ou já vendido" })
                case "PRICE_NOT_DEFINED":
                    return reply.status(400).send({ error: "O equipamento não possui preço definido" })
                case "CANNOT_BUY_OWN_ITEM":
                    return reply.status(403).send({ error: "Não pode comprar um item que já te pertence" })
                case "INSUFFICIENT_GOLD":
                    return reply.status(400).send({ error: "O usuário não possui gold suficiente" })
                default:
                    return reply.status(500).send({ error: "Erro interno no servidor de mercado" })
            }
        }
    })

    app.post("/sell", { onRequest: authenticate }, async (request, reply) => {
        const { itemId, price } = request.body as { itemId: string, price: number }
        const { sub } = request.user as { sub: string }

        if (price <= 0 || isNaN(price)) {
            return reply.status(400).send({ error: "O preço do item não foi definido" })
        }

        const equipment = await prisma.equipment.findUnique({
            where: { id: itemId }
        })

        if (!equipment) {
            return reply.status(400).send({ error: "Equipamento não encontrado" })
        }

        if (equipment.userId !== sub) {
            return reply.status(403).send({ error: "Não possui permissão para alterar esse equipamento" })
        }

        if (equipment.isForSale) {
            return reply.status(400).send({ error: "Equipamento já está a venda" })
        }

        const updatedEquipment = await prisma.equipment.update({
            where: { id: equipment.id },
            data: {
                isForSale: true,
                salePrice: price,
                isEquipped: false
            }
        })

        return reply.send()
    })

    app.post("/unlist", { onRequest: authenticate }, async (request, reply) => {
        const { itemId } = request.body as { itemId: string }
        const { sub } = request.user as { sub: string }

        const equipment = await prisma.equipment.findUnique({ where: { id: itemId }})

        if (!equipment) {
            return reply.status(400).send({ error: "Equipamento não encontrado" })
        }

        if (equipment.userId !== sub) {
            return reply.status(403).send({ error: "Não possui permissão para alterar esse equipamento" })
        }

        if (!equipment.isForSale) {
            return reply.status(400).send({ error: "Equipamento não está a venda" })
        }

        const updatedEquipment = await prisma.equipment.update({
            where: { id: equipment.id },
            data: {
                isForSale: false,
                salePrice: null,
                isEquipped: false
            }
        })

        return reply.send()
    })
}