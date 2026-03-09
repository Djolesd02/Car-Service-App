'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// --- DEFINICIJA TIPOVA (Rešava TS greške) ---
interface Nalog {
  id: number;
  opis_kvara_klijent: string;
  status: string;
  datum_prijema: string;
}

interface Vozilo {
  id: number;
  registracija: string;
  marka: string;
  model: string;
  godiste: string;
  boja: string;
  radio_kod: string;
  sasija_vin: string;
  kod_motora: string;
}

export default function DetaljiVozila() {
  const params = useParams();
  const id = params?.id;

  const [vozilo, setVozilo] = useState<Vozilo | null>(null);
  const [nalozi, setNalozi] = useState<Nalog[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // --- STANJA ZA FORMU ---
  const [noviOpis, setNoviOpis] = useState('');
  const [status, setStatus] = useState('Na čekanju');
  const [datumPrijema, setDatumPrijema] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/vozila/${id}`);
      const data = await res.json();
      if (res.ok) {
        setVozilo(data.vozilo);
        setNalozi(data.nalozi || []);
      }
    } catch (err) {
      console.error("Greška pri učitavanju:", err);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOtvoriNalog = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/nalozi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vozilo_id: id,
          opis_kvara_klijent: noviOpis,
          status: status,
          datum_prijema: datumPrijema // Ako tvoj API podržava custom datum
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setNoviOpis('');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!vozilo) return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center">
      <div className="text-4xl font-[1000] italic text-slate-800 animate-pulse uppercase tracking-tighter">DOSIJE SE UCITAVA...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 uppercase tracking-tight font-sans">
      
      {/* HEADER VOZILA */}
      <div className="w-full bg-[#1E293B] border-b border-slate-800 p-12">
        <div className="max-w-[1600px] mx-auto">
          <Link href="/arhiva" className="text-[10px] font-black text-[#A3E635] tracking-[0.3em] hover:text-white transition-all"> ⇠ NAZAD U ARHIVU</Link>
          
          <div className="mt-8 flex flex-col md:flex-row justify-between items-end gap-8">
            <div>
              <div className="bg-[#A3E635] text-black px-4 py-1 rounded inline-block font-[1000] text-xl mb-4">
                {vozilo.registracija}
              </div>
              <h1 className="text-7xl font-[1000] italic tracking-tighter text-white uppercase leading-none">
                {vozilo.marka} <span className="text-[#A3E635]">{vozilo.model}</span>
              </h1>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-12 gap-y-4 border-l border-slate-700 pl-12">
              <div>
                <p className="text-[9px] font-black text-slate-500 tracking-widest uppercase">VIN</p>
                <p className="text-sm font-bold text-white font-mono">{vozilo.sasija_vin || '---'}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-500 tracking-widest uppercase">MOTOR</p>
                <p className="text-sm font-bold text-white uppercase">{vozilo.kod_motora || '---'}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-500 tracking-widest uppercase">RADIO KOD</p>
                <p className="text-sm font-bold text-[#A3E635]">{vozilo.radio_kod || '---'}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-500 tracking-widest uppercase">PODACI</p>
                <p className="text-sm font-bold text-white">{vozilo.godiste} / {vozilo.boja}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ISTORIJA */}
      <main className="max-w-[1600px] mx-auto p-12">
        <div className="flex justify-between items-center mb-10 border-b border-slate-800 pb-4">
          <h2 className="text-xl font-[1000] italic tracking-tighter uppercase">Istorija Servisa ({nalozi.length})</h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#A3E635] text-black px-12 py-4 rounded-[2rem] font-[1000] text-[11px] tracking-widest hover:bg-white transition-all shadow-xl"
          >
            + OTVORI NOVI RADNI NALOG
          </button>
        </div>
        
        <div className="space-y-4">
          {nalozi.map((n) => (
            <Link href={`/nalog/${n.id}`} key={n.id} className="block">
              <div className="bg-[#1E293B] p-10 rounded-[3rem] border border-slate-800 hover:border-[#A3E635]/50 hover:bg-[#242f42] transition-all flex items-center justify-between group shadow-2xl">
                <div className="flex items-center gap-16">
                  <div className="text-center border-r border-slate-800 pr-16">
                    <p className="text-[10px] font-black text-slate-500 mb-1 tracking-widest">PRIJEM</p>
                    <p className="text-xl font-bold text-white tracking-tighter">
                      {new Date(n.datum_prijema).toLocaleDateString('sr-RS')}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 tracking-widest mb-1 uppercase">Opis kvara</p>
                    <p className="text-2xl font-[1000] italic text-white group-hover:text-[#A3E635] transition-colors uppercase">
                      {n.opis_kvara_klijent}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <span className="text-[10px] font-[1000] py-2 px-8 rounded-full border border-slate-700 text-slate-400 uppercase tracking-widest italic">
                    {n.status}
                  </span>
                  <span className="text-3xl text-slate-800 group-hover:text-white transition-all transform group-hover:translate-x-2">➜</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* NOVI MODAL FORMA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
          <div className="bg-[#1E293B] w-full max-w-[950px] rounded-[4rem] border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            
            {/* HEAD */}
            <div className="bg-[#A3E635] p-10 flex justify-between items-center">
              <div>
                <h2 className="text-black text-4xl font-[1000] italic tracking-tighter uppercase leading-none">Novi Radni Nalog</h2>
                <p className="text-black/50 font-black text-[10px] tracking-widest mt-2 uppercase">Vozilo: {vozilo.registracija} ({vozilo.marka} {vozilo.model})</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="bg-black/10 hover:bg-black/20 w-14 h-14 rounded-full flex items-center justify-center text-black transition-all">✕</button>
            </div>

            <form onSubmit={handleOtvoriNalog} className="p-16">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                
                {/* LEVA STRANA: OPIS */}
                <div className="space-y-6">
                  <div>
                    <label className="text-[11px] font-[1000] text-slate-500 tracking-[0.4em] ml-4 uppercase mb-3 block">Opis kvara (Šta klijent kaže)</label>
                    <textarea 
                      required
                      placeholder="npr. Lupa u prednjem levom točku prilikom skretanja..."
                      className="w-full bg-[#0F172A] border-2 border-transparent focus:border-[#A3E635]/20 rounded-[2.5rem] p-8 text-xl font-bold text-white outline-none h-64 resize-none transition-all uppercase placeholder:text-slate-800"
                      value={noviOpis}
                      onChange={(e) => setNoviOpis(e.target.value)}
                    />
                  </div>
                </div>

                {/* DESNA STRANA: DATUM I STATUS */}
                <div className="space-y-10">
                  <div className="grid grid-cols-1 gap-8">
                    {/* DATUM PRIJEMA */}
                    <div className="group">
                      <label className="text-[11px] font-[1000] text-slate-500 tracking-[0.4em] ml-4 uppercase mb-3 block">Datum Prijema</label>
                      <input 
                        type="date"
                        className="w-full bg-[#0F172A] border-none rounded-[2rem] p-6 text-white font-bold outline-none uppercase cursor-pointer focus:ring-2 focus:ring-[#A3E635]/20"
                        value={datumPrijema}
                        onChange={(e) => setDatumPrijema(e.target.value)}
                      />
                    </div>

                    {/* STATUS DROPDOWN */}
                    <div>
                      <label className="text-[11px] font-[1000] text-slate-500 tracking-[0.4em] ml-4 uppercase mb-3 block">Inicijalni Status</label>
                      <div className="relative">
                        <select 
                          className="w-full bg-[#0F172A] border-none rounded-[2rem] p-6 text-white font-[1000] outline-none uppercase appearance-none cursor-pointer focus:ring-2 focus:ring-[#A3E635]/20"
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                        >
                          <option value="Na čekanju">⌛ Na čekanju</option>
                          <option value="U radu">🔧 U radu</option>
                          <option value="Čeka delove">📦 Čeka delove</option>
                          <option value="Završeno">✅ Završeno</option>
                        </select>
                        <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-[#A3E635] text-xl">▾</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0F172A]/50 p-8 rounded-[2.5rem] border border-slate-800/50">
                    <p className="text-[10px] font-black text-slate-600 tracking-[0.3em] mb-2 uppercase italic">Napomena</p>
                    <p className="text-[11px] font-bold text-slate-400 leading-relaxed uppercase">Nalog će automatski biti dodat na monitor pod sekciju <span className="text-[#A3E635]">{status}</span>.</p>
                  </div>
                </div>
              </div>

              {/* FOOTER AKCIJA */}
              <div className="mt-16 pt-10 border-t border-slate-800 flex items-center justify-end gap-8">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="text-[11px] font-black text-slate-600 tracking-widest hover:text-white transition-all uppercase"
                >
                  Odustani
                </button>
                <button 
                  disabled={isSubmitting}
                  type="submit" 
                  className="bg-[#A3E635] hover:bg-white text-black font-[1000] px-16 py-7 rounded-[2.5rem] text-[14px] tracking-[0.5em] transition-all uppercase shadow-2xl shadow-lime-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'GENERISANJE...' : 'POTVRDI I KREIRAJ NALOG ↵'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}