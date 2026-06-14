import Fastify from "fastify"
import fastifyJwt from "@fastify/jwt"
import { authRoutes } from "./routes/auth.js"
import { prisma } from "./lib/prisma.js"

const app = Fastify({ logger: true })

app.register(fastifyJwt, { secret: process.env.JWT_SECRET! })
app.register(authRoutes, { prefix: "/auth"})

app.get("/health", async () => {
    return { status: "ok" }
})

app.get("/users/count", async () => {
    const count = await prisma.user.count()
    return { users: count }
})

const start = async () => {
    try {
        await app.listen({ port: 3333 })
        console.log("Servidor rodando em http://localhost:3333")
    } catch (err) {
        app.log.error(err)
        process.exit(1)
    }
}

start()