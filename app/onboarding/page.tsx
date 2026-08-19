'use client';

// ONBOARDING DE NUA — 7 pasos. Modelo 2 de 02C (onboarding-first ANÓNIMO): no se
// pide correo ni tarjeta. Ella ve —y HACE— su ritual antes de que se mencione pagar.
//
// Rescate del 2026-08-13 (protocolo R1-R5 de `12`), sobre la versión de 4 pasos:
// - Faltaba el trabajo 3 de los 5 del onboarding (ACTIVAR): leía una lista de pasos y
//   salía al paywall sin haber HECHO nada. Ahora el paso 7 ejecuta la primera
//   microacción con temporizador: llega al precio después de una victoria real.
// - Faltaba la pantalla "armando tu ritual" (patrón Noom): esos segundos en que el plan
//   se construye ante sus ojos son el primer argumento del paywall, no una carga.
// - Faltaba la PREGUNTA DE ANCLAJE CONTEXTUAL que `02B` marca como obligatoria
//   ("¿cuándo?"): fija la hora del recordatorio desde el día 1.
// - Faltaba eco de los DOLORES de FICHA-AVATAR: se preguntaba la energía de hoy, nunca
//   qué se le está cayendo. Cada pregunta nueva DEVUELVE algo (patrón Noom); preguntar
//   sin devolver es el interrogatorio que ella odia (su queja #1 documentada).
//
// ⚠️ TEXTO AL MÍNIMO (instrucción explícita del usuario, 2026-08-13): ninguna pantalla
// nueva pasa de un titular + una línea. Presupuesto de copy de `52`: titular ≤8-10
// palabras, línea de apoyo ≤12-14. Se cuenta, no se estima.

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, animate, motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Check } from 'lucide-react';
import { track } from '@/lib/analytics';
import {
  CAPACIDADES,
  PROPOSITO_DEL_DIAL,
  seleccionarExperiencia,
  type EstadoId,
} from '@/lib/rituales';
import { rutinaPara, type DuracionRutina } from '@/lib/rutinas';

interface Estado {
  id: EstadoId;
  etiqueta: string;
  descripcion: string;
  minutos: number;
  frase: string;
  color: string;
}

// Los pasos NO viven aquí: salen del Sistema NUA de Entrenamiento Adaptativo
// (lib/rituales.ts). Cada estado entrena una capacidad distinta y entrega
// microacciones distintas — no el mismo ritual recortado.
//
// ⚠️ Los minutos que se enseñan son los REALES del ritual de cada estado (sumados de
// sus pasos), no el techo del dial: la versión anterior anunciaba 30 min y entregaba
// 4. Se calcula una vez, al cargar el módulo.
const MINUTOS_REALES: Record<EstadoId, number> = {
  reserva: seleccionarExperiencia('reserva').minutos,
  media: seleccionarExperiencia('media').minutos,
  energia: seleccionarExperiencia('energia').minutos,
};

// ⚠️ "En reserva / A media / Con energía" lo descartó la dueña (2026-08-13): nadie
// piensa "hoy estoy en reserva", y sonaba a indicador médico. Ahora el dial se lee
// por lo que ella PUEDE hoy, y el minutaje manda. Los ids internos no cambian.
const ESTADOS: Estado[] = [
  {
    id: 'reserva',
    etiqueta: 'Necesito algo fácil',
    descripcion: 'Hoy me queda poco',
    minutos: MINUTOS_REALES.reserva,
    frase: PROPOSITO_DEL_DIAL.reserva.frase,
    color: 'var(--estado-reserva)',
  },
  {
    id: 'media',
    etiqueta: 'Puedo con lo esencial',
    descripcion: 'Ni mal ni bien, normal',
    minutos: MINUTOS_REALES.media,
    frase: PROPOSITO_DEL_DIAL.media.frase,
    color: 'var(--estado-media)',
  },
  {
    id: 'energia',
    etiqueta: 'Hoy tengo más para mí',
    descripcion: 'Hoy puedo con más',
    minutos: MINUTOS_REALES.energia,
    frase: PROPOSITO_DEL_DIAL.energia.frase,
    color: 'var(--estado-energia)',
  },
];

/** PASO 2 — los DOLORES de FICHA-AVATAR, en sus palabras. El último chip es el avatar
 *  hablando (patrón del banco de preguntas de `02B`). Cada uno devuelve un
 *  reconocimiento distinto en el paso 3: la pregunta no es decorativa. */
type DolorId = 'dormir' | 'tiempo' | 'energia' | 'todo';

// ⚠️ Las cuatro frases son PALABRAS DE LA DUEÑA (2026-08-13). Descartó "No llegas
// vacía por débil" ("me parece fatal") y escribió estas. No se reescriben sin ella.
// Van en tres partes: [antes, EN ACENTO, después] — se resalta lo que desculpabiliza.
const DOLORES: { id: DolorId; chip: string; reconoce: [string, string, string] }[] = [
  {
    id: 'dormir',
    chip: 'Dormir tranquila',
    // Dolor 1 de la ficha: "me despierto con ansiedad y la cabeza saturada".
    reconoce: ['No es que no puedas más. Es que ', 'llevas demasiado encima', '.'],
  },
  {
    id: 'tiempo',
    chip: 'Un rato para mí',
    // Dolor 2 + ancla emocional: "deja de ser lo último de tu lista".
    reconoce: ['Pasas el día resolviendo. ', '¿Cuándo te toca a ti', '?'],
  },
  {
    id: 'energia',
    chip: 'Llegar con energía a casa',
    // Dolor 4: "tengo la energía en ceros cuando llego con mi familia".
    reconoce: ['No te falta energía. La estás gastando ', 'en sostenerlo todo', '.'],
  },
  {
    id: 'todo',
    chip: 'Todo, si soy honesta',
    reconoce: ['Todo depende de ti. Hasta que ', 'no te queda nada para ti', '.'],
  },
];

