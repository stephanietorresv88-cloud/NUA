// WEBHOOK DE HOTMART — 18-VENTA-HOTMART.md.
//
// Lo que hace: cuando alguien compra NUA (o le devuelven el dinero, o hay un
// contracargo), Hotmart manda un POST aquí. Este endpoint verifica que de verdad
// viene de Hotmart, y crea o desactiva el acceso a la app según corresponda.
//
// MODELO DE ACCESO DE NUA (decisión técnica, documentada en ESTADO.md): "tener
// cuenta" = "tener acceso" — no hay un estado intermedio de prueba/pago pendiente
// todavía. Por eso el mapeo de eventos es deliberadamente simple:
//   PURCHASE_APPROVED / PURCHASE_COMPLETE  → conceder acceso (crear cuenta o
//                                            reactivarla si ya existía)
//   PURCHASE_REFUNDED / PURCHASE_CHARGEBACK → cerrar el acceso YA (perfiles.activo
//                                             = false) — coincide con lo que
//                                             promete /reembolsos: el acceso se
//                                             cierra, pero el historial se
//                                             conserva (nunca se borra la cuenta).
//   SUBSCRIPTION_CANCELLATION              → SOLO se registra, no cierra el
//                                            acceso todavía. Cancelar no es lo
//                                            mismo que reembolsar: quien cancela
//                                            sigue teniendo derecho a usar NUA
//                                            hasta el final de lo que ya pagó
//                                            (lo dice /reembolsos), y calcular
//                                            esa fecha bien necesita antes ver un
//                                            payload REAL de Hotmart (18, nota del
//                                            "PLACEHOLDER" de trial) — no se
//                                            adivina para no cortarle el acceso a
//                                            alguien antes de tiempo.
//   Cualquier otro evento                  → se registra, no se actúa.
//
// ⚠️ Lo que este endpoint NO hace todavía (alcance deliberado, no descuido):
// distinguir trial de primer cobro real, dunning de pagos atrasados, y el
// gate de `perfiles.activo` en el login/las pantallas — hoy la columna existe y
// el webhook la actualiza, pero nada en la app la lee para bloquear el acceso.
// Documentado como pendiente en ESTADO.md, no oculto.

import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verificarHotmart, esReciente } from '@/lib/hotmart-verify';
import type { Database } from '@/lib/supabase/types';
import crypto from 'node:crypto';

export const runtime = 'nodejs'; // necesita el body crudo + node:crypto, no Edge

const CORREO_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EVENTOS_CONCEDER = new Set(['PURCHASE_APPROVED', 'PURCHASE_COMPLETE']);
const EVENTOS_REVOCAR = new Set(['PURCHASE_REFUNDED', 'PURCHASE_CHARGEBACK']);
// Se registran pero no cambian el acceso — ver el porqué en el comentario de arriba.
const EVENTOS_SOLO_REGISTRO = new Set(['SUBSCRIPTION_CANCELLATION']);

