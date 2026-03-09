import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    const query = `
      SELECT rn.*, v.registracija, v.marka, v.model, v.kod_motora 
      FROM radni_nalozi rn 
      JOIN vozila v ON rn.vozilo_id = v.id 
      WHERE rn.arhiviran = 0
      ORDER BY rn.datum_prijema DESC`;
    const [rows] = await pool.query(query);
    return NextResponse.json(rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { vozilo_id, opis_kvara_klijent } = await req.json();
    const [res] = await pool.query(
      'INSERT INTO radni_nalozi (vozilo_id, opis_kvara_klijent) VALUES (?, ?)',
      [vozilo_id, opis_kvara_klijent]
    );
    return NextResponse.json({ id: (res as any).insertId, message: "Nalog otvoren" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}