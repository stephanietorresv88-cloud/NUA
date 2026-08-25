'use client';

// TRACKER DE EVENTOS — wrapper único (36-ANALITICA-Y-EVENTOS + 60-OPERACION-DE-CONVERSION).
// Sin PostHog por ahora: NUA todavía no tiene tráfico ni cuenta externa que crear, y el
// backoffice (21) lee directo de `event_log` en Supabase — es la fuente de verdad server-side
// que necesita el dueño. PostHog queda como mejora futura para análisis de funnels/A-B, no
// como bloqueante de este panel.
//
// Convención de nombres: objeto_accion, snake_case, verbo en pasado (36). Nunca camelCase/inglés
// salvo los eventos de gamificación (24), que no aplican todavía en NUA.

import { crearClienteNavegador } from '@/lib/supabase/client';
import type { Json } from '@/lib/supabase/types';

const SESSION_KEY = 'nua.analytics.session';
const QA_KEY = 'nua.analytics.qa';
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 min de inactividad (60-OPERACION-DE-CONVERSION)

interface SesionGuardada {
  id: string;
  ultimaActividad: number;
}

function leeSesion(): SesionGuardada | null {
  try {
    const crudo = window.sessionStorage.getItem(SESSION_KEY);
    return crudo ? (JSON.parse(crudo) as SesionGuardada) : null;
  } catch {
    return null;
  }
}

function guardaSesion(s: SesionGuardada) {
  try {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
  } catch {
    // Sin sessionStorage no hay session_id estable; los eventos igual se registran sin él.
  }
}

/** session_id anónimo de 30 min (60): vence tras inactividad, se renueva en cada evento. */
function idDeSesion(): string {
  if (typeof window === 'undefined') return 'server';
  const previa = leeSesion();
  const ahora = Date.now();
  if (previa && ahora - previa.ultimaActividad <= SESSION_TTL_MS) {
    guardaSesion({ id: previa.id, ultimaActividad: ahora });
    return previa.id;
  }
  const nueva = { id: crypto.randomUUID(), ultimaActividad: ahora };
  guardaSesion(nueva);
  return nueva.id;
}

/** ?qa=1 marca la SESIÓN completa como prueba (60) — el backoffice la excluye entera. */
function esQa(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  const flag = params.get('qa');
  if (flag === '1') window.sessionStorage.setItem(QA_KEY, '1');
  if (flag === '0') window.sessionStorage.removeItem(QA_KEY);
  try {
    return window.sessionStorage.getItem(QA_KEY) === '1';
  } catch {
    return false;
  }
}

const supabase = typeof window !== 'undefined' ? crearClienteNavegador() : null;

// Mapa de eventos propios → evento ESTÁNDAR de Meta (los que Meta reconoce y
// usa para optimizar a quién le muestra el anuncio) — solo para los pasos del
// embudo que tienen un equivalente real. Lo demás no se manda al Pixel:
// mandar eventos de más solo le agrega ruido a la optimización, no ayuda.
const EVENTO_META: Record<string, string> = {
  onboarding_iniciado: 'Lead',
  paywall_visto: 'ViewContent',
  checkout_iniciado: 'InitiateCheckout',
};

/** fbq() vive en window, sin tipos oficiales — se declara mínimo para no usar `any` suelto. */
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

function trackMeta(evento: string) {
  if (typeof window === 'undefined' || !window.fbq) return;
  const estandar = EVENTO_META[evento];
  if (estandar) window.fbq('track', estandar);
}

/** Único punto de entrada para registrar un evento. Nombre en objeto_accion (36).
 *  Además de guardarlo en Supabase (la fuente de verdad del backoffice), dispara
 *  el equivalente en el Pixel de Meta si el evento tiene uno mapeado arriba. */
export async function track(
  evento: string,
  metadata: Record<string, Json> = {},
  userId?: string,
): Promise<void> {
  trackMeta(evento);
  if (!supabase) return;
  try {
    await supabase.from('event_log').insert({
      type: evento,
      session_id: idDeSesion(),
      is_qa: esQa(),
      metadata,
      user_id: userId ?? null,
    });
  } catch {
    // Un evento perdido no puede romper la experiencia de la usuaria.
  }
}

/** Registro de errores reales (Error Boundaries + catch del backend) al error_log del backoffice. */
export async function logError(mensaje: string, contexto: string, userId?: string): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from('error_log').insert({
      message: mensaje,
      context: contexto,
      user_id: userId ?? null,
    });
  } catch {
    // Si ni el log de errores funciona, no hay nada más que hacer desde el cliente.
  }
}

/** app_abierta: UNA vez en la vida del usuario/navegador — numerador de activación (36). */
export function trackAppAbierta(userId?: string): void {
  if (typeof window === 'undefined') return;
  try {
    if (window.localStorage.getItem('nua.analytics.app_abierta')) return;
    window.localStorage.setItem('nua.analytics.app_abierta', '1');
  } catch {
    return;
  }
  void track('app_abierta', {}, userId);
}

/** aha_alcanzado: UNA vez en la vida — la primera victoria real (36, def. en 01). En NUA es
 *  la primera vez que se completa un ritual de principio a fin. */
export function trackAhaAlcanzado(userId?: string): void {
  if (typeof window === 'undefined') return;
  try {
    if (window.localStorage.getItem('nua.analytics.aha_alcanzado')) return;
    window.localStorage.setItem('nua.analytics.aha_alcanzado', '1');
  } catch {
    return;
  }
  void track('aha_alcanzado', {}, userId);
}

/** sesion_iniciada: UNA vez por día activo, deduplicado — base de D1/D7/D30 (36). */
export function trackSesionDiaria(userId?: string): void {
  if (typeof window === 'undefined') return;
  const hoy = new Date().toISOString().slice(0, 10);
  try {
    if (window.localStorage.getItem('nua.analytics.last_session_date') === hoy) return;
    window.localStorage.setItem('nua.analytics.last_session_date', hoy);
  } catch {
    return;
  }
  void track('sesion_iniciada', {}, userId);
}
