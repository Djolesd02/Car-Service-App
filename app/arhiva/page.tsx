'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Vozilo {
  id: number;
  registracija: string;
  marka: string;
  model: string;
  godiste: string;
  sasija_vin: string;
}

export default function ArhivaVozila() {
  const [vozila, setVozila] = useState<Vozilo[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/vozila')
      .then(res => res.json())
      .then(data => setVozila(Array.isArray(data) ? data : []));
  }, []);

  // Filtriranje po tablici ili marki/modelu
  const filtriranaVozila = vozila.filter(v => 
    v.registracija.toLowerCase().includes(search.toLowerCase()) ||
    `${v.marka} ${v.model}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 uppercase tracking-tight font-sans">
      
      {/* NAV */}
      <nav className="w-full bg-[#1E293B]/80 backdrop-blur-md border-b border-slate-800 px-12 py-8 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-16">
          <Link href="/" className="text-4xl font-[1000] tracking-tighter italic leading-none text-white hover:opacity-80 transition-all">
            ACONI<span className="text-[#A3E635]">.COM</span>
          </Link>
          <div className="flex gap-10">
            <Link href="/" className="text-[11px] font-[900] tracking-[0.2em] text-slate-500 hover:text-white transition-all pb-2">MONITOR</Link>
            <Link href="/arhiva" className="text-[11px] font-[900] tracking-[0.2em] border-b-4 border-[#A3E635] pb-2 text-white">ARHIVA VOZILA</Link>
          </div>
        </div>
      </nav>

      <main className="p-12 max-w-[1400px] mx-auto w-full">
        {/* PRETRAGA */}
        <div className="mb-16 relative">
          <input 
            type="text" 
            placeholder="PRETRAŽI PO TABLICI ILI MODELU..." 
            className="w-full bg-[#1E293B] border-2 border-slate-800 rounded-[2.5rem] py-8 px-12 text-2xl font-[1000] italic tracking-tighter text-white focus:border-[#A3E635] outline-none transition-all placeholder:text-slate-700 shadow-2xl"
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="absolute right-12 top-1/2 -translate-y-1/2 text-4xl opacity-20">🔍</span>
        </div>

        {/* LISTA VOZILA */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtriranaVozila.map((v) => (
            <Link href={`/arhiva/vozilo/${v.id}`} key={v.id}>
              <div className="bg-[#1E293B] p-10 rounded-[3rem] border border-slate-800 hover:border-[#A3E635] transition-all group cursor-pointer shadow-xl active:scale-95">
                <div className="flex justify-between items-start mb-8">
                  <div className="bg-[#0F172A] px-4 py-2 rounded-lg border border-slate-700">
                     <p className="text-xl font-[1000] tracking-widest text-white leading-none">{v.registracija}</p>
                  </div>
                  <span className="text-slate-700 font-black text-xs group-hover:text-[#A3E635] transition-colors">VOZILO #{v.id}</span>
                </div>

                <h3 className="text-3xl font-[1000] italic tracking-tighter text-white leading-tight mb-2">
                  {v.marka} <span className="text-[#A3E635]">{v.model}</span>
                </h3>
                
                <div className="flex flex-col gap-2 mt-6">
                  <p className="text-[10px] font-black text-slate-500 tracking-[0.2em]">GODIŠTE: {v.godiste || 'N/A'}</p>
                  <p className="text-[10px] font-black text-slate-500 tracking-[0.2em]">VIN: {v.sasija_vin || 'NEMA PODATKA'}</p>
                </div>

                <div className="mt-10 flex items-center gap-2 text-[#A3E635] font-black text-[10px] tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-all">
                  PREGLEDAJ ISTORIJU SERVISA ↵
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtriranaVozila.length === 0 && (
          <div className="text-center py-40 opacity-20">
            <h2 className="text-6xl font-[1000] italic tracking-tighter">Nema rezultata</h2>
          </div>
        )}
      </main>
    </div>
  );
}