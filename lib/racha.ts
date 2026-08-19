// LA RACHA — con protección ética (24-GAMIFICACION.md, Mecánica 1).
//
// Decisión de diseño (2026-08-18, crítica de expertos #8): en vez de una tabla nueva
// con contadores mutables (el modelo canónico de `24`, pensado para apps donde el
// cliente podría intentar falsificar su XP/racha desde DevTools), la racha de NUA se
// DERIVA de `sesiones_rutina.created_at` — el historial real de rituales terminados,
// que ya pasa por el único camino de escritura que existe (`guardarVictoria` en
// /rutina). No hay ningún valor nuevo que alguien pueda inventarse: contar días con
// al menos un ritual real es tan a prueba de trampas como el propio archivo. Antes de
// tener cuenta (la mayoría de las primeras rutinas), se deriva igual de
// `nua.diasActivos` en el teléfono — mismo patrón ya usado para `nua.rutinasHechas`.
//
// PROTECCIÓN ÉTICA (no negociable, doctrina de 24 y 56):
// - La racha nunca se muestra en rojo ni con cuenta regresiva de pánico.
// - Un día perdido consume 1 "congelador" ganado (1 cada 7 días de racha, tope 2) —
//   nunca hay que comprarlo ni pedirlo: se gana solo, en silencio, cuidando.
// - Si el hueco es más grande que los congeladores disponibles, la racha se REINICIA
//   pero el RÉCORD (`longest`) nunca se borra — es lo que sostiene el reencuadre sin
//   culpa de la pantalla de racha rota (56, M5).
//
// ⚠️ Simplificación intencional frente al 24: no existe la "reparación <48h" extra
// (ver un tip / doble acción / beneficio Pro) que se ofrece cuando los congeladores no
// alcanzan — NUA no tiene esos sistemas todavía. Si algún día hace falta, se agrega
// aparte; hoy la única protección es el congelador automático.

export interface EstadoRacha {
  /** Racha activa ahora mismo (0 si nunca hizo un ritual o si se rompió y aún no volvió). */
  actual: number;
  /** El récord — nunca se borra, ni al romperse la racha actual. */
  mejor: number;
  /** Congeladores disponibles AHORA (después de gastar los que hicieron falta). */
  congeladores: number;
  /** true si hoy todavía no hizo su ritual y la racha vence a medianoche (56, M4). */
  enRiesgo: boolean;
  /** true si el hueco fue más grande que los congeladores y la racha se reinició. */
  rota: boolean;
  /** Si `rota`, cuántos días llevaba la racha que se perdió (para el reencuadre de 56, M5). */
  perdida: number;
  /** Hito recién alcanzado en la sesión más reciente (7/30/100/365) o null. */
  hito: 7 | 30 | 100 | 365 | null;
}

const HITOS = [7, 30, 100, 365] as const;
const TOPE_CONGELADORES = 2;
const MS_DIA = 86_400_000;

/** "Hoy" en formato YYYY-MM-DD, en la zona horaria LOCAL de quien mira (nunca UTC —
 *  si no, un ritual a las 9pm en Bogotá podía contar para "mañana"). */
export function fechaLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dia}`;
}

function diferenciaDias(desde: string, hasta: string): number {
  const a = new Date(`${desde}T00:00:00`);
  const b = new Date(`${hasta}T00:00:00`);
  return Math.round((b.getTime() - a.getTime()) / MS_DIA);
}

/**
 * Calcula el estado de la racha a partir de las fechas (LOCALES, YYYY-MM-DD) en que
 * completó al menos un ritual. No necesita estar ordenada ni ser única — se limpia acá.
 */
export function calcularRacha(fechasActivas: string[], hoy: Date = new Date()): EstadoRacha {
  const dias = [...new Set(fechasActivas)].sort();
  const hoyStr = fechaLocal(hoy);

  if (dias.length === 0) {
    return { actual: 0, mejor: 0, congeladores: 0, enRiesgo: false, rota: false, perdida: 0, hito: null };
  }

  let racha = 0;
  let congeladores = 0;
  let mejor = 0;
  let anterior: string | null = null;
  let hitoAlcanzado: (typeof HITOS)[number] | null = null;

  for (const dia of dias) {
    if (anterior === null) {
      racha = 1;
    } else {
      const gap = diferenciaDias(anterior, dia);
      if (gap === 1) {
        racha += 1;
      } else {
        const perdidos = gap - 1;
        if (perdidos <= congeladores) {
          congeladores -= perdidos;
          racha += 1;
        } else {
          racha = 1;
        }
      }
    }
    // Se gana 1 congelador cada 7 días de racha activa, tope 2 — nunca se compra.
    if (racha > 0 && racha % 7 === 0) congeladores = Math.min(TOPE_CONGELADORES, congeladores + 1);
    if (HITOS.includes(racha as (typeof HITOS)[number]) && dia === dias[dias.length - 1]) {
      hitoAlcanzado = racha as (typeof HITOS)[number];
    }
    mejor = Math.max(mejor, racha);
    anterior = dia;
  }

  const ultimoDia = dias[dias.length - 1]!;
  const gapHoy = diferenciaDias(ultimoDia, hoyStr);

  if (gapHoy <= 0) {
    // Ya hizo su ritual hoy (o el reloj local retrocedió) — racha vigente, sin riesgo.
    return { actual: racha, mejor, congeladores, enRiesgo: false, rota: false, perdida: 0, hito: hitoAlcanzado };
  }
  if (gapHoy === 1) {
    // Ayer sí, hoy todavía no: racha viva, vence a medianoche (56, M4).
    return { actual: racha, mejor, congeladores, enRiesgo: true, rota: false, perdida: 0, hito: hitoAlcanzado };
  }
  const perdidosHastaHoy = gapHoy - 1;
  if (perdidosHastaHoy <= congeladores) {
    // Los congeladores de sobra cubren el hueco hasta hoy: sigue viva, hoy es el riesgo.
    return {
      actual: racha,
      mejor,
      congeladores: congeladores - perdidosHastaHoy,
      enRiesgo: true,
      rota: false,
      perdida: 0,
      hito: hitoAlcanzado,
    };
  }
  // El hueco superó los congeladores: la racha se rompió. El récord NO se toca.
  return {
    actual: 0,
    mejor,
    congeladores,
    enRiesgo: false,
    rota: true,
    perdida: racha,
    hito: null,
  };
}
