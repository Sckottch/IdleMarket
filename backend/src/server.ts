import Fastify from "fastify"
import fastifyJwt from "@fastify/jwt"
import { authRoutes } from "./routes/auth.js"
import { battleRoutes } from "./routes/battle.js"
import { inventoryRoute } from "./routes/inventory.js"
import { playerRoute } from "./routes/player.js"
import { marketRoute } from "./routes/market.js"

const app = Fastify({ logger: true })

app.register(fastifyJwt, { secret: process.env.JWT_SECRET! })

app.register(authRoutes, { prefix: "/api/auth"})
app.register(battleRoutes, { prefix: "/api/battle"})
app.register(inventoryRoute, { prefix: "/api/inventory"})
app.register(playerRoute, { prefix: "/api/player" })
app.register(marketRoute, { prefix: "/api/market"})

app.get("/health", async () => {
    return { status: "ok" }
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