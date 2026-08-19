'use client';

// ENTRAR — el acceso de NUA.
//
// MÉTODO: código de 6 dígitos al correo, SIN CONTRASEÑA. No es una preferencia:
// es lo que manda `26-AUTH-MODERNO.md` para una app vendida por Hotmart. El
// webhook crea la usuaria sin contraseña cuando compra, y entra con el mismo
// correo con el que pagó. Añadir contraseñas a este flujo solo suma fricción
// (crearla, olvidarla, resetearla es el ticket #1 de soporte) sin aportar nada.
//
// EL CAMPO DEL CÓDIGO VA VISIBLE tras enviar, no escondido tras un enlace. El
// fallo #1 del enlace mágico solo: ella empieza en un navegador y el correo se
// abre en OTRO, así que la sesión se crea en el sitio equivocado. El código se
// escribe donde empezó.
//
// LA RUTA DE RESCATE ("compré y no me llega") es parte del login desde el día 1,
// no un extra: es el momento en que alguien que YA PAGÓ se queda fuera.
//
// ⚠️ Passkeys (entrar con huella) van DESPUÉS, tras la primera victoria — nunca
// en el primer login, donde competirían con el momento de valor.

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Mail } from 'lucide-react';
import { crearClienteNavegador } from '@/lib/supabase/client';
import { migrarOnboardingAnonimo } from '@/lib/migrar-onboarding';

