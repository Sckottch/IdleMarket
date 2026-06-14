import { type FastifyInstance } from "fastify";
import bcrypt from "bcrypt"
import { prisma } from "../lib/prisma.js";

export async function authRoutes(app: FastifyInstance) {
    app.post("/register", async (request, reply) => {
        const { username, password } = request.body as {
            username?: string
            password?: string
        }

        if (!username || !password){
            return reply.status(400).send({ error: "usuário e senha são obrigatórios"})
        }

        const existing = await prisma.user.findUnique({ where: { username }})
        if (existing) {
            return reply.status(409).send({ error: "nome de usuário já está em uso"})
        }

        const passwordHash = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                username: username,
                passwordHash: passwordHash,
                character: { create: {} }
            },
            select: { id: true, username: true }
        })

        return reply.status(201).send(user)
    }) 

    app.post("/login", async (request, reply) => {
        const { username, password } = request.body as {
            username?: string
            password?: string
        }

        if (!username || !password) {
            return reply.status(400).send({ error: "Usuário ou senha não foram preenchidos" })
        }

        const user = await prisma.user.findUnique({ where: {
            username: username
        }})
        
        if (user) {
            const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash)

            if (isPasswordCorrect) {
                const token = app.jwt.sign({ sub: user.id })

                return { token }
            }
        }
        
        return reply.status(401).send({ error: "Usuário ou senha incorretos" })
    })
}