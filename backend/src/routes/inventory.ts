import type { FastifyInstance } from "fastify/types/instance.js";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../lib/auth.js";

export async function inventoryRoute(app: FastifyInstance) {
    app.post("/equip", { onRequest: authenticate }, async (request, reply) => {
        const { equipmentId } = request.body as {
            equipmentId: string
        }

        const { sub } = request.user as { sub: string }
        const user = await prisma.user.findUnique({ where: { id: sub }})

        if(!user) {
            return reply.status(404).send({ error: "Jogador não encontrado" })
        }

        const equipment = await prisma.equipment.findFirst({
             where: { userId: user.id, id: equipmentId }
        })

        if (!equipment){
            return reply.status(400).send({ error: "nenhum equipamento encontrado com esse id" })
        }

        const equipped = await prisma.equipment.findFirst({
            where: { 
                userId: equipment.userId, 
                equipmentType: equipment.equipmentType,
                isEquipped: true
            }
        })

        if (equipped) {
            await prisma.equipment.update({
                where: {
                    id: equipped.id
                },
                data: { isEquipped: false }
            })
        }

        await prisma.equipment.update({
            where: { id: equipment.id },
            data: {
                isEquipped: true
            }
        })

        const updatedEquippeds = await prisma.equipment.findMany({
             where: { 
                userId: user.id,
                isEquipped: true 
            }, 
            include: { subStats: true }
        })

        return updatedEquippeds
    })

    app.post("/unequip", { onRequest: authenticate }, async (request, reply) => {
        const { equipmentId } = request.body as {
            equipmentId: string
        }

        const { sub } = request.user as { sub: string }
        const user = await prisma.user.findUnique({ where: { id: sub }})

        if(!user) {
            return reply.status(404).send({ error: "Jogador não encontrado" })
        }

        const equipment = await prisma.equipment.findFirst({ 
            where: { userId: user.id, id: equipmentId }
        })

        if (!equipment){
            return reply.status(400).send({ error: "nenhum equipamento encontrado com esse id" })
        }

        await prisma.equipment.update({
            where: { id: equipment.id },
            data: { isEquipped: false }
        })

        const updatedEquippeds = await prisma.equipment.findMany({
            where: { 
                userId: user.id,
                isEquipped: true
            },
            include: { subStats: true }
        })

        return updatedEquippeds
    })
}