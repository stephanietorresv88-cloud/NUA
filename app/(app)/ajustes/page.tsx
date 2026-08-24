'use client';

// AJUSTES — mínima pero real: sesión y salida. Pantalla secundaria (checklist,
// sin revisor-visual).

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, type Variants } from 'motion/react';
import { LogOut, Mail, Star } from 'lucide-react';
import { crearClienteNavegador } from '@/lib/supabase/client';
import { track } from '@/lib/analytics';
import { BotonNotificaciones } from '@/components/BotonNotificaciones';

const lista: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.05 } } };
const item: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export default function Ajustes() {
  const router = useRouter();
  const supabase = useMemo(() => crearClienteNavegador(), []);
  const [cargando, setCargando] = useState(true);
  const [correo, setCorreo] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [saliendo, setSaliendo] = useState(false);

  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (vivo) {
          setCorreo(user?.email ?? null);
          setUserId(user?.id);
        }
      } catch {
        // Sin sesión detectable, se ve como si no hubiera entrado.
      } finally {
        if (vivo) setCargando(false);
      }
    })();
    return () => {
      vivo = false;
    };
  }, [supabase]);

  const salir = async () => {
    if (saliendo) return;
    setSaliendo(true);
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <>
      <header className="px-5 pb-2 pt-4">
        <h1 className="text-[length:var(--txt-title)] leading-tight [font-family:var(--font-display)]">Ajustes</h1>
      </header>

      <motion.main
        variants={lista}
        initial="hidden"
        animate="visible"
        className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-5 pb-[var(--h-nav-inferior)] pt-2"
      >
        {cargando ? (
          <div className="skeleton h-24 w-full rounded-[var(--radius-card)]" aria-hidden="true" />
        ) : correo ? (
          <motion.div variants={item} className="flex flex-col gap-4">
            <div className="flex items-center gap-3 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] p-4">
              <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--chip-bg)]">
                <Mail size={20} strokeWidth={1.8} color="var(--accent)" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-[length:var(--txt-label)] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                  Tu cuenta
                </p>
                <p className="truncate text-[length:var(--txt-body)] font-medium">{correo}</p>
              </div>
            </div>

            <BotonNotificaciones userId={userId} />

            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={salir}
              disabled={saliendo}
              aria-busy={saliendo}
              className="flex h-12 items-center justify-center gap-2 rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_45%,transparent)] text-[length:var(--txt-body)] font-semibold text-[var(--text-secondary)] disabled:opacity-60 [touch-action:manipulation]"
            >
              <LogOut size={18} strokeWidth={2} aria-hidden="true" />
              {saliendo ? 'Saliendo…' : 'Cerrar sesión'}
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            variants={item}
            className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] px-6 py-10 text-center"
          >
            <p className="text-[length:var(--txt-body)] leading-snug text-[var(--text-secondary)]">
              Todavía no has entrado con tu correo.
            </p>
            <Link
              href="/entrar"
              className="mt-1 flex h-12 items-center rounded-[var(--radius-button)] bg-[var(--accent)] px-6 text-[length:var(--txt-body)] font-semibold text-[var(--sobre-acento)] [touch-action:manipulation]"
            >
              Entrar
            </Link>
          </motion.div>
        )}

        {!cargando && (
          <motion.div variants={item}>
            <TarjetaOpinion userId={userId} />
          </motion.div>
        )}
      </motion.main>
    </>
  );
}

/** Con o sin cuenta: cualquiera puede dejar su opinión, no está detrás del login. */
function TarjetaOpinion({ userId }: { userId?: string }) {
  const supabase = useMemo(() => crearClienteNavegador(), []);
  const [calificacion, setCalificacion] = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState(false);

  const enviar = async () => {
    if (enviando || calificacion === 0) return;
    setEnviando(true);
    setError(false);
    try {
      await supabase.from('feedback').insert({
        calificacion,
        comentario: comentario.trim() || null,
        user_id: userId ?? null,
      });
      void track('feedback_enviado', { calificacion }, userId);
      setEnviado(true);
    } catch {
      setError(true);
    } finally {
      setEnviando(false);
    }
  };

  if (enviado) {
    return (
      <div className="rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] px-6 py-8 text-center">
        <p className="text-[length:var(--txt-body)] font-medium">Gracias por tu opinión.</p>
        <p className="mt-1 text-[length:var(--txt-label)] text-[var(--text-secondary)]">
          La leemos todas — nos ayuda a decidir qué mejorar primero.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] p-4">
      <div>
        <p className="text-[length:var(--txt-label)] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
          Tu opinión
        </p>
        <p className="mt-0.5 text-[length:var(--txt-body)] font-medium">¿Cómo te va con NUA?</p>
      </div>

      <div role="radiogroup" aria-label="Califica NUA del 1 al 5" className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={calificacion === n}
            aria-label={`${n} de 5`}
            onClick={() => setCalificacion(n)}
            className="flex size-11 items-center justify-center [touch-action:manipulation]"
          >
            <Star
              size={26}
              strokeWidth={1.8}
              color="var(--accent)"
              fill={n <= calificacion ? 'var(--accent)' : 'transparent'}
              aria-hidden="true"
            />
          </button>
        ))}
      </div>

      <textarea
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        maxLength={1000}
        placeholder="¿Algo que mejorarías? (opcional)"
        rows={3}
        className="w-full rounded-[var(--radius-inner)] border border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)] bg-[var(--bg)] px-3 py-2 text-[length:var(--txt-body)] placeholder:text-[var(--text-tertiary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
      />

      {error && (
        <p role="alert" className="text-[length:var(--txt-label)] text-[var(--error)]">
          No se pudo enviar. Inténtalo otra vez.
        </p>
      )}

      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={enviar}
        disabled={calificacion === 0 || enviando}
        aria-busy={enviando}
        className="flex h-12 items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] text-[length:var(--txt-body)] font-semibold text-[var(--sobre-acento)] disabled:opacity-40 [touch-action:manipulation]"
      >
        {enviando ? 'Enviando…' : 'Enviar mi opinión'}
      </motion.button>
    </div>
  );
}
