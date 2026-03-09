import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // REŠENJE: Prvo await-ujemo params da bismo izvukli ID
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const query = `
      SELECT rn.*, v.registracija, v.marka, v.model, v.boja, v.radio_kod, v.sasija_vin, v.kod_motora 
      FROM radni_nalozi rn 
      JOIN vozila v ON rn.vozilo_id = v.id 
      WHERE rn.id = ?`;
    
    const [rows]: any = await pool.query(query, [id]);
    
    if (rows.length === 0) return NextResponse.json({ error: "Nije nađen" }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request, 
  { params }: { params: Promise<{ id: string }> } // Dodali smo Promise ovde
) {
  try {
    // 1. OTPAKUJEMO PARAMS SA AWAIT
    const { id } = await params; 
    
    // 2. OTPAKUJEMO BODY IZ REQ
    const { status } = await req.json();

    if (status === 'Završeno') {
      await pool.query(
        `UPDATE radni_nalozi 
         SET status = ?, arhiviran = 1, datum_zavrsetka = NOW() 
         WHERE id = ?`,
        [status, id]
      );
    } else {
      await pool.query(
        `UPDATE radni_nalozi 
         SET status = ?, arhiviran = 0, datum_zavrsetka = NULL 
         WHERE id = ?`,
        [status, id]
      );
    }

    return NextResponse.json({ message: "Status ažuriran" });
  } catch (err: any) {
    console.error("Greška na serveru:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}