/** El cierre del bloque de identificación. Aprobado por la dueña frente a otras dos
 *  opciones: es la que conecta el dolor con lo que NUA hace de verdad.
 *  2026-08-18, crítica de expertos (2ª ronda): decía "disciplina" — palabra prohibida
 *  por FICHA-AVATAR.md ("Lenguaje", vetada por sonar a jerga de coach/productividad),
 *  colada en el paso más emocional del onboarding. Se cambia por "fuerza de voluntad"
 *  (ya vocabulario de la landing, Agitación frase 1) — misma estructura aprobada. */
const CIERRE_IDENTIFICACION = 'No necesitas más fuerza de voluntad. Necesitas una rutina que se adapte a tu vida.';

/** PASO 5 — la PREGUNTA DE ANCLAJE CONTEXTUAL obligatoria de `02B`. Fija la hora del
 *  ritual desde el día 1 (implementation intentions: "cuando pase X, haré Y"). */
type MomentoId = 'despertar' | 'manana' | 'tarde' | 'noche';

const MOMENTOS: { id: MomentoId; chip: string }[] = [
  { id: 'despertar', chip: 'Al despertar' },
  { id: 'manana', chip: 'A media mañana' },
  { id: 'tarde', chip: 'Al cerrar el trabajo' },
  { id: 'noche', chip: 'Antes de dormir' },
];

/** Una sola forma de decir una duración en toda la app: la card decía "2 min" y el
 *  pie del botón "90 segundos" para el MISMO paso. */
const duracion = (segundos: number) => {
  if (segundos < 60) return `${segundos} s`;
  const min = Math.floor(segundos / 60);
  const resto = segundos % 60;
  // Nunca se redondea hacia arriba: 90 s son "1 min 30 s", no "2 min".
  return resto === 0 ? `${min} min` : `${min} min ${resto} s`;
};

/** PASO 6 — lo que se va marcando mientras se arma el ritual. Máx 5 palabras cada una. */
const LINEAS_ARMADO = [
  'Leyendo cómo llegas hoy',
  'Eligiendo la capacidad que toca',
  'Ajustando los minutos a tu hueco',
];

const TOTAL_PASOS = 7;

/** Guardar sus respuestas es un extra, no un requisito: si el navegador bloquea el
 *  almacenamiento (modo privado), el ritual sigue funcionando igual. */
function recuerda(clave: string, valor: string) {
  try {
    window.localStorage.setItem(clave, valor);
  } catch {
    // Sin memoria entre visitas. La sesión de hoy no se rompe, que es lo que importa.
  }
}

function leeRecuerdo(clave: string): string | null {
  try {
    return window.localStorage.getItem(clave);
  } catch {
    return null;
  }
}

/** Arcos del dial: geometría fija (r=88, centro 120/120). */
const ARCOS: { id: EstadoId; d: string }[] = [
  { id: 'reserva', d: 'M32 118.5 A88 88 0 0 1 73.4 45.4' },
  { id: 'media', d: 'M78.7 42.3 A88 88 0 0 1 161.3 42.3' },
  { id: 'energia', d: 'M166.6 45.4 A88 88 0 0 1 208 118.5' },
];
const ANGULOS: Record<EstadoId, number> = { reserva: -60, media: 0, energia: 60 };

/** Zonas de toque: los mismos arcos RECORTADOS ~7° por cada extremo. A 44px de ancho
 *  las bandas se solapaban en las juntas y ganaba siempre la de la derecha: un toque
 *  en la junta te cambiaba el ritual y avanzaba a los 320ms. */
const ARCOS_TOQUE: { id: EstadoId; d: string }[] = [
  { id: 'reserva', d: 'M34.6 108.6 A88 88 0 0 1 66.5 50.5' },
  { id: 'media', d: 'M88.9 37.9 A88 88 0 0 1 151.1 37.9' },
  { id: 'energia', d: 'M173.5 50.5 A88 88 0 0 1 205.4 108.6' },
];

/** Conteo animado del número héroe (baseline 2 de las 7 de CLAUDE.md). */
function useConteo(objetivo: number, reduce: boolean | null, disparo?: unknown) {
  // Arrancaba en el valor final: la card destellaba el número antes de contarlo, y
  // el conteo ya se había gastado invisible en el paso del dial.
  const [valor, setValor] = useState(reduce ? objetivo : 0);
  useEffect(() => {
    if (reduce) {
      setValor(objetivo);
      return;
    }
    setValor(0);
    const control = animate(0, objetivo, {
      duration: 0.55,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setValor(Math.round(v)),
    });
    return () => control.stop();
  }, [objetivo, reduce, disparo]);
  return valor;
}

/** Cierre de las pantallas de opciones: ancla el fondo y baja el compromiso de la
 *  elección. El hueco muerto no se mueve de sitio, se llena con algo que sirva. */
function Cierre({ texto, alFondo }: { texto: string; alFondo?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: reduce ? 0 : 0.35, duration: 0.4 }}
      className={`pb-6 pt-8 ${alFondo ? 'mt-auto' : ''}`}
    >
      <div
        aria-hidden="true"
        className="h-0.5 w-16 rounded-full bg-[linear-gradient(90deg,var(--accent),transparent)]"
      />
      <p className="mt-3 text-[length:var(--txt-body)] leading-snug text-[var(--text-secondary)]">
        {texto}
      </p>
    </motion.div>
  );
}

/** Mueve el foco con las flechas dentro de un radiogroup. Un `role="radio"` sin esto
 *  es un radiogroup de mentira: con teclado no se puede recorrer. */
function moverConFlechas(e: React.KeyboardEvent<HTMLDivElement>, total: number) {
  if (!['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'].includes(e.key)) return;
  e.preventDefault();
  const radios = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]'));
  const actual = radios.indexOf(document.activeElement as HTMLElement);
  const paso = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1;
  radios[(Math.max(0, actual) + paso + total) % total]?.focus();
}

/** Chip de respuesta. Único componente de opción en todo el onboarding: dos lenguajes
 *  distintos de chip en el mismo flujo se leen como dos apps. */
