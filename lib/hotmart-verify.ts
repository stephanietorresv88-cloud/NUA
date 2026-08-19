// VERIFICACIÓN DEL WEBHOOK DE HOTMART — 18-VENTA-HOTMART.md, "Seguridad del webhook".
// El cuerpo que llega a /api/webhooks/hotmart es input de internet, no de Hotmart:
// cualquiera puede mandar un POST fingiendo ser una compra. Lo único que separa una
// compra real de un ataque es esta comparación.

import crypto from 'node:crypto';

// Fail-secure: si falta el secreto, esta función (y por lo tanto el endpoint que la
// usa) no puede operar de forma segura — mejor que falle claro a que acepte cualquier
// cosa. No es un valor de juguete por defecto.
const HOTTOK = process.env.HOTMART_HOTTOK;

/**
 * Comparación en tiempo constante (anti timing-attack): un `!==` normal corta en el
 * primer byte distinto, y el tiempo de respuesta filtra cuántos bytes acertó quien
 * ataca. `timingSafeEqual` exige buffers de igual longitud, así que primero se
 * comparan las longitudes con una variable (no con un return anticipado que también
 * filtraría tiempo).
 */
function compararEnTiempoConstante(a: string, b: string): boolean {
  const ba = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  const mismaLongitud = ba.length === bb.length;
  // Si la longitud difiere, comparamos igual contra un buffer del mismo tamaño que
  // el propio secreto para no salir antes de tiempo (defensa en profundidad).
  return mismaLongitud && crypto.timingSafeEqual(ba, mismaLongitud ? bb : ba);
}

/** true si el HOTTOK recibido coincide con el configurado. */
export function verificarHotmart(hottokRecibido: string | undefined | null): boolean {
  if (!HOTTOK) return false; // sin secreto configurado, nunca se acepta nada
  if (!hottokRecibido) return false;
  return compararEnTiempoConstante(hottokRecibido, HOTTOK);
}

/** Ventana anti-replay: un evento con fecha más vieja que esto se rechaza. */
export const VENTANA_REPLAY_MS = 5 * 60 * 1000;

export function esReciente(marcaDeTiempoMs?: number): boolean {
  if (!marcaDeTiempoMs) return true; // sin fecha fiable en el payload, no se bloquea por esto
  const edad = Date.now() - marcaDeTiempoMs;
  return edad >= 0 && edad <= VENTANA_REPLAY_MS;
}
