// CRON DIARIO — "tu racha está en riesgo". Vercel lo llama solo (vercel.json,
// 23:00 UTC ≈ tarde/noche en México, Colombia, Chile y Argentina — una sola
// hora no cae perfecto para las cuatro zonas a la vez, es la mejor
// aproximación de una primera versión).
//
// Reusa calcularRacha() de lib/racha.ts — el MISMO cálculo que ya usa /hoy,
// nunca una copia que se pueda desincronizar. Solo avisa a quien: tiene
// acceso activo, ya tiene al menos una suscripción push, y su racha está en
// riesgo (hizo su ritual ayer, no hoy) con 2+ días — no tiene sentido avisar
// de una racha de 1 día, que todavía no significa nada (mismo criterio que
// ya usa /hoy para mostrarla).

import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';
import { calcularRacha, fechaLocal } from '@/lib/racha';
import { enviarPush } from '@/lib/push';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const secreto = process.env.CRON_SECRET;
  if (secreto && req.headers.get('authorization') !== `Bearer ${secreto}`) {
    return NextResponse.json({ error: 'no autorizado' }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const claveMaestra = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !claveMaestra) {
    return NextResponse.json({ error: 'falta configuración del servidor' }, { status: 500 });
  }

  const admin = createClient<Database>(url, claveMaestra, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: suscripciones } = await admin.from('push_subscriptions').select('user_id');
  const idsConPush = [...new Set((suscripciones ?? []).map((s) => s.user_id).filter((id): id is string => !!id))];
  if (idsConPush.length === 0) return NextResponse.json({ evaluados: 0, avisados: 0 });

  const { data: perfilesActivos } = await admin
    .from('perfiles')
    .select('id')
    .eq('activo', true)
    .in('id', idsConPush);
  const idsActivos = (perfilesActivos ?? []).map((p) => p.id);
  if (idsActivos.length === 0) return NextResponse.json({ evaluados: 0, avisados: 0 });

  const { data: sesiones } = await admin
    .from('sesiones_rutina')
    .select('user_id, created_at')
    .in('user_id', idsActivos);

  const fechasPorUsuario = new Map<string, string[]>();
  for (const s of sesiones ?? []) {
    const lista = fechasPorUsuario.get(s.user_id) ?? [];
    lista.push(fechaLocal(new Date(s.created_at)));
    fechasPorUsuario.set(s.user_id, lista);
  }

  const idsPorDiasDeRacha = new Map<number, string[]>();
  for (const id of idsActivos) {
    const racha = calcularRacha(fechasPorUsuario.get(id) ?? []);
    if (racha.enRiesgo && racha.actual >= 2) {
      const lista = idsPorDiasDeRacha.get(racha.actual) ?? [];
      lista.push(id);
      idsPorDiasDeRacha.set(racha.actual, lista);
    }
  }

  // Un envío por cada número de días distinto — así el título dice el número real de
  // cada quien ("racha de 5 días"), no un genérico que no coincida con lo que ve en /hoy.
  let avisados = 0;
  for (const [dias, ids] of idsPorDiasDeRacha) {
    await enviarPush({
      title: `Tu racha de ${dias} días está en riesgo`,
      body: 'Faltan minutos para que se acabe el día. Un ritual corto la mantiene viva.',
      url: '/hoy',
      user_ids: ids,
    });
    avisados += ids.length;
  }

  return NextResponse.json({ evaluados: idsActivos.length, avisados });
}