function Chip({
  texto,
  activo,
  onClick,
  delay,
  primero,
  hayElegido,
}: {
  texto: string;
  activo: boolean;
  onClick: () => void;
  delay: number;
  /** Sin nada elegido, solo el primero es tabulable (roving tabindex). */
  primero: boolean;
  hayElegido: boolean;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.button
      type="button"
      role="radio"
      aria-checked={activo}
      tabIndex={hayElegido ? (activo ? 0 : -1) : primero ? 0 : -1}
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduce ? 0 : delay, duration: 0.3 }}
      className={`flex min-h-14 w-full items-center justify-between gap-3 rounded-[var(--radius-card)] border px-4 py-3 text-left text-[length:var(--txt-body)] transition-[border-color,box-shadow] duration-200 [touch-action:manipulation] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${
        activo
          ? 'border-[var(--accent)] bg-[var(--surface)] shadow-[var(--shadow-2)] ring-2 ring-[var(--accent)]'
          : 'border-[color-mix(in_oklab,var(--text-tertiary)_45%,transparent)] bg-[var(--surface)]'
      }`}
    >
      <span className="font-medium">{texto}</span>
      {/* Sin elegir va HUECO con borde: un disco gris relleno se lee como adorno o
          como "cargando", no como algo que puedas marcar. */}
      <span
        aria-hidden="true"
        className={`flex size-6 shrink-0 items-center justify-center rounded-full ${
          activo
            ? 'bg-[var(--accent)]'
            : 'border-[1.5px] border-[var(--text-tertiary)] bg-transparent'
        }`}
      >
        {activo && <Check size={14} strokeWidth={3} color="var(--sobre-acento)" />}
      </span>
    </motion.button>
  );
}

