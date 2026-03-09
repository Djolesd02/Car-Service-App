import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // Definišemo kao Promise
) {
  try {
    // Moraš uraditi await na params pre pristupa id-u
    const resolvedParams = await params;
    const id = resolvedParams.id;

    // Brisanje konkretne stavke po njenom ID-u iz tabele troskovi_stavke
    await pool.query('DELETE FROM troskovi_stavke WHERE id = ?', [id]);
    
    return NextResponse.json({ message: "Stavka uspešno obrisana" });
  } catch (err: any) {
    console.error("Greška pri brisanju:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}