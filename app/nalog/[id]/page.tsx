'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DetaljiNaloga() {
  const { id } = useParams();
  const router = useRouter();
  const [nalog, setNalog] = useState<any>(null);
  const [chat, setChat] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);
  const [troskovi, setTroskovi] = useState<any[]>([]);
  const [novaStavka, setNovaStavka] = useState({ naziv: '', cena: '' });
  const [napon, setNapon] = useState<number | "">("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const nalogRes = await fetch(`/api/nalozi/${id}`);
        const nalogData = await nalogRes.json();
        setNalog(nalogData);

        const historyRes = await fetch(`/api/chat/history?nalogId=${id}`);
        const historyData = await historyRes.json();
        setChat(historyData);

        const troskoviRes = await fetch(`/api/troskovi?nalogId=${id}`);
        const troskoviData = await troskoviRes.json();
        setTroskovi(troskoviData);
      } catch (err) {
        console.error("Greška pri učitavanju:", err);
      }
    };
    loadData();
  }, [id]);

  // FUNKCIJA ZA PROMENU STATUSA
  const ažurirajStatus = async (noviStatus: string) => {
    try {
      const res = await fetch(`/api/nalozi/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: noviStatus }),
      });

      if (res.ok) {
        if (noviStatus === 'Završeno') {
          alert("RADNI NALOG JE ZAVRŠEN I ARHIVIRAN.");
          router.push('/'); // Vraćamo se na početnu jer je nalog sklonjen iz aktivnih
        } else {
          setNalog({ ...nalog, status: noviStatus });
        }
      }
    } catch (err) {
      console.error("Greška pri promeni statusa:", err);
    }
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoadingChat(true);
    const korisnikovaPoruka = input;
    setInput('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nalogId: id, 
          poruka: korisnikovaPoruka,
          kontekstVozila: `${nalog.marka} ${nalog.model} (${nalog.registracija})`
        }),
      });
      const data = await res.json();
      setChat([...chat, { uloga: 'user', sadrzaj: korisnikovaPoruka }, { uloga: 'model', sadrzaj: data.text }]);
    } catch (err) { console.error(err); } 
    finally { setLoadingChat(false); }
  };

  const snimiTrosak = async () => {
    if (!novaStavka.naziv || !novaStavka.cena) return;
    try {
      const res = await fetch('/api/troskovi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nalogId: id, 
          naziv: novaStavka.naziv.toUpperCase(), 
          cena: parseFloat(novaStavka.cena) 
        })
      });
      if (res.ok) {
        const snimljeno = await res.json();
        setTroskovi([...troskovi, snimljeno]);
        setNovaStavka({ naziv: '', cena: '' });
      }
    } catch (err) { console.error(err); }
  };

  const obrisiStavku = async (stavkaId: number) => {
    if (!confirm("DA LI STE SIGURNI?")) return;
    try {
      const res = await fetch(`/api/troskovi/${stavkaId}`, { method: 'DELETE' });
      if (res.ok) setTroskovi(troskovi.filter(t => t.id !== stavkaId));
    } catch (err) { console.error(err); }
  };

  const proveriAkumulator = () => {
    if (napon === "") return "UNESI NAPON (V)";
    if (napon >= 12.6) return "✅ 100% PUN / ODLIČAN";
    if (napon >= 12.4) return "⚡ 75% - DOBAR";
    if (napon >= 12.2) return "⚠️ 50% - DOPUNITI";
    return "❌ KRITIČNO / ZAMENITI";
  };

  const ukupno = troskovi.reduce((sum, t) => sum + Number(t.cena), 0);
  if (!nalog) return <div className="p-20 text-white italic uppercase font-black animate-pulse text-center">Učitavanje...</div>;

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 uppercase tracking-tight font-sans p-4 md:p-12">
      <div className="max-w-[1400px] mx-auto">
        
        {/* DUGME NAZAD */}
        <Link href="/" className="inline-block mb-8 text-[10px] font-black tracking-widest text-slate-500 hover:text-[#A3E635] transition-colors">
          ← NAZAD NA DASHBOARD
        </Link>

        {/* ZAGLAVLJE SA STATUSIMA */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-8 border-b border-slate-800 pb-12">
          <div>
            <h1 className="text-5xl md:text-7xl font-[1000] italic tracking-tighter text-white mb-2 leading-none">
              {nalog.marka} {nalog.model}
            </h1>
            <p className="text-[#A3E635] font-black tracking-[0.2em] text-xl md:text-2xl">{nalog.registracija}</p>
            
            {/* STATUS SELECTOR */}
            <div className="flex flex-wrap gap-2 mt-6">
              {['Na čekanju', 'U radu', 'Čeka delove'].map((s) => (
                <button
                  key={s}
                  onClick={() => ažurirajStatus(s)}
                  className={`px-4 py-2 rounded-full text-[9px] font-black tracking-widest transition-all ${
                    nalog.status === s ? 'bg-[#A3E635] text-black shadow-lg shadow-lime-500/20' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  {s.toUpperCase()}
                </button>
              ))}
              <button
                onClick={() => ažurirajStatus('Završeno')}
                className="px-6 py-2 rounded-full text-[9px] font-black tracking-widest bg-white text-black hover:bg-red-500 hover:text-white transition-all ml-auto"
              >
                ✓ ZAVRŠI I ARHIVIRAJ
              </button>
            </div>
          </div>

          <div className="w-full md:w-auto flex flex-col gap-4">
             <div className="bg-[#1E293B] p-6 rounded-3xl border border-slate-800 shadow-xl">
                <p className="text-[9px] font-black text-slate-500 mb-1 tracking-widest uppercase">RADIO PIN KOD</p>
                <p className="text-3xl font-[1000] text-[#A3E635] tracking-[0.2em]">{nalog.radio_kod || '----'}</p>
             </div>
             <button onClick={() => window.print()} className="bg-slate-800 text-white w-full py-5 rounded-2xl font-black text-[10px] hover:bg-white hover:text-black transition-all tracking-widest uppercase">
                ŠTAMPAJ RADNI NALOG ⎙
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          {/* LEVA KOLONA (Gemini i Beleške ostaju isti kao u tvom kodu) */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-[2.5rem] md:rounded-[3rem] border border-blue-500/20 shadow-2xl flex flex-col h-[500px] md:h-[700px] overflow-hidden">
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
                <h3 className="text-xs font-[1000] italic tracking-widest text-blue-400 uppercase">GEMINI PRO EXPERT SYSTEM</h3>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {chat.map((m, i) => (
                  <div key={i} className={`p-6 rounded-[2rem] max-w-[90%] ${m.uloga === 'user' ? 'bg-blue-600/20 ml-auto' : 'bg-white/5 mr-auto border border-white/5'}`}>
                    <p className="text-[8px] font-[1000] opacity-30 mb-2 tracking-widest uppercase">{m.uloga === 'user' ? 'UPIT MAJSTORA' : 'AI ODGOVOR'}</p>
                    <p className="text-sm font-bold normal-case leading-relaxed text-slate-100 italic">{m.sadrzaj}</p>
                  </div>
                ))}
              </div>
              <form onSubmit={handleChat} className="p-6 bg-black/30 border-t border-white/5">
                <input 
                  value={input} onChange={(e) => setInput(e.target.value)}
                  placeholder={loadingChat ? "ANALIZIRAM..." : "OPIŠI PROBLEM..."}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 font-black text-xs outline-none focus:ring-2 focus:ring-blue-500/50 transition-all uppercase"
                />
              </form>
            </section>

            <section className="bg-[#1E293B] p-8 rounded-[2.5rem] border border-slate-800">
              <label className="text-[9px] font-black text-slate-500 tracking-[0.4em] mb-6 block uppercase opacity-50">REZULTAT DIJAGNOSTIKE I BELEŠKE</label>
              <textarea 
                className="w-full bg-transparent border-none text-xl font-bold italic text-white focus:ring-0 outline-none h-[120px]"
                placeholder="UPIŠI BELEŠKE..."
                defaultValue={nalog.belezke_majstora}
              ></textarea>
            </section>
          </div>

          {/* DESNA KOLONA (Troškovi i Alati) */}
          <div className="space-y-6">
            <section className="bg-[#1E293B] p-8 rounded-[2.5rem] border border-slate-800">
              <h3 className="text-xs font-black mb-6 text-[#A3E635] tracking-widest uppercase">TROŠKOVI MATERIJALA</h3>
              <div className="space-y-3 mb-6 bg-black/20 p-4 rounded-2xl">
                <input type="text" placeholder="NAZIV DELA..." className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] font-black uppercase outline-none" value={novaStavka.naziv} onChange={(e) => setNovaStavka({...novaStavka, naziv: e.target.value})} />
                <div className="flex gap-2">
                  <input type="number" placeholder="CENA" className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] font-black outline-none" value={novaStavka.cena} onChange={(e) => setNovaStavka({...novaStavka, cena: e.target.value})} />
                  <button onClick={snimiTrosak} className="bg-[#A3E635] text-black px-5 rounded-xl font-[1000] text-[10px] uppercase">DODAJ</button>
                </div>
              </div>
              <div className="space-y-3 max-h-[250px] overflow-y-auto">
                {troskovi.map((t, i) => (
                  <div key={i} className="flex justify-between items-center bg-[#0F172A] p-4 rounded-xl border border-white/5">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-100">{t.naziv}</span>
                      <span className="font-black text-[#A3E635] text-sm">{Number(t.cena).toLocaleString()} RSD</span>
                    </div>
                    <button onClick={() => obrisiStavku(t.id)} className="text-red-500 hover:scale-110 transition-transform">✕</button>
                  </div>
                ))}
              </div>
            </section>

            {/* TESTER AKUMULATORA */}
            <section className="bg-black/40 p-8 rounded-[2.5rem] border border-slate-800">
              <div className="bg-[#1E293B] p-5 rounded-2xl">
                <p className="text-[8px] font-black mb-3 opacity-50 tracking-widest">TESTER AKUMULATORA (V)</p>
                <div className="flex gap-3 items-center">
                  <input type="number" step="0.1" className="w-20 bg-black/40 border border-none rounded-lg p-2 text-center font-[1000] text-[#A3E635]" value={napon} onChange={(e) => setNapon(e.target.value === "" ? "" : parseFloat(e.target.value))} />
                  <p className="flex-1 text-[9px] font-black text-center leading-tight">{proveriAkumulator()}</p>
                </div>
              </div>
            </section>

            {/* TOTAL */}
            <div className="bg-[#A3E635] p-10 rounded-[2.5rem] text-black shadow-xl">
              <p className="text-[9px] font-black opacity-60 uppercase tracking-widest">Ukupno za naplatu</p>
              <p className="text-4xl font-[1000] italic mt-3">{ukupno.toLocaleString()} RSD</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}