export default function Onboarding() {
  const [paso, setPaso] = useState(1);
  const contenido = useRef<HTMLElement>(null);
  const [dolor, setDolor] = useState<DolorId | null>(null);
  const [eleccion, setEleccion] = useState<EstadoId | null>(null);
  const [momento, setMomento] = useState<MomentoId | null>(null);
  const [bloqueado, setBloqueado] = useState(false);
  // Fases del paso 7: ver el ritual (que se hace en /rutina) → haberlo hecho.
  const [fase, setFase] = useState<'ritual' | 'hecho'>('ritual');
  const reduce = useReducedMotion();

  const estado = ESTADOS.find((e) => e.id === eleccion) ?? null;
  const minutosContados = useConteo(estado?.minutos ?? 0, reduce, paso === 7 && fase === 'ritual');
  // La experiencia del día la arma el motor, no una lista fija en esta pantalla.
  const experiencia = eleccion ? seleccionarExperiencia(eleccion) : null;
  // La rutina de hoy, con su nombre. El onboarding la PRESENTA; ejecutarla es
  // trabajo del reproductor (/rutina), que es donde vive la experiencia entera.
  const rutinaHoy = rutinaPara((estado?.minutos ?? 5) as DuracionRutina);

  const reconocimiento =
    DOLORES.find((d) => d.id === dolor)?.reconoce ??
    // Si saltó la pregunta. Se había quedado con la frase vieja: si la usuaria salta,
    // veía un texto que ya no existe en ninguna otra parte del flujo.
    (['Todo depende de ti. Hasta que ', 'no te queda nada para ti', '.'] as const);

  // Sus respuestas sobreviven al viaje al paywall y a la vuelta. Sin esto, "Ahora no"
  // la devolvía al paso 1 a rehacer todo — el peor castigo posible por dudar.
  // ⚠️ El almacenamiento puede estar BLOQUEADO (modo privado, cookies de terceros
  // desactivadas): sin try/catch, el primer toque lanzaba y dejaba la pantalla en
  // blanco. Recordar sus respuestas es un extra; no poder hacerlo no puede romper
  // el ritual de nadie.
  useEffect(() => {
    if (eleccion) recuerda('nua.estado', eleccion);
  }, [eleccion]);
  useEffect(() => {
    if (dolor) recuerda('nua.dolor', dolor);
  }, [dolor]);
  useEffect(() => {
    if (momento) recuerda('nua.momento', momento);
  }, [momento]);

  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has('ritual')) return;
    const guardado = leeRecuerdo('nua.estado');
    if (guardado && ESTADOS.some((e) => e.id === guardado)) {
      setEleccion(guardado as EstadoId);
      setPaso(7);
      setFase('hecho');
    }
  }, []);

  // MEDICIÓN DEL FUNNEL (36/60). onboarding_iniciado solo si entra de verdad al paso 1
  // (no si `?ritual=1` la manda directo al 7 — retomar no es avanzar, 36). Cada cambio
  // de paso posterior emite onboarding_paso_completado con el paso QUE ACABA DE DEJAR;
  // el salto de la restauración (arriba) se salta UNA vez y no cuenta.
  const pasoAnterior = useRef(1);
  const esRestauracion = useRef(false);
  useEffect(() => {
    esRestauracion.current = new URLSearchParams(window.location.search).has('ritual');
    if (!esRestauracion.current) void track('onboarding_iniciado', {});
  }, []);
  useEffect(() => {
    if (pasoAnterior.current === paso) return;
    const pasoQueDejo = pasoAnterior.current;
    pasoAnterior.current = paso;
    if (esRestauracion.current) {
      esRestauracion.current = false;
      return;
    }
    void track('onboarding_paso_completado', { paso: pasoQueDejo, total_pasos: 7 });
    if (paso === 7) {
      void track('onboarding_completado', {});
      void track('resultado_visto', {});
    }
  }, [paso]);

  // El foco viaja con la pantalla. Sin esto, quien navega con teclado o lector se
  // quedaba en el body y el cambio de paso no se anunciaba.
  useEffect(() => {
    if (paso > 1) contenido.current?.focus({ preventScroll: true });
  }, [paso]);

  // PASO 6 — el armado corre solo y entrega en el 7.
  useEffect(() => {
    if (paso !== 6) return;
    const t = window.setTimeout(() => setPaso(7), reduce ? 400 : 2400);
    return () => window.clearTimeout(t);
  }, [paso, reduce]);

  /** Avance con pausa para que VEA su elección marcada antes de pasar. */
  const elegirYAvanzar = (aplicar: () => void, siguiente: number) => {
    if (bloqueado) return;
    aplicar();
    setBloqueado(true);
    window.setTimeout(
      () => {
        setPaso(siguiente);
        setBloqueado(false);
      },
      reduce ? 0 : 320
    );
  };

  // La barra arranca en 8%, nunca en 0: una barra ya iniciada predispone a
  // terminarla (efecto Zeigarnik, regla del blueprint de 50).
  const progreso = Math.max(8, Math.round((paso / TOTAL_PASOS) * 100));

  const variantes = {
    entra: { x: reduce ? 0 : 40, opacity: 0 },
    centro: { x: 0, opacity: 1 },
    sale: { x: reduce ? 0 : -24, opacity: 0 },
  };
  const trans = { duration: reduce ? 0.2 : 0.3, ease: [0.16, 1, 0.3, 1] as const };
  const btn =
    'flex h-14 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--accent)] text-[length:var(--txt-body)] font-semibold text-white shadow-[var(--shadow-2)] [touch-action:manipulation] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]';
  const h1 = 'text-[length:var(--txt-title)] leading-tight [font-family:var(--font-display)]';

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--bg)] text-[var(--text-primary)] [font-family:var(--font-body)]">
      {/* ── Marca + progreso ── (52 §6: el funnel nunca se siente desconectado) */}
      <header className="flex items-center gap-3 px-5 pb-2 pt-4">
        {paso > 1 && paso !== 6 && (
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              // En el paso 7 "atrás" retrocede de FASE, no de paso: si saltara al 6,
              // esa pantalla auto-avanza y la devolvía al 7. Volver estaba roto justo
              // en la pantalla del dinero.
              if (paso === 7 && fase !== 'ritual') {
                setFase('ritual');
                return;
              }
              // Y desde el ritual se vuelve al 5, nunca al 6 (que auto-avanza).
              setPaso((p) => (p === 7 ? 5 : Math.max(1, p - 1)));
            }}
            aria-label="Volver al paso anterior"
            className="-ml-3 flex size-11 shrink-0 items-center justify-center rounded-full text-[var(--text-secondary)] [touch-action:manipulation]"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </motion.button>
        )}

        {/* La marca va en TODOS los pasos, no solo en el primero: el funnel no puede
            sentirse desconectado de la app (52 §6 — dónde estoy, qué app es, cómo vuelvo). */}
        <Link
          href="/"
          aria-label="NUA — ir al inicio"
          className={`flex h-11 shrink-0 items-center text-[length:var(--txt-body)] font-semibold tracking-[0.2em] text-[var(--accent)] [font-family:var(--font-display)] [touch-action:manipulation] ${
            paso > 1 && paso !== 6 ? '' : '-ml-1'
          }`}
        >
          NUA
        </Link>

        <div className="flex flex-1 items-center gap-2">
          <div
            className="h-0.5 flex-1 overflow-hidden rounded-full bg-[var(--surface-2)]"
            role="progressbar"
            aria-valuenow={progreso}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Paso ${paso} de ${TOTAL_PASOS}`}
          >
            <motion.div
              className="h-full rounded-full bg-[var(--accent)]"
              initial={false}
              animate={{ width: `${progreso}%` }}
              transition={{ duration: reduce ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          {/* Una barra sin número no dice cuánto falta. El dato va también a voz alta
              para quien navega con lector de pantalla. */}
          <span
            aria-live="polite"
            className="shrink-0 text-[length:var(--txt-label)] tabular-nums text-[var(--text-secondary)]"
          >
            {paso} de {TOTAL_PASOS}
          </span>
        </div>

        {/* "Saltar" solo donde no rompe nada: desde el paso 2 ya invirtió una
            elección, y un skip que la descarta sin avisar es peor que no tenerlo. */}
        {paso === 1 ? (
          <Link
            href="/"
            className="flex h-11 shrink-0 items-center px-1 text-[length:var(--txt-body)] text-[var(--text-secondary)] [touch-action:manipulation]"
          >
            Saltar
          </Link>
        ) : paso === 2 || paso === 5 ? (
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            /* Si salta la pregunta del dolor, se salta TAMBIÉN el reconocimiento: esa
               pantalla le devuelve una frase suya, y a quien no dijo nada le estaría
               poniendo palabras en la boca. */
            onClick={() => setPaso(paso === 2 && !dolor ? 4 : paso + 1)}
            className="flex h-11 shrink-0 items-center px-1 text-[length:var(--txt-body)] text-[var(--text-secondary)] [touch-action:manipulation]"
          >
            Saltar
          </motion.button>
        ) : (
          <span className="h-11 w-12 shrink-0" aria-hidden="true" />
        )}
      </header>

      {/* El foco se movía al body en cada avance: con lector de pantalla o teclado,
          cambiar de pantalla no anunciaba nada. Ahora el foco entra en el contenido. */}
      <main
        ref={contenido}
        tabIndex={-1}
        aria-label={`Paso ${paso} de ${TOTAL_PASOS}`}
        className="flex flex-1 flex-col px-5 pb-8 focus:outline-none"
      >
        <AnimatePresence mode="wait">
          {/* ═══ 1 — BIENVENIDA ═══ */}
          {paso === 1 && (
            <motion.section key="p1" variants={variantes} initial="entra" animate="centro" exit="sale" transition={trans} className="flex flex-1 flex-col">
              <div className="flex flex-1 flex-col justify-center py-6">
                <p className="text-[length:var(--txt-label)] font-semibold uppercase tracking-[0.28em] text-[var(--text-secondary)]">
                  Bienvenida
                </p>
                <h1 className={`mt-3 ${h1}`}>
                  Vamos a crear tu <span className="text-[var(--accent)]">ritual de hoy</span>
                </h1>
                {/* "Una sola pregunta" se cayó del subtítulo: el flujo tiene tres, y
                    prometer una y hacer tres es exactamente la contradicción que la
                    dueña señaló. Se conservan las dos objeciones que sí son ciertas. */}
                <p className="mt-4 text-[length:var(--txt-body)] leading-relaxed text-[var(--text-secondary)]">
                  Sin tarjeta. Sin cuestionarios interminables.
                </p>

                {/* Ilustración: bloque de marca con el dial dibujado, no una foto de
                    banco de imágenes. Es honesto y es la firma visual de NUA. */}
                <div
                  aria-hidden="true"
                  className="mt-8 flex items-center justify-center rounded-[var(--radius-card)] bg-[var(--bloque-lavanda)] py-8"
                >
                  <svg viewBox="0 0 240 150" className="w-56 max-w-full">
                    <g fill="none" strokeLinecap="round" strokeWidth={25}>
                      <path d="M32 118.5 A88 88 0 0 1 73.4 45.4" stroke="var(--estado-reserva)" />
                      <path d="M78.7 42.3 A88 88 0 0 1 161.3 42.3" stroke="var(--estado-media)" />
                      <path d="M166.6 45.4 A88 88 0 0 1 208 118.5" stroke="var(--estado-energia)" />
                    </g>
                    <motion.g
                      initial={reduce ? false : { rotate: -60 }}
                      animate={{ rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 90, damping: 13, delay: 0.2 }}
                      style={{ originX: '120px', originY: '120px' }}
                    >
                      <path d="M120 120 L120 50" stroke="var(--dial-aguja)" strokeWidth={7} strokeLinecap="round" />
                    </motion.g>
                    <circle cx="120" cy="120" r="13" fill="var(--dial-aguja)" />
                    <circle cx="120" cy="120" r="5" fill="var(--bg)" />
                  </svg>
                </div>
              </div>

              <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={() => setPaso(2)} className={btn}>
                Empezar
                <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />
              </motion.button>

              <p className="mt-4 text-center text-[length:var(--txt-body)] text-[var(--text-secondary)]">
                ¿Ya tienes cuenta?{' '}
                <Link href="/entrar" className="font-semibold text-[var(--accent)] underline underline-offset-4">
                  Inicia sesión
                </Link>
              </p>
            </motion.section>
          )}

          {/* ═══ 2 — EL DOLOR (eco de FICHA-AVATAR) ═══ */}
          {paso === 2 && (
            <motion.section key="p2" variants={variantes} initial="entra" animate="centro" exit="sale" transition={trans} className="flex flex-1 flex-col">
              {/* Era "¿Qué se te ha caído últimamente?". La dueña descartó "caído"
                  ("no me dice nada"). Las cuatro opciones son cosas que ella quiere
                  DE VUELTA, así que la pregunta ahora las nombra por lo que son. */}
              <h1 className={`mt-6 ${h1}`}>
                ¿Qué es lo que más te <span className="text-[var(--accent)]">falta</span> hoy?
              </h1>
              <p className="mt-2 text-[length:var(--txt-body)] text-[var(--text-secondary)]">
                Elige lo que más pese.
              </p>

              {/* Opciones arriba y CIERRE abajo: centrarlas dejaba un hueco en medio y
                  anclarlas arriba lo mandaba al fondo. El vacío no se mueve, se llena. */}
              <div className="flex flex-1 flex-col pb-2">
                <div
                  className="my-auto flex flex-col gap-4"
                  role="radiogroup"
                  aria-label="¿Qué es lo que más te falta hoy?"
                  onKeyDown={(e) => moverConFlechas(e, DOLORES.length)}
                >
                  {DOLORES.map((d, i) => (
                    <Chip
                      key={d.id}
                      texto={d.chip}
                      activo={dolor === d.id}
                      primero={i === 0}
                      hayElegido={dolor !== null}
                      delay={i * 0.06}
                      onClick={() => elegirYAvanzar(() => setDolor(d.id), 3)}
                    />
                  ))}
                </div>
                <Cierre texto="Nada de esto queda fijo. Mañana puede ser otra." />
              </div>
            </motion.section>
          )}

          {/* ═══ 3 — RECONOCIMIENTO (cada pregunta DEVUELVE algo) ═══ */}
          {paso === 3 && (
            <motion.section key="p3" variants={variantes} initial="entra" animate="centro" exit="sale" transition={trans} className="flex flex-1 flex-col">
              <div className="flex flex-1 flex-col justify-center py-6">
                {/* Hairline degradé: la pantalla no puede ser solo texto (densidad
                    visual de `52`), pero tampoco se le añade más texto. */}
                <motion.div
                  aria-hidden="true"
                  initial={reduce ? false : { scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
                  className="h-0.5 w-16 origin-left rounded-full bg-[linear-gradient(90deg,var(--accent),transparent)]"
                />
                {/* La frase va sobre una superficie elevada: la pantalla estaba
                    vacía, no minimalista. Es materia, no más texto. */}
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: reduce ? 0 : 0.12 }}
                  className="mt-6 rounded-[var(--radius-card)] bg-[var(--surface)] px-5 py-6 shadow-[var(--shadow-2)]"
                >
                  <p className={h1}>
                    {reconocimiento[0]}
                    <span className="text-[var(--accent)]">{reconocimiento[1]}</span>
                    {reconocimiento[2]}
                  </p>
                  <motion.p
                    initial={reduce ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: reduce ? 0 : 0.45 }}
                    className="mt-4 text-[length:var(--txt-body)] leading-relaxed text-[var(--text-secondary)]"
                  >
                    {CIERRE_IDENTIFICACION}
                  </motion.p>
                </motion.div>
              </div>

              <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={() => setPaso(4)} className={btn}>
                Sigamos
                <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />
              </motion.button>
            </motion.section>
          )}

          {/* ═══ 4 — EL DIAL ═══ */}
          {paso === 4 && (
            <motion.section key="p4" variants={variantes} initial="entra" animate="centro" exit="sale" transition={trans} className="flex flex-1 flex-col">
              <h1 className={`mt-6 ${h1}`}>
                ¿Cómo <span className="text-[var(--accent)]">llegas</span> hoy?
              </h1>
              {/* El mecanismo se NOMBRA aquí: al salir del onboarding tiene que poder
                  decir qué configuró (test de salida de `02B`). */}
              <p className="mt-2 text-[length:var(--txt-body)] text-[var(--text-secondary)]">
                Esto es tu Dial de Energía. No hay respuesta mala.
              </p>

              {/* Tocar una zona del dial mueve la aguja: el dispositivo firma de NUA
                  se USA aquí, no se enseña de adorno. */}
              <div className="flex flex-1 flex-col justify-center py-2">
                <div className="flex justify-center">
                  <svg viewBox="0 0 240 150" className="w-72 max-w-full" aria-hidden="true">
                    {/* linecap BUTT: con los extremos redondeados a 25px de grosor, los
                        tres arcos se solapaban y dejaban dos manchas de tono distinto
                        justo en el dispositivo firma de la marca. */}
                    <g fill="none" strokeLinecap="butt" strokeWidth={25}>
                      {ARCOS.map((a) => {
                        const e = ESTADOS.find((x) => x.id === a.id)!;
                        const on = eleccion === a.id;
                        return (
                          <motion.path
                            key={a.id}
                            d={a.d}
                            className="cursor-pointer"
                            onClick={() => elegirYAvanzar(() => setEleccion(a.id), 5)}
                            initial={false}
                            /* Sin elección, los arcos van atenuados: a todo color y
                               con la aguja en vertical, el dial se leía como si ella
                               ya hubiera elegido "15 min" sin haber tocado nada. */
                            animate={{
                              stroke: on || !eleccion ? e.color : 'var(--dial-inactivo)',
                              opacity: eleccion ? 1 : 0.55,
                            }}
                            transition={{ duration: reduce ? 0 : 0.3 }}
                          />
                        );
                      })}
                    </g>

                    {/* Área de toque invisible y MÁS ANCHA que el arco: 25px contiguos
                        con auto-avance a 320ms significa que un dedo torcido te cambia
                        el ritual y te lleva a la pantalla siguiente. */}
                    <g fill="none" stroke="transparent" strokeWidth={44} style={{ pointerEvents: 'stroke' }}>
                      {ARCOS_TOQUE.map((a) => (
                        <path
                          key={`toque-${a.id}`}
                          d={a.d}
                          className="cursor-pointer"
                          onClick={() => elegirYAvanzar(() => setEleccion(a.id), 5)}
                        />
                      ))}
                    </g>

                    <motion.g
                      initial={false}
                      animate={{ rotate: eleccion ? ANGULOS[eleccion] : 0 }}
                      transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 130, damping: 13 }}
                      style={{ originX: '120px', originY: '120px' }}
                    >
                      {/* En reposo la aguja va PUNTEADA: una aguja sólida apuntando
                          al centro afirma una elección que ella no ha hecho. */}
                      <path
                        d="M120 120 L120 50"
                        stroke="var(--dial-aguja)"
                        strokeWidth={7}
                        strokeLinecap="round"
                        opacity={eleccion ? 1 : 0.3}
                        strokeDasharray={eleccion ? undefined : '2 10'}
                      />
                    </motion.g>
                    <circle cx="120" cy="120" r="13" fill="var(--dial-aguja)" />
                    <circle cx="120" cy="120" r="5" fill="var(--bg)" />
                  </svg>
                </div>

                <div
                  className="mt-6 flex gap-2"
                  role="radiogroup"
                  aria-label="¿Cómo llegas hoy?"
                  onKeyDown={(e) => moverConFlechas(e, ESTADOS.length)}
                >
                  {ESTADOS.map((e, i) => {
                    const on = eleccion === e.id;
                    return (
                      <motion.button
                        key={e.id}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        tabIndex={eleccion ? (on ? 0 : -1) : i === 0 ? 0 : -1}
                        disabled={bloqueado && !on}
                        onClick={() => elegirYAvanzar(() => setEleccion(e.id), 5)}
                        whileTap={{ scale: 0.97 }}
                        initial={reduce ? false : { opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: reduce ? 0 : i * 0.06, duration: 0.3 }}
                        style={on ? { borderColor: e.color, boxShadow: `0 0 0 2px ${e.color}` } : undefined}
                        className={`flex min-h-16 flex-1 flex-col items-center justify-center gap-1 rounded-[var(--radius-card)] border px-2 py-3 transition-[border-color,box-shadow] duration-200 [touch-action:manipulation] ${
                          on
                            ? 'bg-[var(--surface)]'
                            : 'border-[color-mix(in_oklab,var(--text-tertiary)_45%,transparent)] bg-[var(--surface)]'
                        }`}
                      >
                        {/* Mismo círculo-check que los chips de los pasos 2 y 5: dos
                            indicadores distintos para la misma decisión se leen como
                            dos apps. El minutaje manda: es lo que ella está eligiendo.
                            2026-08-18, crítica de expertos #7: este anillo y el check
                            SIEMPRE eran lavanda, incluso al elegir "Energía" — el dial
                            (arriba) ya cambia a limón por estado; el selector no. */}
                        <span
                          aria-hidden="true"
                          style={on ? { backgroundColor: e.color } : undefined}
                          className={`flex size-5 shrink-0 items-center justify-center rounded-full ${
                            on ? '' : 'border-[1.5px] border-[var(--text-tertiary)] bg-transparent'
                          }`}
                        >
                          {on && <Check size={12} strokeWidth={3} color="var(--dial-aguja)" />}
                        </span>
                        <span className="text-[length:var(--txt-subtitle)] leading-none tabular-nums [font-family:var(--font-display)]">
                          {e.minutos} min
                        </span>
                        <span className="text-center text-[length:var(--txt-label)] leading-tight text-[var(--text-secondary)]">
                          {e.etiqueta}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                <p className="mt-3 min-h-12 text-center text-[length:var(--txt-body)] leading-snug text-[var(--text-secondary)]">
                  {estado ? estado.descripcion + '. ' + estado.frase : 'Toca el dial o elige abajo.'}
                </p>

                {/* Mismo remate que los pasos 2 y 5: son tres pantallas de decisión y
                    se resolvían con dos patrones distintos. */}
                <Cierre texto="Mañana lo vuelves a ajustar." alFondo />
              </div>
            </motion.section>
          )}

          {/* ═══ 5 — EL MOMENTO (anclaje contextual obligatorio de 02B) ═══ */}
          {paso === 5 && (
            <motion.section key="p5" variants={variantes} initial="entra" animate="centro" exit="sale" transition={trans} className="flex flex-1 flex-col">
              <h1 className={`mt-6 ${h1}`}>
                ¿Cuándo te queda un <span className="text-[var(--accent)]">hueco</span>?
              </h1>
              <p className="mt-2 text-[length:var(--txt-body)] text-[var(--text-secondary)]">
                Ahí te va a esperar tu ritual.
              </p>

              <div className="flex flex-1 flex-col pb-2">
                <div
                  className="my-auto flex flex-col gap-4"
                  role="radiogroup"
                  aria-label="¿Cuándo te queda un hueco?"
                  onKeyDown={(e) => moverConFlechas(e, MOMENTOS.length)}
                >
                  {MOMENTOS.map((m, i) => (
                    <Chip
                      key={m.id}
                      texto={m.chip}
                      activo={momento === m.id}
                      primero={i === 0}
                      hayElegido={momento !== null}
                      delay={i * 0.06}
                      onClick={() => elegirYAvanzar(() => setMomento(m.id), 6)}
                    />
                  ))}
                </div>
                <Cierre texto="Podrás cambiarlo cada mañana." />
              </div>
            </motion.section>
          )}

          {/* ═══ 6 — ARMANDO TU RITUAL (patrón Noom: esto ES el pitch) ═══ */}
          {paso === 6 && (
            <motion.section key="p6" variants={variantes} initial="entra" animate="centro" exit="sale" transition={trans} className="flex flex-1 flex-col">
              <div className="flex flex-1 flex-col justify-center">
                <h1 className={`text-center ${h1}`}>Armando tu ritual</h1>

                <ul className="mx-auto mt-10 flex w-full max-w-xs flex-col gap-4">
                  {LINEAS_ARMADO.map((l, i) => (
                    <motion.li
                      key={l}
                      initial={reduce ? false : { opacity: 0.25 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: reduce ? 0 : 0.2 + i * 0.7, duration: 0.35 }}
                      className="flex items-center gap-3 text-[length:var(--txt-body)]"
                    >
                      <motion.span
                        aria-hidden="true"
                        initial={reduce ? false : { scale: 0.4, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={
                          reduce
                            ? { duration: 0 }
                            : { type: 'spring', stiffness: 300, damping: 18, delay: 0.45 + i * 0.7 }
                        }
                        className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]"
                      >
                        <Check size={14} strokeWidth={3} color="var(--sobre-acento)" />
                      </motion.span>
                      {l}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.section>
          )}

          {/* ═══ 7 — SU RITUAL + LA PRIMERA VICTORIA ═══ */}
          {paso === 7 && estado && experiencia && (
            <motion.section key="p7" variants={variantes} initial="entra" animate="centro" exit="sale" transition={trans} className="flex flex-1 flex-col">
              <AnimatePresence mode="wait">
                {/* ── 7a: el ritual armado ── */}
                {fase === 'ritual' && (
                  <motion.div
                    key="f-ritual"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reduce ? 0 : 0.2 }}
                    className="flex flex-1 flex-col"
                  >
                    {/* py-4 + justify-center: un ritual de un solo paso (en reserva)
                        dejaba media pantalla vacía debajo del botón. */}
                    <div className="flex flex-1 flex-col justify-center py-4">
                    <p className="text-[length:var(--txt-label)] font-semibold uppercase tracking-[0.28em] text-[var(--text-secondary)]">
                      Listo
                    </p>
                    <h1 className={`mt-2 ${h1}`}>
                      Hoy entrenamos {CAPACIDADES[rutinaHoy.capacidad].posesivo}{' '}
                      <span className="text-[var(--accent)]">
                        {CAPACIDADES[rutinaHoy.capacidad].nombre.toLowerCase()}
                      </span>
                    </h1>
                    {/* ⚠️ Aquí decía "Al despertar, como pediste" — y era FALSO: el motor
                        no recibe el momento, así que los pasos vienen anclados a otras
                        franjas del día. La frase afirmaba una personalización que no
                        existe. Se devuelve el momento donde SÍ es cierto: en el cierre,
                        como intención suya para mañana, no como algo que NUA hizo. */}
                    <p className="mt-2 text-[length:var(--txt-body)] text-[var(--text-secondary)]">
                      {estado.frase}
                    </p>

                    {/* La card del resultado ENTRA celebrando: escala + conteo del número.
                        Celebración nivel 2 de FICHA-ARTE: reconoce, no lanza confeti. */}
                    <motion.div
                      initial={reduce ? false : { opacity: 0, scale: 0.94 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 180, damping: 16 }}
                      className="mt-6 flex items-center gap-4 rounded-[var(--radius-card)] px-4 py-4"
                      style={{ background: estado.color }}
                    >
                      <span className="shrink-0 text-4xl leading-none tabular-nums [font-family:var(--font-display)]">
                        {minutosContados}
                        <span className="ml-1 text-[length:var(--txt-body)]">min</span>
                      </span>
                      <span className="text-[length:var(--txt-body)] leading-snug">
                        <strong className="block text-[length:var(--txt-subtitle)]">
                          {rutinaHoy.bloques.length === 1 ? 'Un paso' : `${rutinaHoy.bloques.length} pasos`}
                        </strong>
                        Para {PROPOSITO_DEL_DIAL[estado.id].proposito}, no para cumplir.
                      </span>
                    </motion.div>

                    {/* 2026-08-18, crítica de expertos #3/#6: esta lista mostraba los
                        pasos del motor VIEJO (lib/rituales.ts) — un contenido genérico
                        que nunca era el que ella terminaba haciendo, porque el botón de
                        abajo la manda a `/rutina` con la rutina REAL (lib/rutinas.ts,
                        `rutinaHoy`). Ahora previsualiza los bloques de esa MISMA rutina:
                        lo que ve aquí es exactamente lo que va a vivir. */}
                    <ul className="mt-4 flex flex-col gap-2">
                      {rutinaHoy.bloques.map((b, i) => (
                        <motion.li
                          key={b.id}
                          initial={reduce ? false : { opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: reduce ? 0 : i * 0.06, duration: 0.3 }}
                          className="rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] px-4 py-3"
                        >
                          <div className="flex items-baseline justify-between gap-3">
                            <span className="text-[length:var(--txt-body)] font-semibold leading-tight">{b.titulo}</span>
                            <span className="shrink-0 text-[length:var(--txt-label)] tabular-nums text-[var(--text-secondary)]">
                              {duracion(Math.round((b.hasta - b.desde) * 60))}
                            </span>
                          </div>
                          <p className="mt-1 text-[length:var(--txt-label)] leading-snug text-[var(--text-secondary)]">
                            {b.guia}
                          </p>
                        </motion.li>
                      ))}
                    </ul>

                    </div>

                    {/* ACTIVAR: aquí ya no se lee, se HACE. Es el trabajo que faltaba.
                        STICKY: con 5 pasos la lista desborda y de la única acción
                        primaria solo asomaba una franja morada bajo el corte. */}
                    {/* Lleva a la RUTINA con nombre, no a un temporizador suelto: la
                        rutina es la experiencia completa (por qué existe → bloques con
                        su porqué → victoria con lo que se lleva). */}
                    <div className="sticky bottom-0 -mx-5 mt-2 bg-[var(--bg)] px-5 pb-2 pt-3">
                      {/* 2026-08-18, crítica de expertos (2ª ronda): `onboarding_completado`
                          se dispara al LLEGAR aquí (ver arriba, al cambiar a paso 7) — mide
                          "vio el cuestionario completo", no "vivió el ritual". Sin este
                          evento aparte, cuando lleguen datos reales no se podría distinguir
                          abandono del cuestionario de abandono DENTRO del ritual (hasta 20
                          min). `rutina_completada` (en /rutina) ya mide el otro extremo. */}
                      <motion.a
                        whileTap={{ scale: 0.97 }}
                        href={`/rutina?min=${estado.minutos}&id=${rutinaHoy.id}`}
                        onClick={() => void track('onboarding_ritual_iniciado', { duracion: estado.minutos })}
                        className={btn}
                      >
                        Empezar «{rutinaHoy.nombre}»
                        <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />
                      </motion.a>
                      <p className="mt-3 text-center text-[length:var(--txt-body)] text-[var(--text-secondary)]">
                        {estado.minutos} min · puedes parar cuando quieras.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* ── 7b: hecho — la victoria real, y recién ahora el precio ──
                    2026-08-18, crítica de expertos #3/#6: existía una fase "haciendo"
                    con un temporizador propio aquí, pero nada en el código la disparaba
                    nunca (`setFase('haciendo')` no se llamaba desde ningún lado) — el
                    botón de arriba manda directo a `/rutina`, que es donde vive el
                    ritual completo de verdad (bloques reales, incluido escribir).
                    Código muerto retirado; esta fase se alcanza solo al volver desde
                    el paywall (su botón de cerrar), ya con el ritual REAL terminado. */}
                {fase === 'hecho' && (
                  <motion.div
                    key="f-hecho"
                    initial={reduce ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="flex flex-1 flex-col"
                  >
                    <div className="flex flex-1 flex-col justify-center py-6">
                      <motion.span
                        aria-hidden="true"
                        initial={reduce ? false : { scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 14 }}
                        className="flex size-16 items-center justify-center rounded-full bg-[var(--accent)]"
                      >
                        <Check size={30} strokeWidth={3} color="var(--sobre-acento)" />
                      </motion.span>

                      {/* 2026-08-18: esta pantalla se alcanza DESPUÉS de vivir el ritual
                          completo en /rutina (no "solo el primer paso" — eso era del
                          motor viejo, ya retirado), así que ya no hace falta distinguir
                          entre "un paso" y "faltan N": ella ya terminó los suyos. */}
                      <h1 className={`mt-6 ${h1}`}>
                        Tu ritual de hoy, <span className="text-[var(--accent)]">hecho</span>
                      </h1>
                      <p className="mt-3 text-[length:var(--txt-body)] leading-relaxed text-[var(--text-secondary)]">
                        «{rutinaHoy.nombre}». Mañana se ajusta otra vez a cómo llegues.
                      </p>

                      {/* Lo que de verdad escribió en /rutina (guardarVictoria la deja en
                          `nua.teLlevas`) — antes esta caja mostraba una frase genérica del
                          motor viejo, sin relación con lo que ella acababa de vivir. */}
                      <div className="mt-8 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--accent)_30%,transparent)] bg-[var(--chip-bg)] px-4 py-4">
                        <p className="text-[length:var(--txt-label)] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                          Lo que te llevas
                        </p>
                        <p className="mt-2 text-[length:var(--txt-subtitle)] leading-snug [font-family:var(--font-display)]">
                          «{leeRecuerdo('nua.teLlevas') ?? rutinaHoy.victoria.teLlevas}»
                        </p>
                      </div>

                      {/* El momento que eligió se devuelve AQUÍ, como intención suya
                          para mañana ("cuando pase X, haré Y") — no como una promesa
                          de NUA: los recordatorios todavía no existen. */}
                      {momento && (
                        <p className="mt-6 text-center text-[length:var(--txt-body)] text-[var(--text-secondary)]">
                          Mañana te toca{' '}
                          <strong className="font-semibold text-[var(--text-primary)]">
                            {MOMENTOS.find((m) => m.id === momento)!.chip.toLowerCase()}
                          </strong>
                          .
                        </p>
                      )}

                      {/* El ancla emocional de FICHA-AVATAR: se repite en landing,
                          onboarding y paywall. Se había perdido en el rediseño. */}
                      <p className="mt-4 text-center text-[length:var(--txt-subtitle)] [font-family:var(--font-display)]">
                        Hoy también cuenta.
                      </p>
                    </div>

                    {/* El CTA dice a dónde lleva: "Guardar mi ritual" prometía guardar
                        y entregaba una página de precios. Y la garantía va con nombre
                        y plazo, que es la objeción #1 de la ficha. */}
                    <motion.a whileTap={{ scale: 0.97 }} href="/paywall" className={btn}>
                      Ver mi plan y guardarlo
                      <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />
                    </motion.a>
                    {/* La garantía sale del onboarding (decisión de la dueña): es una
                        objeción de COMPRA y su sitio es el paywall, no aquí. */}
                    <p className="mt-3 text-center text-[length:var(--txt-body)] leading-snug text-[var(--text-secondary)]">
                      Ves los precios antes de pagar nada.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

