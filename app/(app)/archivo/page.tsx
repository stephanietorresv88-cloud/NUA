'use client';

// ARCHIVO — el historial completo del Archivo de Evidencias (`sesiones_rutina`).
// Pantalla secundaria (no de las 4 que deciden el dinero): medición + checklist,
// sin revisor-visual.

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, type Variants } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { crearClienteNavegador } from '@/lib/supabase/client';

interface EntradaArchivo {
  id: string;
  nombre: string;
  teLlevas: string;
  fecha: string;
}

const FECHA_LARGA = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long', year: 'numeric' });

const lista: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.05 } } };
const item: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export default function Archivo() {
  const supabase = useMemo(() => crearClienteNavegador(), []);
  const [cargando, setCargando] = useState(true);
  const [conSesion, setConSesion] = useState(false);
  const [entradas, setEntradas] = useState<EntradaArchivo[]>([]);

  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!vivo) return;
        setConSesion(Boolean(user));
        if (!user) return;

        const { data } = await supabase
          .from('sesiones_rutina')
          .select('id, nombre_rutina, te_llevas, created_at')
          .order('created_at', { ascending: false });
        if (!vivo || !data) return;
        setEntradas(data.map((s) => ({ id: s.id, nombre: s.nombre_rutina, teLlevas: s.te_llevas, fecha: s.created_at })));
      } catch {
        // El archivo vacío no rompe la pantalla: se ve el estado vacío.
      } finally {
        if (vivo) setCargando(false);
      }
    })();
    return () => {
      vivo = false;
    };
  }, [supabase]);

  const vacio = !cargando && (!conSesion || entradas.length === 0);

  return (
    <>
      {/* Sin flecha de "volver": Archivo es una pestaña raíz de la nav, igual que
          Hoy y Ajustes, no una subpágina — mismo patrón de header en las 3
          (hallazgo del revisor-visual, 2026-08-17). */}
      <header className="px-5 pb-2 pt-4">
        <h1 className="text-[length:var(--txt-title)] leading-tight [font-family:var(--font-display)]">
          Tu archivo
        </h1>
      </header>

      <motion.main
        variants={lista}
        initial="hidden"
        animate="visible"
        className={`mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-[var(--h-nav-inferior)] pt-2 ${vacio ? 'justify-center' : ''}`}
      >
        {cargando ? (
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map((n) => (
              <div key={n} className="skeleton h-24 w-full rounded-[var(--radius-card)]" aria-hidden="true" />
            ))}
          </div>
        ) : !conSesion ? (
          <motion.div
            variants={item}
            className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] px-6 py-10 text-center"
          >
            <span aria-hidden="true" className="flex size-12 items-center justify-center rounded-full bg-[var(--chip-bg)]">
              <Sparkles size={22} strokeWidth={1.8} color="var(--accent)" aria-hidden="true" />
            </span>
            <p className="text-[length:var(--txt-body)] leading-snug text-[var(--text-secondary)]">
              Tu archivo se guarda cuando entras con tu correo. Ahora mismo tu última rutina se ve solo en Hoy.
            </p>
            <Link
              href="/entrar"
              className="mt-1 flex h-12 items-center rounded-[var(--radius-button)] bg-[var(--accent)] px-6 text-[length:var(--txt-body)] font-semibold text-[var(--sobre-acento)] [touch-action:manipulation]"
            >
              Entrar
            </Link>
          </motion.div>
        ) : entradas.length === 0 ? (
          <motion.div
            variants={item}
            className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] px-6 py-10 text-center"
          >
            <span aria-hidden="true" className="flex size-12 items-center justify-center rounded-full bg-[var(--chip-bg)]">
              <Sparkles size={22} strokeWidth={1.8} color="var(--accent)" aria-hidden="true" />
            </span>
            <p className="text-[length:var(--txt-body)] leading-snug text-[var(--text-secondary)]">
              Tu primera victoria va a vivir aquí en cuanto termines tu primer ritual.
            </p>
            <Link
              href="/hoy"
              className="mt-1 flex h-12 items-center rounded-[var(--radius-button)] bg-[var(--accent)] px-6 text-[length:var(--txt-body)] font-semibold text-[var(--sobre-acento)] [touch-action:manipulation]"
            >
              Ir a tu ritual de hoy
            </Link>
          </motion.div>
        ) : (
          <ul className="flex flex-col gap-3">
            {entradas.map((e) => (
              <motion.li
                key={e.id}
                variants={item}
                className="rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] p-4"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-[length:var(--txt-body)] font-semibold">{e.nombre}</span>
                  <span className="shrink-0 text-[length:var(--txt-label)] tabular-nums text-[var(--text-tertiary)]">
                    {FECHA_LARGA.format(new Date(e.fecha))}
                  </span>
                </div>
                <p className="mt-1 text-[length:var(--txt-body)] leading-snug text-[var(--text-secondary)]">«{e.teLlevas}»</p>
              </motion.li>
            ))}
          </ul>
        )}
      </motion.main>
    </>
  );
}
