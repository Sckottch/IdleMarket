import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router"
import { login } from "../data/authService"

function Login() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        setError(null)
        try {
            await login(username, password)
            navigate("/game")
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao entrar")
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-tr from-slate-950 to-fuchsia-950 px-4">
            <form   
                onSubmit={handleSubmit}
                className="w-full max-w-md bg-slate-800/60 border border-slate-700 rounded-2xl p-8 shadow-xl backdrop-blur"
            >
                <h1 className="text-3xl font-bold text-fuchsia-800 text-center mb-1">
                    IdleMarket
                </h1>

                <p className="text-slate-400 text-center text-lg mb-8">
                    Entre pra continuar sua jornada
                </p>

                <div className="space-y-4">
                    <input 
                        type="text"
                        placeholder="Usuário" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-fuchsia-400 focus:ring-1 focus:ring-fuchsia-400" 
                    />

                    <input
                        type="password"
                        placeholder="Senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-fuchsia-400 focus:ring-1 focus:ring-fuchsia-400" 
                    />

                    <button 
                        type="submit"
                        className="w-full rounded-lg bg-fuchsia-800 hover:bg-fuchsia-700 text-slate-100 font-semibold py-2.5 transition-colors"
                    >
                        Entrar
                    </button>

                    {error && (
                        <p className="text-red-400 text-center text-sm">{error}</p>
                    )}

                    <p className="text-slate-400 text-center text-sm mt-6">
                        Não tem conta? {" "}
                        <Link to="/register" className="text-fuchsia-400 hover:underline">
                            Criar conta
                        </Link>
                    </p> 
                </div> 
            </form>
        </div>
    )      
}

export default Login