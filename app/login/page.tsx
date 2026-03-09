'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push('/');
      router.refresh();
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 uppercase">
      <div className="w-full max-w-[400px] space-y-10">
        <div className="text-center">
          <h1 className="text-5xl font-black tracking-tighter text-lime-400">
            ACONI<span className="text-zinc-700">.COM</span>
          </h1>
          <p className="text-zinc-500 tracking-[0.3em] text-[10px] mt-2 font-bold">
            Terminal Access System
          </p>
        </div>

        <div className="bg-zinc-900/30 border border-zinc-800/50 p-8 rounded-[2rem] backdrop-blur-md shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] tracking-widest text-zinc-500 font-bold ml-1">
                Security Code
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/50 border border-zinc-800 rounded-2xl py-4 px-6 text-lime-400 focus:outline-none focus:border-lime-400 transition-all text-xl tracking-[0.4em] text-center"
                placeholder="••••••••"
                required
              />
            </div>
            
            {error && (
              <p className="text-red-500 text-[10px] text-center font-black tracking-widest animate-pulse">
                ACCESS DENIED: INVALID CODE
              </p>
            )}
            
            <button
              type="submit"
              className="w-full bg-lime-400 hover:bg-lime-300 text-black font-black py-4 rounded-2xl transition-all duration-300 text-xs tracking-widest shadow-[0_0_20px_rgba(163,230,53,0.2)]"
            >
              Enter Garage
            </button>
          </form>
        </div>

        <p className="text-zinc-800 text-center text-[9px] tracking-[0.4em] font-bold">
          System v2.0 // Node 24.0 // Secure Connection
        </p>
      </div>
    </div>
  );
}