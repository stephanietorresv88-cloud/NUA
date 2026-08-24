'use client';

// CHECKLIST DE PRIMEROS PASOS — vive arriba de /hoy, solo para quien todavía no
// completó los 4 pasos. Cada paso se marca solo, leyendo datos que la propia
// pantalla YA calcula (racha, cuenta, sesiones) — no hay un sistema de progreso
// paralelo que pueda desincronizarse. Minimizar/cerrar es solo un estado de UI
// (localStorage): no borra ni resetea ningún paso ya completado.
//
// Se cierra SOLO cuando las 4 están hechas, y queda cerrado para siempre — no
// vuelve a molestar a quien ya es de NUA hace tiempo.

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Check, ChevronDown, ChevronUp, X } from 'lucide-react';

export interface PasoChecklist {
  id: string;
  etiqueta: string;
  hecho: boolean;
}

const CLAVE_CERRADO = 'nua.primerosPasos.cerrado';
const CLAVE_MINIMIZADO = 'nua.primerosPasos.minimizado';

function recuerda(clave: string, valor: string) {
  try {
    window.localStorage.setItem(clave, valor);
  } catch {
    // Sin memoria entre visitas: el checklist puede volver a aparecer. No rompe nada.
  }
}

export function ChecklistPrimerosPasos({ pasos }: { pasos: PasoChecklist[] }) {
  const reduce = useReducedMotion();
  // Empieza oculto a propósito: recién se muestra tras leer localStorage, para
  // no destellar un checklist que la usuaria ya cerró hace días.
  const [listo, setListo] = useState(false);
  const [cerrado, setCerrado] = useState(true);
  const [minimizado, setMinimizado] = useState(false);

  useEffect(() => {
    try {
      setCerrado(window.localStorage.getItem(CLAVE_CERRADO) === '1');
      setMinimizado(window.localStorage.getItem(CLAVE_MINIMIZADO) === '1');
    } catch {
      // Sin memoria: se muestra abierto, es el default seguro.
    }
    setListo(true);
  }, []);

  const total = pasos.length;
  const completados = pasos.filter((p) => p.hecho).length;
  const todoListo = completados === total;

  // Se cierra para siempre en cuanto las 4 quedan hechas — una sola vez.
  useEffect(() => {
    if (listo && !cerrado && todoListo) recuerda(CLAVE_CERRADO, '1');
  }, [listo, cerrado, todoListo]);

  if (!listo || cerrado) return null;

  const cerrar = () => {
    recuerda(CLAVE_CERRADO, '1');
    setCerrado(true);
  };
  const alternarMinimizado = () => {
    const nuevo = !minimizado;
    recuerda(CLAVE_MINIMIZADO, nuevo ? '1' : '0');
    setMinimizado(nuevo);
  };

  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      aria-label="Primeros pasos"
      className="relative mb-4 overflow-hidden rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--accent)_28%,transparent)] bg-[var(--chip-bg)]"
    >
      <button
        type="button"
        onClick={alternarMinimizado}
        aria-expanded={!minimizado}
        className="flex min-h-11 w-full items-center justify-between gap-2 px-4 py-3 pr-11 text-left [touch-action:manipulation]"
      >
        <span className="text-[length:var(--txt-body)] font-semibold text-[var(--text-primary)]">
          Primeros pasos · {completados}/{total}
        </span>
        {minimizado ? (
          <ChevronDown size={16} strokeWidth={2.2} color="var(--text-secondary)" aria-hidden="true" className="shrink-0" />
        ) : (
          <ChevronUp size={16} strokeWidth={2.2} color="var(--text-secondary)" aria-hidden="true" className="shrink-0" />
        )}
      </button>

      <button
        type="button"
        onClick={cerrar}
        aria-label="Cerrar primeros pasos"
        className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full text-[var(--text-tertiary)] [touch-action:manipulation]"
      >
        <X size={15} strokeWidth={2} aria-hidden="true" />
      </button>

      <AnimatePresence initial={false}>
        {!minimizado && (
          <motion.ul
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.2 }}
            className="overflow-hidden px-4 pb-3"
          >
            {pasos.map((p) => (
              <li key={p.id} className="flex items-center gap-2.5 py-1.5">
                <span
                  aria-hidden="true"
                  className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${
                    p.hecho
                      ? 'border-[var(--accent)] bg-[var(--accent)]'
                      : 'border-[color-mix(in_oklab,var(--text-tertiary)_45%,transparent)]'
                  }`}
                >
                  {p.hecho && <Check size={12} strokeWidth={3} color="var(--sobre-acento)" aria-hidden="true" />}
                </span>
                <span
                  className={`text-[length:var(--txt-body)] leading-snug ${
                    p.hecho ? 'text-[var(--text-tertiary)] line-through' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {p.etiqueta}
                </span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
