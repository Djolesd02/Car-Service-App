import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// UPDATE VOZILA
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const id = params.id;

    // Dinamički gradimo SQL upit na osnovu onoga što pošalješ u Body-ju
    const fields = Object.keys(body).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(body), id];

    if (fields.length === 0) return NextResponse.json({ error: "Nema podataka za update" }, { status: 400 });

    await pool.query(`UPDATE vozila SET ${fields} WHERE id = ?`, values);
    return NextResponse.json({ message: "Vozilo uspešno ažurirano" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE VOZILA
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    // Napomena: Zbog ON DELETE CASCADE u SQL-u, ovo briše i sve njegove radne naloge!
    await pool.query('DELETE FROM vozila WHERE id = ?', [id]);
    return NextResponse.json({ message: "Vozilo i svi njegovi nalozi su obrisani" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
// DODAJ OVO PORED PATCH I DELETE

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // KLJUČNI DEO: Moramo sačekati params da bismo izvukli ID
    const { id } = await params; 

    // 1. Provera vozila
    const [voziloRows]: any = await pool.query(
      'SELECT * FROM vozila WHERE id = ?',
      [id]
    );

    if (!voziloRows || voziloRows.length === 0) {
      return NextResponse.json({ error: "Vozilo nije nađeno u bazi" }, { status: 404 });
    }

    // 2. Provera naloga
    const [naloziRows]: any = await pool.query(
      'SELECT * FROM radni_nalozi WHERE vozilo_id = ? ORDER BY datum_prijema DESC',
      [id]
    );

    return NextResponse.json({
      vozilo: voziloRows[0],
      nalozi: naloziRows || []
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}