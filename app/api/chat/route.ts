import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { nalogId, poruka, kontekstVozila } = await req.json();

    // Beležimo upit u bazu
    await pool.query(
      'INSERT INTO ai_istorija (radni_nalog_id, uloga, sadrzaj) VALUES (?, ?, ?)',
      [nalogId, 'user', poruka]
    );

    const apiKey = process.env.GEMINI_API_KEY;
    
    // REŠENJE: Koristimo v1beta jer je 2.5 model još uvek u preview fazi
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Ti si stručni auto-mehaničar. 
                  Vozilo: ${kontekstVozila}. 
                  Pitanje: ${poruka}.`
          }]
        }]
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(`Google Error: ${data.error.message}`);
    }

    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    // Upisujemo AI odgovor u bazu pod ulogom 'model'
    await pool.query(
      'INSERT INTO ai_istorija (radni_nalog_id, uloga, sadrzaj) VALUES (?, ?, ?)',
      [nalogId, 'model', responseText]
    );

    return NextResponse.json({ text: responseText });

  } catch (error: any) {
    console.error("GREŠKA:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}