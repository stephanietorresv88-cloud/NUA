// DESBLOQUEO SEMANAL DE RUTINAS — decisión de la dueña (2026-08-14):
// no se abren las 41 rutinas de golpe. Sería abrumador para alguien que
// recién llega. En vez de eso, cada quien tiene SU propia semana 1 (cuenta
// desde que se hizo de NUA) y cada semana se suman rutinas nuevas — eso es
// también el GATILLO de retención semanal ("esta semana se sumaron N").
//
// Semana 1: 3 de cada duración (9 en total) — nunca vacío, nunca abrumador.
// De ahí en adelante: 3 rutinas más por semana, mezclando los tres tiempos,
// hasta que en la semana 12 está todo el catálogo abierto.

const BASE = 9;
const PASO_SEMANAL = 3;

/** El orden en que se liberan las 41 rutinas. Mezcla los tres tiempos desde
 *  el arranque (no "todas las de 5 min primero") para que cada tanda traiga
 *  variedad real. Las primeras 9 son las más probadas: las que escribió la
 *  propia dueña. */
export const SECUENCIA_DESBLOQUEO: string[] = [
  'respiro-emergencia-5',
  'desbloqueo-fisico-5',
  'corte-inercia-5',
  'escudo-culpa-15',
  'santuario-15',
  'silencio-15',
  'romper-ciclo-20',
  'conversacion-20',
  'paces-error-20',
  'ventilacion-5',
  'cosecha-15',
  'todo-demasiado-20',
  'apagon-5',
  'aterrizaje-5',
  'esencia-15',
  'lo-que-importa-20',
  'chispazo-5',
  'ya-no-cargar-15',
  'cuenta-pendiente-5',
  'apagar-luz-5',
  'ciclo-agotamiento-20',
  'cuidar-sin-perderme-15',
  'cambio-piel-5',
  'antes-de-entrar-5',
  'cuerpo-sostiene-15',
  'limite-olvida-20',
  'bajada-seis-5',
  'cerrar-pestana-5',
  'recordar-me-gusta-15',
  'comparo-quien-era-20',
  'ladrillo-5',
  'quitarme-si-5',
  'permiso-no-poder-15',
  'permiso-llorar-5',
  'pedir-ayuda-20',
  'paces-cuerpo-15',
  'una-cosa-menos-5',
  'un-paso-mas-5',
  'perfeccionismo-frena-20',
  'descanso-sin-culpa-15',
  'ensayar-no-5',
];

/** Semana 1, 2, 3... desde que empezó (nunca 0 ni negativo). */
export function semanaDesde(inicio: Date, ahora: Date = new Date()): number {
  const dias = Math.floor((ahora.getTime() - inicio.getTime()) / 86_400_000);
  return Math.max(1, Math.floor(Math.max(0, dias) / 7) + 1);
}

/** Cuántas rutinas hay abiertas en una semana dada. */
export function cantidadDesbloqueada(semana: number): number {
  return Math.min(SECUENCIA_DESBLOQUEO.length, BASE + PASO_SEMANAL * Math.max(0, semana - 1));
}

/** El set de ids abiertos en una semana dada. */
export function idsDesbloqueados(semana: number): Set<string> {
  return new Set(SECUENCIA_DESBLOQUEO.slice(0, cantidadDesbloqueada(semana)));
}

/** Cuántas rutinas nuevas se suman ESTA semana respecto a la anterior — el
 *  número que alimenta el gatillo de retención ("+3 rutinas nuevas hoy"). */
export function nuevasEstaSemana(semana: number): number {
  return cantidadDesbloqueada(semana) - cantidadDesbloqueada(semana - 1);
}