const CORREO_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Entrar() {
  const router = useRouter();
  const [paso, setPaso] = useState<'correo' | 'codigo'>('correo');
  const [correo, setCorreo] = useState('');
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const [ayuda, setAyuda] = useState(false);
  const reduce = useReducedMotion();
  const campoCodigo = useRef<HTMLInputElement>(null);
  const supabase = useMemo(() => crearClienteNavegador(), []);

  useEffect(() => {
    if (paso === 'codigo') campoCodigo.current?.focus();
  }, [paso]);

  const enviar = async () => {
    if (enviando) return; // anti doble-tap
    if (!CORREO_OK.test(correo.trim())) {
      // Error con qué pasó Y qué hacer, nunca un código técnico.
      setError('Revisa el correo: parece que falta algo.');
      return;
    }
    setError(null);
    setEnviando(true);

    // shouldCreateUser: false — solo entra quien ya compró (el webhook de
    // Hotmart es quien crea la cuenta). El error se generaliza para no revelar
    // si el correo existe o no (anti-enumeración, 26-AUTH-MODERNO).
    const { error: err } = await supabase.auth.signInWithOtp({
      email: correo.trim(),
      options: { shouldCreateUser: false },
    });

    setEnviando(false);

    if (err) {
      setError('No pudimos enviar el código. Revisa el correo e intenta otra vez.');
      return;
    }

    setPaso('codigo');
  };

  const confirmar = async () => {
    if (verificando || codigo.length < 6) return;
    setVerificando(true);
    setError(null);

    const { error: err } = await supabase.auth.verifyOtp({
      email: correo.trim(),
      token: codigo,
      type: 'email',
    });

    if (err) {
      setVerificando(false);
      setError('Ese código no es válido, o ya venció. Pide uno nuevo.');
      return;
    }

    await migrarOnboardingAnonimo(supabase);
    router.push('/rutina');
  };

  const btn =
    'flex h-14 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--accent)] text-[length:var(--txt-body)] font-semibold text-[var(--sobre-acento)] shadow-[var(--shadow-2)] [touch-action:manipulation] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]';
  const campo =
    'w-full rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_45%,transparent)] bg-[var(--surface)] px-4 py-3 text-[length:var(--txt-body)] placeholder:text-[var(--text-tertiary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]';

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--bg)] text-[var(--text-primary)] [font-family:var(--font-body)]">
      {/* Marca + salida: dónde estoy, qué app es, cómo vuelvo (52 §6). */}
      <header className="flex items-center justify-between px-5 pt-4">
        <Link
          href="/"
          aria-label="NUA — ir al inicio"
          className="-ml-1 flex h-11 items-center text-[length:var(--txt-body)] font-semibold tracking-[0.2em] text-[var(--accent)] [font-family:var(--font-display)] [touch-action:manipulation]"
        >
          NUA
        </Link>
        {paso === 'codigo' && (
          <button
            type="button"
            onClick={() => {
              setPaso('correo');
              setCodigo('');
              setError(null);
            }}
            className="flex h-11 items-center px-2 text-[length:var(--txt-body)] text-[var(--text-secondary)] underline underline-offset-4 [touch-action:manipulation]"
          >
            Cambiar correo
          </button>
        )}
      </header>

      <main className="flex flex-1 flex-col px-5 pb-8">
        <AnimatePresence mode="wait">
          {/* ── 1. EL CORREO ── */}
          {paso === 'correo' && (
            <motion.section
              key="correo"
              initial={reduce ? false : { opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-1 flex-col"
            >
              <div className="flex flex-1 flex-col justify-center py-6">
                <h1 className="text-[length:var(--txt-title)] leading-tight [font-family:var(--font-display)]">
                  Entra con tu <span className="text-[var(--accent)]">correo</span>
                </h1>
                <p className="mt-3 text-[length:var(--txt-body)] leading-relaxed text-[var(--text-secondary)]">
                  El mismo con el que compraste. Sin contraseñas que recordar.
                </p>

                <div className="mt-8">
                  <label
                    htmlFor="correo"
                    className="block text-[length:var(--txt-label)] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]"
                  >
                    Tu correo
                  </label>
                  <input
                    id="correo"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={correo}
                    onChange={(e) => {
                      setCorreo(e.target.value);
                      setError(null);
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && enviar()}
                    placeholder="tunombre@correo.com"
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? 'correo-error' : undefined}
                    className={`mt-2 ${campo}`}
                  />
                  {error && (
                    <p
                      id="correo-error"
                      role="alert"
                      className="mt-2 text-[length:var(--txt-body)] text-[var(--error)]"
                    >
                      {error}
                    </p>
                  )}
                </div>

              </div>

              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={enviar}
                aria-busy={enviando}
                className={btn}
              >
                {enviando ? 'Enviando…' : 'Enviarme el código'}
                <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />
              </motion.button>

              <p className="mt-4 text-center text-[length:var(--txt-body)] text-[var(--text-secondary)]">
                ¿Todavía no eres de NUA?{' '}
                <Link href="/onboarding" className="font-semibold text-[var(--accent)] underline underline-offset-4">
                  Arma tu ritual
                </Link>
              </p>
            </motion.section>
          )}

          {/* ── 2. EL CÓDIGO — visible, no escondido tras un enlace ── */}
          {paso === 'codigo' && (
            <motion.section
              key="codigo"
              initial={reduce ? false : { opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-1 flex-col"
            >
              <div className="flex flex-1 flex-col justify-center py-6">
                <span
                  aria-hidden="true"
                  className="flex size-14 items-center justify-center rounded-full bg-[var(--chip-bg)]"
                >
                  <Mail size={24} strokeWidth={1.8} color="var(--accent)" />
                </span>

                <h1 className="mt-6 text-[length:var(--txt-title)] leading-tight [font-family:var(--font-display)]">
                  Te mandamos un <span className="text-[var(--accent)]">código</span>
                </h1>
                <p className="mt-3 text-[length:var(--txt-body)] leading-relaxed text-[var(--text-secondary)]">
                  A {correo}. Escríbelo aquí, o toca el enlace del correo.
                </p>

                <div className="mt-8">
                  <label
                    htmlFor="codigo"
                    className="block text-[length:var(--txt-label)] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]"
                  >
                    Los 6 dígitos
                  </label>
                  <input
                    id="codigo"
                    ref={campoCodigo}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={codigo}
                    onChange={(e) => {
                      setCodigo(e.target.value.replace(/\D/g, ''));
                      setError(null);
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && confirmar()}
                    placeholder="000000"
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? 'codigo-error' : undefined}
                    className={`mt-2 text-center text-[length:var(--txt-title)] tracking-[0.4em] tabular-nums [font-family:var(--font-display)] ${campo}`}
                  />
                  {error && (
                    <p
                      id="codigo-error"
                      role="alert"
                      className="mt-2 text-[length:var(--txt-body)] text-[var(--error)]"
                    >
                      {error}
                    </p>
                  )}
                </div>

                {/* RUTA DE RESCATE — "compré y no me llega". Va aquí desde el día 1:
                    es el momento exacto en que alguien que YA PAGÓ se queda fuera. */}
                <div className="mt-8">
                  <button
                    type="button"
                    onClick={() => setAyuda((a) => !a)}
                    aria-expanded={ayuda}
                    className="flex min-h-11 items-center text-[length:var(--txt-body)] text-[var(--text-secondary)] underline underline-offset-4 [touch-action:manipulation]"
                  >
                    No me llegó el código
                  </button>
                  <AnimatePresence initial={false}>
                    {ayuda && (
                      <motion.div
                        initial={reduce ? false : { height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                        transition={{ duration: reduce ? 0 : 0.2 }}
                        className="overflow-hidden"
                      >
                        <ul className="mt-2 flex list-disc flex-col gap-2 pl-5 text-[length:var(--txt-body)] leading-snug text-[var(--text-secondary)]">
                          <li>Mira en spam o en la pestaña de promociones.</li>
                          <li>Comprueba que sea el mismo correo con el que compraste.</li>
                          <li>El código caduca a los diez minutos: pide otro y usa el último.</li>
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={confirmar}
                disabled={codigo.length < 6 || verificando}
                aria-busy={verificando}
                className={`${btn} disabled:opacity-40`}
              >
                {verificando ? 'Entrando…' : 'Entrar'}
                <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />
              </motion.button>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