function clienteAdmin() {
  const claveMaestra = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!claveMaestra || !url) return null;
  return createClient<Database>(url, claveMaestra, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function registrarLog(
  admin: ReturnType<typeof clienteAdmin>,
  fila: { event_id: string | null; type: string | null; result: 'applied' | 'duplicate' | 'ignored' | 'unauthorized' | 'error'; detail?: string },
) {
  try {
    await admin?.from('webhook_log').insert(fila);
  } catch {
    // Si ni el log funciona, no hay nada más que hacer desde aquí — no debe
    // tumbar la respuesta al webhook por esto.
  }
}

export async function POST(req: NextRequest) {
  const admin = clienteAdmin();

  // 1. Cuerpo CRUDO — se parsea recién después de intentar verificar, para no
  //    gastar trabajo en un payload que ni siquiera viene autenticado.
  const rawBody = await req.text();

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'bad request' }, { status: 400 });
  }

  // 2. Autenticidad — Hotmart manda el hottok en el header O dentro del cuerpo,
  //    según la cuenta/versión; se aceptan los dos caminos.
  const hottokHeader = req.headers.get('x-hotmart-hottok');
  const hottokBody = typeof payload.hottok === 'string' ? payload.hottok : undefined;
  const hottokRecibido = hottokHeader ?? hottokBody;

  if (!verificarHotmart(hottokRecibido)) {
    const eventoNoConfiable = typeof payload.event === 'string' ? payload.event : null;
    await registrarLog(admin, { event_id: null, type: eventoNoConfiable, result: 'unauthorized' });
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  if (!admin) {
    // No debería pasar nunca en producción (P4 lo exige configurado), pero si
    // falta la clave maestra no hay forma segura de continuar.
    await registrarLog(admin, { event_id: null, type: null, result: 'error', detail: 'falta configuración del servidor' });
    return NextResponse.json({ error: 'server not configured' }, { status: 500 });
  }

  // 3. Frescura — anti-replay. Hotmart manda la fecha de la compra/adhesión.
  const data = (payload.data ?? {}) as Record<string, unknown>;
  const purchase = (data.purchase ?? {}) as Record<string, unknown>;
  const marcaDeTiempo =
    typeof payload.creation_date === 'number'
      ? payload.creation_date
      : typeof purchase.approved_date === 'number'
        ? purchase.approved_date
        : undefined;
  if (!esReciente(marcaDeTiempo)) {
    await registrarLog(admin, { event_id: null, type: String(payload.event ?? ''), result: 'error', detail: 'evento viejo (posible replay)' });
    return NextResponse.json({ error: 'stale' }, { status: 400 });
  }

  // 4. Identificar el evento y el correo del comprador.
  const evento = typeof payload.event === 'string' ? payload.event : '';
  const buyer = (data.buyer ?? {}) as Record<string, unknown>;
  const correoCrudo = typeof buyer.email === 'string' ? buyer.email : typeof payload.email === 'string' ? payload.email : '';
  const correo = correoCrudo.trim().toLowerCase();

  const eventId: string =
    (typeof payload.id === 'string' && payload.id) ||
    (typeof purchase.transaction === 'string' && purchase.transaction) ||
    // Compuesto determinista de respaldo — NUNCA Date.now(), eso rompería el dedupe.
    `${evento}:${correo}:${marcaDeTiempo ?? ''}`;

  // 5. Idempotencia — Hotmart REENVÍA el mismo evento si el endpoint tarda o falla.
  //    event_id es la primary key: el segundo insert del mismo evento truena, y
  //    eso ES la señal de "ya lo procesé".
  const payloadHash = crypto.createHash('sha256').update(rawBody).digest('hex');
  const { error: errorInsert } = await admin
    .from('processed_events')
    .insert({ event_id: eventId, event_type: evento, payload_hash: payloadHash });

  if (errorInsert) {
    if (errorInsert.code === '23505') {
      // Ya se procesó este evento exacto antes — se responde 200 igual (para que
      // Hotmart no siga reintentando) pero sin repetir la acción.
      await registrarLog(admin, { event_id: eventId, type: evento, result: 'duplicate' });
      return NextResponse.json({ received: true, status: 'duplicate' });
    }
    await registrarLog(admin, { event_id: eventId, type: evento, result: 'error', detail: 'no se pudo registrar el evento' });
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }

  // 6. Catálogo — solo se actúa sobre productos/ofertas reconocidas (aquí NUA
  //    solo tiene un producto, así que no hay allowlist de product_id que
  //    mantener todavía; si algún día hay más de un producto en la misma
  //    cuenta, este es el lugar para filtrar por payload.data.product.id).

  // 7. Aplicar la acción según el tipo de evento.
  if (!CORREO_OK.test(correo)) {
    await registrarLog(admin, { event_id: eventId, type: evento, result: 'error', detail: 'sin correo válido en el payload' });
    return NextResponse.json({ received: true, status: 'sin correo válido' });
  }

  if (EVENTOS_CONCEDER.has(evento)) {
    const { data: existente } = await admin.from('perfiles').select('id, activo').eq('email', correo).maybeSingle();

    if (existente) {
      if (!existente.activo) {
        await admin.from('perfiles').update({ activo: true }).eq('id', existente.id);
      }
      await registrarLog(admin, { event_id: eventId, type: evento, result: 'applied', detail: 'reactivada' });
    } else {
      const { error: errorCrear } = await admin.auth.admin.createUser({ email: correo, email_confirm: true });
      if (errorCrear && !/already been registered/i.test(errorCrear.message)) {
        await registrarLog(admin, { event_id: eventId, type: evento, result: 'error', detail: 'no se pudo crear la cuenta' });
        return NextResponse.json({ error: 'internal' }, { status: 500 });
      }
      // El trigger crear_perfil_para_nuevo_usuario() crea la fila en perfiles
      // sola, con activo=true por default — no hace falta nada más aquí.
      await registrarLog(admin, { event_id: eventId, type: evento, result: 'applied', detail: 'cuenta creada' });
    }
  } else if (EVENTOS_REVOCAR.has(evento)) {
    const { data: existente } = await admin.from('perfiles').select('id').eq('email', correo).maybeSingle();
    if (existente) {
      await admin.from('perfiles').update({ activo: false }).eq('id', existente.id);
      await registrarLog(admin, { event_id: eventId, type: evento, result: 'applied', detail: 'acceso cerrado' });
    } else {
      await registrarLog(admin, { event_id: eventId, type: evento, result: 'ignored', detail: 'no había cuenta con ese correo' });
    }
  } else if (EVENTOS_SOLO_REGISTRO.has(evento)) {
    await registrarLog(admin, { event_id: eventId, type: evento, result: 'ignored', detail: 'cancelación — acceso sigue hasta fin de ciclo' });
  } else {
    await registrarLog(admin, { event_id: eventId, type: evento, result: 'ignored', detail: 'evento sin mapear' });
  }

  return NextResponse.json({ received: true });
}
