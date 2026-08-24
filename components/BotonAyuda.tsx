'use client';

// BOTÓN FLOTANTE DE AYUDA — vive en el layout de la app (Hoy/Archivo/Ajustes),
// así que aparece en las tres sin que cada pantalla tenga que montarlo. Abre
// un panel con las MISMAS preguntas de la landing (docs/copy no duplica
// contenido nuevo — mismo texto, mismo tono, ya aprobado). No toca ninguna
// otra función: es un botón + un panel que se cierran solos.

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { CircleHelp, X } from 'lucide-react';

interface PreguntaFrecuente {
  pregunta: string;
  respuesta: string;
}

// Mismas 6 preguntas de la landing (app/page.tsx → <Faq items={...}>), sin
// texto MARCADO ([acento]/[b]) porque aquí no hay MarkedCopy — mismo
// contenido, plano.
const PREGUNTAS: PreguntaFrecuente[] = [
  {
    pregunta: '¿Y si un día no tengo tiempo para nada?',
    respuesta:
      'Marcas que hoy necesitas algo fácil y NUA te deja un ritual de cinco minutos. Ese día cuenta igual que los demás.',
  },
  {
    pregunta: 'Ya probé apps de hábitos y las abandoné.',
    respuesta:
      'Precisamente por eso existe NUA. Las apps tradicionales te piden lo mismo todos los días. NUA cambia lo que te pide según cómo llegas: hoy 20 minutos, mañana cinco. Los dos cuentan.',
  },
  {
    pregunta: '¿Me van a cobrar sin avisar?',
    respuesta:
      'No. El precio está siempre a la vista antes de pagar, no hay cobros escondidos, y cancelas cuando quieras desde tu área de compras de Hotmart.',
  },
  {
    pregunta: '¿Cuánto tardo en ver algo?',
    respuesta:
      'No hay que esperar semanas: tu primer ritual se adapta a cómo llegas hoy y lo haces ahora mismo. La meta no es que hagas más, es que encuentres algo que puedas sostener.',
  },
  {
    pregunta: '¿Es seguro pagar aquí?',
    respuesta: 'El cobro lo procesa Hotmart, no NUA: nunca vemos tu tarjeta. En México puedes pagar en OXXO y en Colombia por PSE.',
  },
  {
    pregunta: '¿Esto reemplaza a un profesional?',
    respuesta: 'No. NUA es autocuidado diario, no atención médica ni psicológica. Si estás pasando algo serio, busca ayuda profesional.',
  },
];

export function BotonAyuda() {
  const reduce = useReducedMotion();
  const [abierto, setAbierto] = useState(false);
  const [expandida, setExpandida] = useState<number | null>(null);

  // Cerrar con Escape — mismo patrón que el modal de hito de racha en /hoy.
  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbierto(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [abierto]);

  return (
    <>
      <motion.button
        type="button"
        whileTap={{ scale: 0.94 }}
        onClick={() => setAbierto(true)}
        aria-label="Ayuda y preguntas frecuentes"
        style={{ bottom: 'calc(var(--h-nav-inferior) + 16px)' }}
        className="fixed right-4 z-40 flex size-13 items-center justify-center rounded-full bg-[var(--surface)] text-[var(--accent)] shadow-[var(--shadow-2)] [touch-action:manipulation]"
      >
        <CircleHelp size={24} strokeWidth={1.9} aria-hidden="true" />
      </motion.button>

      <AnimatePresence>
        {abierto && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Ayuda y preguntas frecuentes"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.2 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-[color-mix(in_oklab,var(--text-primary)_45%,transparent)]"
            onClick={() => setAbierto(false)}
          >
            <motion.div
              initial={reduce ? false : { y: '100%' }}
              animate={{ y: 0 }}
              exit={reduce ? { opacity: 0 } : { y: '100%' }}
              transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 32 }}
              className="max-h-[80dvh] w-full max-w-md overflow-y-auto rounded-t-[var(--radius-card)] bg-[var(--surface)] px-5 pb-[calc(env(safe-area-inset-bottom)+20px)] pt-5 shadow-[var(--shadow-2)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-[length:var(--txt-title)] leading-tight [font-family:var(--font-display)]">
                  Preguntas frecuentes
                </h2>
                <button
                  type="button"
                  onClick={() => setAbierto(false)}
                  aria-label="Cerrar ayuda"
                  className="flex size-9 shrink-0 items-center justify-center rounded-full text-[var(--text-tertiary)] [touch-action:manipulation]"
                >
                  <X size={18} strokeWidth={2} aria-hidden="true" />
                </button>
              </div>

              <ul className="flex flex-col gap-1">
                {PREGUNTAS.map((p, i) => {
                  const abiertaEsta = expandida === i;
                  return (
                    <li key={p.pregunta} className="border-b border-[color-mix(in_oklab,var(--text-tertiary)_15%,transparent)] last:border-0">
                      <button
                        type="button"
                        onClick={() => setExpandida(abiertaEsta ? null : i)}
                        aria-expanded={abiertaEsta}
                        className="flex min-h-11 w-full items-center justify-between gap-3 py-3 text-left [touch-action:manipulation]"
                      >
                        <span className="text-[length:var(--txt-body)] font-semibold text-[var(--text-primary)]">
                          {p.pregunta}
                        </span>
                        <motion.span
                          animate={{ rotate: abiertaEsta ? 45 : 0 }}
                          transition={{ duration: reduce ? 0 : 0.15 }}
                          aria-hidden="true"
                          className="shrink-0 text-[18px] leading-none text-[var(--text-secondary)]"
                        >
                          +
                        </motion.span>
                      </button>
                      <AnimatePresence initial={false}>
                        {abiertaEsta && (
                          <motion.p
                            initial={reduce ? false : { height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                            transition={{ duration: reduce ? 0 : 0.2 }}
                            className="overflow-hidden text-[length:var(--txt-body)] leading-relaxed text-[var(--text-secondary)]"
                          >
                            <span className="block pb-3">{p.respuesta}</span>
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
