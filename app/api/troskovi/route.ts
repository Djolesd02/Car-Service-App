import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const nalogId = searchParams.get('nalogId');
  try {
    const [rows] = await pool.query('SELECT * FROM troskovi_stavke WHERE radni_nalog_id = ?', [nalogId]);
    return NextResponse.json(rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // Izvlačimo nalogId (kako ga frontend šalje)
    const { nalogId, naziv, cena } = await req.json();
    
    // Default vrednosti za tip i kolicinu ako ih ne šalješ
    const tip = 'MATERIJAL';
    const kolicina = 1;

    const [res] = await pool.query(
      'INSERT INTO troskovi_stavke (radni_nalog_id, naziv, tip, cena, kolicina) VALUES (?, ?, ?, ?, ?)',
      [nalogId, naziv, tip, cena, kolicina]
    );
    
    return NextResponse.json({ 
      id: (res as any).insertId, 
      radni_nalog_id: nalogId, 
      naziv, 
      cena 
    });
  } catch (err: any) {
    console.error("DATABASE ERROR:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}