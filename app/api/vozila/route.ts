import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM vozila ORDER BY created_at DESC');
    return NextResponse.json(rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { registracija, marka, model, godiste, boja, radio_kod, sasija_vin, kod_motora } = await req.json();
    const [res] = await pool.query(
      `INSERT INTO vozila (registracija, marka, model, godiste, boja, radio_kod, sasija_vin, kod_motora) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [registracija, marka, model, godiste, boja, radio_kod, sasija_vin, kod_motora]
    );
    return NextResponse.json({ id: (res as any).insertId, message: "Vozilo uspešno dodato" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}