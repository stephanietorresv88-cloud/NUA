'use client';

// ENCUESTA DE SATISFACCIÓN (CSAT) — ventanita emergente e independiente.
// Guarda en la MISMA tabla `feedback` que ya usa la tarjeta de Ajustes (mismo
// dato, un solo lugar para verlo en el panel) — pero el mecanismo de cuándo
// aparecer es propio de este componente y no toca nada de Ajustes.
//
// Reglas de cuándo aparece (pedido de la dueña, 2026-08-21):
//   - Al menos 4 días de uso real (perfiles.created_at con cuenta; primera
//     visita en localStorage sin cuenta).
//   - Máximo una vez al mes — se marca "mostrada" en cuanto aparece, aunque
//     la cierren sin contestar, para no volver a insistir antes de tiempo.
//   - Vive en el layout de Hoy/Archivo/Ajustes, nunca en /rutina — no
//     interrumpe un ritual en curso.

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { crearClienteNavegador } from '@/lib/supabase/client';
import { track } from '@/lib/analytics';

const DIAS_MINIMOS_DE_USO = 4;
const DIAS_ENTRE_ENCUESTAS = 30;
const CLAVE_ULTIMA_VEZ = 'nua.encuesta.ultimaVezMostrada';
const CLAVE_PRIMERA_VEZ = 'nua.encuesta.primeraVez';

function recuerda(clave: string, valor: string) {
  try {
    window.localStorage.setItem(clave, valor);
  } catch {
    // Sin memoria entre visitas: puede volver a preguntar antes de un mes. No rompe nada.
  }
}
function leeRecuerdo(clave: string): string | null {
  try {
    return window.localStorage.getItem(clave);
  } catch {
    return null;
  }
}

const NIVELES: { valor: 1 | 2 | 3 | 4 | 5; etiqueta: string; color: string }[] = [
  { valor: 1, etiqueta: 'Muy insatisfecha', color: '#A4443F' },
  { valor: 2, etiqueta: 'Insatisfecha', color: '#BE7448' },
  { valor: 3, etiqueta: 'Neutral', color: '#B8863C' },
  { valor: 4, etiqueta: 'Contenta', color: '#8FA05C' },
  { valor: 5, etiqueta: 'Muy contenta', color: '#5F8F5A' },
];

/** Cara SVG propia (nunca emoji-icono, FICHA-ARTE): la curva de la boca cambia
 *  de triste a feliz, mismo trazo en las 5. */
function Cara({ nivel, color }: { nivel: 1 | 2 | 3 | 4 | 5; color: string }) {
  const curvas: Record<number, string> = {
    1: 'M9 17 Q12 13 15 17',
    2: 'M9 16 Q12 14 15 16',
    3: 'M9 15 L15 15',
    4: 'M9 14 Q12 16 15 14',
    5: 'M8 13 Q12 18 16 13',
  };
  return (
    <svg viewBox="0 0 24 24" width={30} height={30} aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill={color} opacity={0.16} />
      <circle cx="12" cy="12" r="11" fill="none" stroke={color} strokeWidth={1.4} />
      <circle cx="8.5" cy="10" r="1.1" fill={color} />
      <circle cx="15.5" cy="10" r="1.1" fill={color} />
      <path d={curvas[nivel]} fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </svg>
  );
}

export function EncuestaSatisfaccion() {
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [respondido, setRespondido] = useState(false);

  useEffect(() => {
    let vivo = true;
    (async () => {
      // Ya se mostró hace menos de 30 días: no se evalúa nada más.
      const ultimaVez = leeRecuerdo(CLAVE_ULTIMA_VEZ);
      if (ultimaVez) {
        const dias = (Date.now() - Number(ultimaVez)) / 86_400_000;
        if (dias < DIAS_ENTRE_ENCUESTAS) return;
      }

      let inicio: number | null = null;
      try {
        const supabase = crearClienteNavegador();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: perfil } = await supabase.from('perfiles').select('created_at').eq('id', user.id).maybeSingle();
          if (perfil?.created_at) inicio = new Date(perfil.created_at).getTime();
        }
      } catch {
        // Sin sesión o sin red: se sigue con la marca local de abajo.
      }

      if (inicio === null) {
        let marca = leeRecuerdo(CLAVE_PRIMERA_VEZ);
        if (!marca) {
          marca = String(Date.now());
          recuerda(CLAVE_PRIMERA_VEZ, marca);
        }
        inicio = Number(marca);
      }

      const diasDeUso = (Date.now() - inicio) / 86_400_000;
      if (!vivo || diasDeUso < DIAS_MINIMOS_DE_USO) return;

      // Se marca "mostrada" YA, aunque la cierren sin contestar — el tope es
      // "cuántas veces aparece", no "cuántas veces contesta".
      recuerda(CLAVE_ULTIMA_VEZ, String(Date.now()));
      // Pequeño respiro tras cargar la pantalla, para no aparecer de golpe
      // encima de lo primero que ve al abrir la app.
      window.setTimeout(() => {
        if (vivo) setVisible(true);
      }, 1200);
    })();
    return () => {
      vivo = false;
    };
  }, []);

  const elegir = async (nivel: 1 | 2 | 3 | 4 | 5) => {
    if (enviando) return;
    setEnviando(true);
    try {
      const supabase = crearClienteNavegador();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      await supabase.from('feedback').insert({ calificacion: nivel, comentario: null, user_id: user?.id ?? null });
      void track('csat_respondido', { calificacion: nivel }, user?.id);
    } catch {
      // Si falla el guardado, igual se agradece — no se le pide reintentar
      // una encuesta de un solo toque.
    } finally {
      setEnviando(false);
      setRespondido(true);
      window.setTimeout(() => setVisible(false), 1400);
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Encuesta de satisfacción"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[color-mix(in_oklab,var(--text-primary)_40%,transparent)] px-6"
          onClick={() => setVisible(false)}
        >
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
            transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 24 }}
            className="w-full max-w-xs rounded-[20px] bg-white px-6 py-7 text-center shadow-[var(--shadow-2)]"
            onClick={(e) => e.stopPropagation()}
          >
            {respondido ? (
              <p className="text-[length:var(--txt-body)] font-medium text-[#26232e]">
                Gracias por contarnos cómo vas.
              </p>
            ) : (
              <>
                <p className="text-[length:var(--txt-body)] font-semibold leading-snug text-[#26232e]">
                  ¿Qué tan feliz estás usando NUA?
                </p>
                <div role="radiogroup" aria-label="Calificación del 1 al 5" className="mt-5 flex justify-between gap-1">
                  {NIVELES.map((n) => (
                    <button
                      key={n.valor}
                      type="button"
                      role="radio"
                      aria-checked={false}
                      aria-label={n.etiqueta}
                      disabled={enviando}
                      onClick={() => elegir(n.valor)}
                      className="flex size-11 items-center justify-center rounded-full [touch-action:manipulation] disabled:opacity-60"
                    >
                      <Cara nivel={n.valor} color={n.color} />
                    </button>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
