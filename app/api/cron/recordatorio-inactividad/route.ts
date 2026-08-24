// CRON DIARIO — recordatorio para quien lleva varios días SIN hacer ningún
// ritual (distinto de "racha en riesgo", que es para quien sigue activa y
// por poco no llega hoy). Este es para quien ya se fue del todo.
//
// Reglas (pedido de la dueña, 2026-08-24):
//   - 5+ días sin ningún ritual completado.
//   - No se repite antes de 14 días por persona — se lleva registro propio en
//     `avisos_inactividad` (el cron de racha no lo necesitaba: su condición
//     es naturalmente diaria y estrecha; este sí puede seguir siendo cierto
//     día tras día, así que sin este registro insistiría cada 24h).
//   - Solo push por ahora (correo queda para más adelante, es un canal aparte).
//   - Personalizado con su último ritual real cuando existe; si nunca hizo
//     ninguno, mensaje genérico — nunca se inventa un dato que no hay.

import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';
import { enviarPush } from '@/lib/push';

export const runtime = 'nodejs';

const DIAS_DE_INACTIVIDAD = 5;
const DIAS_ENTRE_AVISOS = 14;
const MS_DIA = 86_400_000;

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
    .select('id, created_at, dolor')
    .eq('activo', true)
    .in('id', idsConPush);
  if (!perfilesActivos || perfilesActivos.length === 0) return NextResponse.json({ evaluados: 0, avisados: 0 });

  const idsActivos = perfilesActivos.map((p) => p.id);

  const { data: sesiones } = await admin
    .from('sesiones_rutina')
    .select('user_id, nombre_rutina, created_at')
    .in('user_id', idsActivos)
    .order('created_at', { ascending: false });

  // Solo la MÁS RECIENTE por usuario (la lista ya viene ordenada de más nueva a más vieja).
  const ultimaSesionPorUsuario = new Map<string, { nombre_rutina: string; created_at: string }>();
  for (const s of sesiones ?? []) {
    if (!ultimaSesionPorUsuario.has(s.user_id)) ultimaSesionPorUsuario.set(s.user_id, s);
  }

  const { data: avisosPrevios } = await admin
    .from('avisos_inactividad')
    .select('user_id, enviado_at')
    .in('user_id', idsActivos);
  const ultimoAvisoPorUsuario = new Map((avisosPrevios ?? []).map((a) => [a.user_id, a.enviado_at]));

  const hoy = new Date();
  let avisados = 0;

  for (const perfil of perfilesActivos) {
    const ultima = ultimaSesionPorUsuario.get(perfil.id);
    const referencia = ultima ? new Date(ultima.created_at) : new Date(perfil.created_at);
    const diasInactiva = Math.floor((hoy.getTime() - referencia.getTime()) / MS_DIA);
    if (diasInactiva < DIAS_DE_INACTIVIDAD) continue;

    const ultimoAviso = ultimoAvisoPorUsuario.get(perfil.id);
    if (ultimoAviso) {
      const diasDesdeAviso = Math.floor((hoy.getTime() - new Date(ultimoAviso).getTime()) / MS_DIA);
      if (diasDesdeAviso < DIAS_ENTRE_AVISOS) continue;
    }

    const body = ultima
      ? `Tu último ritual («${ultima.nombre_rutina}») fue hace ${diasInactiva} días. Cinco minutos también cuentan hoy.`
      : 'Tu espacio en NUA sigue aquí. Cuando quieras, retómalo con algo corto.';

    await enviarPush({
      title: 'Te extrañamos por aquí',
      body,
      url: '/hoy',
      user_ids: [perfil.id],
    });
    await admin.from('avisos_inactividad').upsert({ user_id: perfil.id, enviado_at: new Date().toISOString() });
    avisados += 1;
  }

  return NextResponse.json({ evaluados: idsActivos.length, avisados });
}
