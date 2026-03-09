import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const nalogId = searchParams.get('nalogId');
  try {
    const [rows] = await pool.query('SELECT * FROM ai_istorija WHERE radni_nalog_id = ? ORDER BY vreme ASC', [nalogId]);
    return NextResponse.json(rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { radni_nalog_id, uloga, sadrzaj } = await req.json();
    await pool.query('INSERT INTO ai_istorija (radni_nalog_id, uloga, sadrzaj) VALUES (?, ?, ?)', [radni_nalog_id, uloga, sadrzaj]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}