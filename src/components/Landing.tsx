'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Anchor, Wind, Compass, Navigation } from 'lucide-react';

export default function Landing() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (res.ok) {
                // Force server components refresh to show the app
                router.refresh();
            } else {
                const data = await res.json();
                setError(data.error || 'Erreur de connexion');
            }
        } catch (err) {
            setError("Impossible de contacter le serveur d'authentification.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col md:flex-row font-sans">
            {/* Côté présentation (Gauche) */}
            <div className="flex-1 flex flex-col justify-center p-8 md:p-16 lg:p-24 bg-gradient-to-br from-blue-900/40 via-slate-950 to-slate-950 relative overflow-hidden">

                {/* Cercles de fond "nautiques" pour l'ambiance */}
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />

                <div className="relative z-10 max-w-xl">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
                            <Anchor className="text-white w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-white">Regatta</h1>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300 mb-6 leading-tight">
                        L'intelligence artificielle au service de votre stratégie de course.
                    </h2>

                    <p className="text-lg text-slate-400 mb-10 leading-relaxed">
                        Obtenez des briefings tactiques instantanés croisant les données Météo-France,
                        les marées et la topographie de votre zone de navigation.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Feature icon={<Wind className="text-blue-400" />} title="Modèles météo HR" desc="Vent et rafales (AROME Météo-France)" />
                        <Feature icon={<Compass className="text-indigo-400" />} title="Analyse de zone" desc="Analyse topographique intelligente" />
                        <Feature icon={<Navigation className="text-teal-400" />} title="IA Tactique" desc="Recommandations d'options tactiques" />
                    </div>
                </div>
            </div>

            {/* Côté connexion (Droite) */}
            <div className="w-full md:w-[450px] lg:w-[500px] bg-slate-900/50 backdrop-blur-xl border-l border-slate-800 flex flex-col justify-center p-8 lg:p-12 relative z-20 shadow-2xl">
                <div className="w-full max-w-sm mx-auto">
                    <div className="mb-10 text-center">
                        <h3 className="text-2xl font-bold text-white mb-2">Accès équipage</h3>
                        <p className="text-sm text-slate-400">Veuillez vous authentifier pour générer vos briefings.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Identifiant</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition shadow-inner"
                                placeholder="Ex: tanguy"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Mot de passe</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition shadow-inner"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {error && (
                            <div className="p-3.5 rounded-xl bg-red-900/20 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-red-500" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full relative group overflow-hidden bg-blue-600 hover:bg-blue-500 active:scale-[0.98] transition-all rounded-xl py-3.5 px-4 font-semibold text-white shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] disabled:opacity-70 disabled:pointer-events-none mt-4"
                        >
                            <span className={`flex items-center justify-center gap-2 transition-opacity ${loading ? 'opacity-0' : 'opacity-100'}`}>
                                Entrer sur le pont
                                <Navigation className="w-4 h-4" />
                            </span>
                            {loading && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                </div>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 text-center border-t border-slate-800/50 pt-8">
                        <p className="text-xs text-slate-500">
                            Accès restreint aux utilisateurs autorisés.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-900/40 border border-slate-800/50 hover:bg-slate-900/60 hover:border-slate-700/50 transition">
            <div className="shrink-0 p-2 rounded-lg bg-slate-800/80 shadow-inner">
                {icon}
            </div>
            <div>
                <h4 className="font-semibold text-white text-sm mb-1">{title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}
