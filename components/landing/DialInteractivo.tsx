'use client';

// AÑADIDO AL KIT — vive en el SLOT VISUAL DEL HERO (Hero.visual), sustituyendo al
// placeholder punteado. Justificación en ESTADO.md.
// Por qué ahí: el mecanismo de NUA se ENTIENDE tocándolo. Que la visitante mueva el
// dial en la PRIMERA pantalla convierte la promesa en producto antes de pedirle un
// dato — es la prueba día-1 que sustituye a los testimonios que todavía no existen.
//
// EL COLOR ES LENGUAJE (FICHA-ARTE): cada estado pinta su zona del dial y la tarjeta
// del resultado. El amarillo mantequilla aparece SOLO en energía.

import { useEffect, useState } from 'react';
import { animate, motion, useReducedMotion } from 'motion/react';
import { Feather, ListChecks, NotebookPen, PenLine, Waves, Wind } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { rutinasDe, type Bloque, type DuracionRutina } from '@/lib/rutinas';

type EstadoId = 'reserva' | 'media' | 'energia';

interface Estado {
  id: EstadoId;
  etiqueta: string;
  /** Grados de la aguja: -60 izquierda · 0 arriba · 60 derecha. */
  angulo: number;
  /** Token del color del estado (FICHA-ARTE → "el color es lenguaje"). */
  color: string;
  minutos: DuracionRutina;
  lectura: string;
  frase: string;
}

// ⚠️ Auditoría 2026-08-17: esto ANTES mostraba una rutina inventada (3/10/30 min,
// "Respirar 4-7-8" genérico) que no existía en la app real — quien pagaba por lo
// que veía aquí recibía otra cosa. Ahora es la MISMA rutina que ella haría de
// verdad en /hoy: la primera de cada duración en `lib/rutinas.ts` (las que
// escribió la propia dueña, no las 26 que el agente escribió después).
const ICONO_POR_TIPO: Record<Bloque['tipo'], LucideIcon> = {
  ensayar: Wind,
  escribir: NotebookPen,
  leer: Feather,
  elegir: ListChecks,
  completar: PenLine,
  hacer: Waves,
};

const ESTADOS: Estado[] = [
  {
    id: 'reserva',
    etiqueta: 'Reserva',
    angulo: -60,
    color: 'var(--estado-reserva)',
    minutos: 5,
    lectura: 'Hoy llegas en reserva.',
    frase: 'Hoy toca cuidarte, no exigirte.',
  },
  {
    id: 'media',
    etiqueta: 'Media',
    angulo: 0,
    color: 'var(--estado-media)',
    minutos: 15,
    lectura: 'Hoy llegas a media.',
    frase: 'Mantén lo esencial. Ni más, ni menos.',
  },
  {
    id: 'energia',
    etiqueta: 'Energía',
    angulo: 60,
    color: 'var(--estado-energia)',
    minutos: 20,
    lectura: 'Hoy llegas con energía.',
    frase: 'Hoy puedes hacer más. Aprovechémoslo.',
  },
];

/** Arcos del dial: 3 zonas, geometría fija (r=88, centro 120/120). */
const ARCOS: { id: EstadoId; d: string }[] = [
  { id: 'reserva', d: 'M32 118.5 A88 88 0 0 1 73.4 45.4' },
  { id: 'media', d: 'M78.7 42.3 A88 88 0 0 1 161.3 42.3' },
  { id: 'energia', d: 'M166.6 45.4 A88 88 0 0 1 208 118.5' },
];

/** Flechas izquierda/derecha mueven Y seleccionan dentro del radiogroup del dial
 *  (mismo patrón que /hoy — la selección sigue al foco, patrón ARIA de radiogroup). */
function moverConFlechas(e: React.KeyboardEvent<HTMLDivElement>, ids: EstadoId[], elegir: (id: EstadoId) => void) {
  if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
  e.preventDefault();
  const radios = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]'));
  const actual = radios.indexOf(document.activeElement as HTMLElement);
  const paso = e.key === 'ArrowRight' ? 1 : -1;
  const siguiente = (Math.max(0, actual) + paso + ids.length) % ids.length;
  radios[siguiente]?.focus();
  elegir(ids[siguiente]!);
}

/** Conteo animado del número héroe (baseline 2 de las 7 de CLAUDE.md): un "10"
 *  nunca aparece estático, cuenta hasta su valor. Respeta reduced-motion. */
function useConteo(objetivo: number, reduce: boolean | null) {
  const [valor, setValor] = useState(objetivo);
  useEffect(() => {
    if (reduce) {
      setValor(objetivo);
      return;
    }
    const control = animate(0, objetivo, {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setValor(Math.round(v)),
    });
    return () => control.stop();
  }, [objetivo, reduce]);
  return valor;
}

/** La tarjeta del dial, sin envoltura de sección: se usa en el HERO (slot visual)
 *  y también puede vivir suelta. Es la prueba día-1 de NUA — el producto se toca
 *  antes de pedir un solo dato. */
