import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const nalogId = searchParams.get('nalogId');
  
  try {
    const [rows] = await pool.query(
      'SELECT uloga, sadrzaj FROM ai_istorija WHERE radni_nalog_id = ? ORDER BY vreme ASC',
      [nalogId]
    );
    return NextResponse.json(rows);
  } catch (err: any) {
    return NextResponse.json([]);
  }
}