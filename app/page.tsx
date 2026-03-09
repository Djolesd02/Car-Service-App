'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nalozi, setNalozi] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [novoVozilo, setNovoVozilo] = useState({
    registracija: '', marka: '', model: '', godiste: '',
    boja: '', radio_kod: '', sasija_vin: '', kod_motora: ''
  });

  const fetchNalozi = async () => {
    try {
      const res = await fetch('/api/nalozi');
      const data = await res.json();
      // Filtriramo samo one koji nisu arhivirani
      const aktivniNalozi = data.filter((n: any) => n.arhiviran === 0);
      setNalozi(aktivniNalozi);
    } catch (error) {
      console.error("Greška pri učitavanju:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNalozi();
  }, []);

  const handleDodajVozilo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/vozila', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoVozilo),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setNovoVozilo({
          registracija: '', marka: '', model: '', godiste: '',
          boja: '', radio_kod: '', sasija_vin: '', kod_motora: ''
        });
        alert("VOZILO USPEŠNO DODATO U BAZU!");
        fetchNalozi();
      } else {
        const err = await res.json();
        alert("GREŠKA: " + err.error);
      }
    } catch (error) {
      console.error("Slanje propalo:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col uppercase tracking-tight font-sans text-white">
      
      {/* NAVIGACIJA */}
      <nav className="w-full bg-[#1E293B]/80 backdrop-blur-md border-b border-slate-800 px-12 py-8 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-4xl font-[1000] tracking-tighter italic text-white">
          ACONI<span className="text-[#A3E635]">.COM</span>
        </h1>
        <div className="flex gap-6">
          <Link href="/arhiva" className="bg-slate-800 hover:bg-slate-700 px-8 py-4 rounded-2xl font-black text-[10px] tracking-widest transition-all">
            PROVERI ARHIVU
          </Link>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#A3E635] text-black px-10 py-4 rounded-[2rem] font-[1000] text-[11px] tracking-[0.2em] hover:bg-white transition-all shadow-xl shadow-lime-500/10"
          >
            + DODAJ NOVO VOZILO
          </button>
        </div>
      </nav>

      {/* DINAMIČKI DASHBOARD */}
      <main className="flex-1 p-12 overflow-y-auto">
        {loading ? (
          <div className="h-full flex items-center justify-center opacity-20 italic">
            <p className="text-4xl font-black tracking-[0.5em]">Učitavanje sistema...</p>
          </div>
        ) : nalozi.length === 0 ? (
          <div className="h-full flex items-center justify-center opacity-20 italic">
            <p className="text-4xl font-black tracking-[0.5em]">Sistem spreman za rad</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {nalozi.map((nalog: any) => (
              /* CEO BLOK JE SADA LINK */
              <Link 
                key={nalog.id} 
                href={`/nalog/${nalog.id}`}
                className="group bg-[#1E293B] border border-slate-800 p-8 rounded-[3rem] shadow-xl hover:border-[#A3E635] hover:scale-[1.02] transition-all cursor-pointer block relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-6">
                  <span className="bg-[#A3E635] text-black text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest">
                    {nalog.status}
                  </span>
                  <p className="text-slate-500 font-mono text-xs italic">
                    {new Date(nalog.datum_prijema).toLocaleDateString('sr-RS')}
                  </p>
                </div>
                
                <h3 className="text-3xl font-[1000] italic tracking-tighter mb-1 group-hover:text-[#A3E635] transition-colors">
                  {nalog.marka} {nalog.model}
                </h3>
                <p className="text-[#A3E635] font-mono text-sm mb-6 font-bold tracking-widest">
                  {nalog.registracija}
                </p>
                
                <div className="bg-[#0F172A] p-6 rounded-2xl border border-slate-800/50 group-hover:border-[#A3E635]/20 transition-all">
                   <p className="text-[10px] text-slate-500 font-black mb-2 tracking-widest uppercase">Opis kvara (Klijent):</p>
                   <p className="text-sm text-slate-300 leading-relaxed italic font-medium">
                     "{nalog.opis_kvara_klijent || 'Nema unetog opisa'}"
                   </p>
                </div>
                
                {/* DODATNI INFO NA DNU KARTICE */}
                <div className="mt-6 flex justify-between items-center opacity-30 group-hover:opacity-100 transition-opacity">
                   <span className="text-[9px] font-[1000] tracking-[0.3em] text-slate-400 group-hover:text-white transition-colors">
                      OTVORI NALOG →
                   </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* MODAL ZA DODAVANJE VOZILA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6">
          <div className="bg-[#1E293B] w-full max-w-[800px] rounded-[4rem] p-16 shadow-2xl border border-slate-800 animate-in fade-in zoom-in duration-300 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-4xl font-[1000] italic tracking-tighter text-white uppercase">Novi unos vozila</h2>
                <p className="text-[#A3E635] font-black text-[10px] tracking-widest mt-2">Popuni tehničke specifikacije</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="bg-[#0F172A] w-14 h-14 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-all font-bold">✕</button>
            </div>

            <form onSubmit={handleDodajVozilo} className="grid grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 tracking-[0.2em] ml-4 uppercase">Registracija (Tablice)</label>
                  <input required type="text" placeholder="BG 123-AA" 
                    className="w-full bg-[#0F172A] border-none rounded-3xl py-5 px-8 text-xl font-black uppercase text-white focus:ring-4 focus:ring-[#A3E635]/20 outline-none placeholder:text-slate-800"
                    value={novoVozilo.registracija} onChange={(e) => setNovoVozilo({...novoVozilo, registracija: e.target.value})} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 tracking-[0.2em] ml-4 uppercase">Marka</label>
                    <input required type="text" placeholder="VW" 
                      className="w-full bg-[#0F172A] border-none rounded-2xl py-4 px-6 font-bold text-white focus:ring-2 focus:ring-[#A3E635]/20 outline-none"
                      value={novoVozilo.marka} onChange={(e) => setNovoVozilo({...novoVozilo, marka: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 tracking-[0.2em] ml-4 uppercase">Model</label>
                    <input required type="text" placeholder="GOLF 7" 
                      className="w-full bg-[#0F172A] border-none rounded-2xl py-4 px-6 font-bold text-white focus:ring-2 focus:ring-[#A3E635]/20 outline-none"
                      value={novoVozilo.model} onChange={(e) => setNovoVozilo({...novoVozilo, model: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 tracking-[0.2em] ml-4 uppercase">Broj šasije (VIN)</label>
                  <input type="text" placeholder="WVWZZZ..." 
                    className="w-full bg-[#0F172A] border-none rounded-2xl py-4 px-6 font-mono text-sm text-white focus:ring-2 focus:ring-[#A3E635]/20 outline-none uppercase"
                    value={novoVozilo.sasija_vin} onChange={(e) => setNovoVozilo({...novoVozilo, sasija_vin: e.target.value})} />
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 tracking-[0.2em] ml-4 uppercase">Godište</label>
                    <input type="text" placeholder="2018" 
                      className="w-full bg-[#0F172A] border-none rounded-2xl py-4 px-6 font-bold text-white focus:ring-2 focus:ring-[#A3E635]/20 outline-none"
                      value={novoVozilo.godiste} onChange={(e) => setNovoVozilo({...novoVozilo, godiste: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 tracking-[0.2em] ml-4 uppercase">Boja</label>
                    <input type="text" placeholder="SIVA" 
                      className="w-full bg-[#0F172A] border-none rounded-2xl py-4 px-6 font-bold text-white focus:ring-2 focus:ring-[#A3E635]/20 outline-none"
                      value={novoVozilo.boja} onChange={(e) => setNovoVozilo({...novoVozilo, boja: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 tracking-[0.2em] ml-4 uppercase">Kod motora</label>
                  <input type="text" placeholder="CFFB" 
                    className="w-full bg-[#0F172A] border-none rounded-2xl py-4 px-6 font-bold text-white focus:ring-2 focus:ring-[#A3E635]/20 outline-none uppercase"
                    value={novoVozilo.kod_motora} onChange={(e) => setNovoVozilo({...novoVozilo, kod_motora: e.target.value})} />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 tracking-[0.2em] ml-4 uppercase">Radio kod</label>
                  <input type="text" placeholder="1234" 
                    className="w-full bg-[#0F172A] border-none rounded-2xl py-4 px-6 font-black text-[#A3E635] focus:ring-2 focus:ring-[#A3E635]/20 outline-none"
                    value={novoVozilo.radio_kod} onChange={(e) => setNovoVozilo({...novoVozilo, radio_kod: e.target.value})} />
                </div>
              </div>

              <div className="col-span-2 pt-6">
                <button 
                  disabled={isSubmitting}
                  type="submit" 
                  className="w-full bg-[#A3E635] hover:bg-white text-black font-[1000] py-8 rounded-[2.5rem] text-[15px] tracking-[0.4em] transition-all uppercase shadow-2xl shadow-lime-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? "Upisivanje..." : "Potvrdi i dodaj vozilo ↵"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}