export function DialCard() {
  const [activoId, setActivoId] = useState<EstadoId>('media');
  const reduce = useReducedMotion();
  const activo = ESTADOS.find((e) => e.id === activoId) ?? ESTADOS[1]!;
  const minutos = useConteo(activo.minutos, reduce);
  // La primera rutina de cada duración: la que escribió la propia dueña, la
  // misma que corre hoy en /hoy y /rutina — no un ejemplo aparte.
  const rutina = rutinasDe(activo.minutos)[0]!;

  return (
    /* text-left: el slot visual del hero está centrado y los pasos deben leerse
       alineados a la izquierda como una lista, no centrados. */
    <div className="w-full text-left">
      <div className="mx-auto w-full max-w-xl rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] p-5 shadow-[var(--shadow-2)] md:p-6">
        <p className="mb-4 text-center text-sm font-semibold text-[var(--text-secondary)]">
          ¿Cómo llegas hoy? <span className="text-[var(--accent)]">Tócalo.</span>
        </p>
          {/* ── Selector de estado ── */}
          <div
            role="radiogroup"
            aria-label="¿Cómo llegas hoy?"
            onKeyDown={(e) => moverConFlechas(e, ESTADOS.map((es) => es.id), setActivoId)}
            className="mx-auto flex max-w-sm gap-1 rounded-[var(--radius-card)] bg-[var(--surface-2)] p-1"
          >
            {ESTADOS.map((e) => {
              const on = e.id === activoId;
              return (
                <motion.button
                  key={e.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setActivoId(e.id)}
                  whileTap={{ scale: 0.97 }}
                  className={`min-h-11 flex-1 rounded-[var(--radius-card)] px-2 text-sm transition-colors duration-150 [touch-action:manipulation] ${
                    on
                      ? 'bg-[var(--surface)] font-bold text-[var(--text-primary)] shadow-[var(--shadow-1)]'
                      : 'font-medium text-[var(--text-secondary)]'
                  }`}
                >
                  {e.etiqueta}
                </motion.button>
              );
            })}
          </div>

          {/* ── El dial ── */}
          <div className="mt-6 flex flex-col items-center">
            <svg
              viewBox="0 0 240 150"
              className="block w-56 max-w-full"
              role="img"
              aria-label={`Nivel de energía: ${activo.etiqueta}. Ritual de ${activo.minutos} minutos.`}
            >
              <g fill="none" strokeLinecap="round" strokeWidth={25}>
                {ARCOS.map((a) => {
                  const esActivo = a.id === activoId;
                  const color = ESTADOS.find((e) => e.id === a.id)!.color;
                  return (
                    <motion.path
                      key={a.id}
                      d={a.d}
                      /* Baseline 3 de las 7: el arco se DIBUJA al entrar en vista
                         (pathLength 0→1), no aparece de golpe. */
                      /* El stroke va también en initial: si solo se declara en
                         animate, motion parte de "undefined" y avisa. */
                      initial={
                        reduce
                          ? false
                          : { pathLength: 0, stroke: esActivo ? color : 'var(--dial-inactivo)' }
                      }
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true, amount: 0.4 }}
                      animate={{ stroke: esActivo ? color : 'var(--dial-inactivo)' }}
                      transition={{
                        pathLength: { duration: reduce ? 0 : 0.7, ease: [0.16, 1, 0.3, 1] },
                        stroke: { duration: reduce ? 0 : 0.3 },
                      }}
                    />
                  );
                })}
              </g>
              <motion.g
                animate={{ rotate: activo.angulo }}
                transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 140, damping: 14 }}
                style={{ originX: '120px', originY: '120px' }}
              >
                <path d="M120 120 L120 50" stroke="var(--dial-aguja)" strokeWidth={7} strokeLinecap="round" />
              </motion.g>
              <circle cx="120" cy="120" r="13" fill="var(--dial-aguja)" />
              <circle cx="120" cy="120" r="5" fill="var(--bg)" />
            </svg>

            <p className="mt-3 text-xl leading-tight text-[var(--text-primary)] [font-family:var(--font-display)]">
              {activo.lectura}
            </p>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">{activo.frase}</p>
          </div>

          {/* ── El resultado, en el color del estado ── */}
          <motion.div
            animate={{ backgroundColor: activo.color }}
            transition={{ duration: reduce ? 0 : 0.3 }}
            className="mt-6 flex items-center gap-4 rounded-[var(--radius-card)] px-4 py-3"
          >
            <span className="shrink-0 text-3xl leading-none tabular-nums text-[var(--text-primary)] [font-family:var(--font-display)]">
              {minutos}
              <span className="ml-1 text-xs">min</span>
            </span>
            <span className="min-w-0 text-xs leading-snug text-[var(--text-primary)]">
              <strong className="block truncate text-sm font-bold">{rutina.nombre}</strong>
              {rutina.bloques.length} pasos.
            </span>
          </motion.div>

          {/* ── Los pasos: los bloques REALES de esta rutina ── */}
          <ul className="mt-4 flex flex-col gap-2">
            {rutina.bloques.map((bloque, n) => {
              const Icono = ICONO_POR_TIPO[bloque.tipo];
              const minBloque = Math.round((bloque.hasta - bloque.desde) * 10) / 10;
              return (
                <motion.li
                  key={bloque.id}
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduce ? 0 : 0.25, delay: reduce ? 0 : n * 0.05 }}
                  className="flex items-center gap-3 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--bg)] px-3 py-3"
                >
                  <span
                    aria-hidden="true"
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--chip-bg)]"
                  >
                    <Icono size={18} strokeWidth={1.8} color="var(--accent)" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium leading-tight text-[var(--text-primary)]">
                      {bloque.titulo}
                    </span>
                    <span className="block text-xs text-[var(--text-secondary)]">{minBloque} min</span>
                  </span>
                </motion.li>
              );
            })}
          </ul>
      </div>
    </div>
  );
}
