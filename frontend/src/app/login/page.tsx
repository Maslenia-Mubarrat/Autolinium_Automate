"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Fingerprint, AlertCircle } from "lucide-react"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const res = await fetch("https://autolinium-automate-vgk4.vercel.app/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            })

            const data = await res.json()

            if (res.ok) {
                // Store user info in localStorage
                localStorage.setItem("user", JSON.stringify(data.user))
                router.push("/") // Go to Dashboard
            } else {
                setError(data.error || "Login failed")
            }
        } catch (err) {
            setError("Cannot connect to server")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md border-2 border-primary rounded-none shadow-none">
                <CardHeader className="border-b-2 border-primary bg-slate-100 py-6">
                    <CardTitle className="text-xl font-black uppercase tracking-tighter font-mono flex items-center gap-3">
                        <Fingerprint className="w-6 h-6 text-primary" />
                        System_Gatekeeper
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-mono font-black uppercase text-slate-400">Employee_Email</label>
                            <Input
                                type="email"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="rounded-none border-2 border-slate-200 
                                focus:border-primary 
                                transition-none h-12 font-mono  text-sm"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-mono font-black uppercase text-slate-400">Security_Passcode</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="rounded-none border-2 border-slate-200 focus:border-primary transition-none h-12 font-mono"
                                required
                            />
                        </div>

                        {error && (
                            <div className="bg-destructive/5 border border-destructive/20 p-3 flex items-center gap-3">
                                <AlertCircle className="w-4 h-4 text-destructive" />
                                <span className="text-[10px] font-mono font-bold text-destructive uppercase">{error}</span>
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 rounded-none font-black text-lg uppercase font-mono tracking-tight hover:bg-primary/90"
                        >
                            {loading ? "Decrypting..." : "Access_System"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
