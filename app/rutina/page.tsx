'use client';

// EL REPRODUCTOR DE RUTINAS — donde la lista de ejercicios se convierte en
// experiencia. Cada bloque responde una pregunta distinta y ella siempre sabe
// en cuál está.
//
// Regla que gobierna esta pantalla (dueña, 2026-08-14): en todo momento debe
// poder contestar «qué estoy haciendo · por qué lo hago · qué entreno · qué
// observo · qué gané». Si un bloque no responde ninguna, sobra.
//
// El porqué de cada bloque va como UNA LÍNEA corta, no como una caja: quien
// llega aquí viene escapando del agobio, no a leer explicaciones.

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import Lottie from 'lottie-react';
import { CAPACIDADES } from '@/lib/rituales';
import { rutinaPara, type Bloque, type DuracionRutina } from '@/lib/rutinas';
import { crearClienteNavegador } from '@/lib/supabase/client';
import { track, trackAhaAlcanzado } from '@/lib/analytics';
import { fechaLocal } from '@/lib/racha';
import chispa from '@/public/lottie/tap-burst.json';

const DURACIONES: DuracionRutina[] = [5, 15, 20];

function guarda(clave: string, valor: string) {
  try {
    window.localStorage.setItem(clave, valor);
  } catch {
    // El almacenamiento puede estar bloqueado. La rutina de hoy no se rompe.
  }
}

// 2026-08-18, crítica de expertos #2 (la más severa: "Hoy" sugería la rutina
// por día del año, sin mirar nunca lo que ella ya hizo — el loop de retención
// que ESTADO.md describía no existía en el código). Sin cuenta todavía (el
// caso normal antes de Hotmart), esta es la única memoria de qué ya vivió.
function agregarRutinaHecha(id: string) {
  try {
    const crudo = window.localStorage.getItem('nua.rutinasHechas');
    const lista: string[] = crudo ? (JSON.parse(crudo) as string[]) : [];
    window.localStorage.setItem('nua.rutinasHechas', JSON.stringify([...lista.filter((x) => x !== id), id].slice(-30)));
  } catch {
    // Sin memoria entre visitas: Hoy vuelve a rotar por día, no se rompe.
  }
}

// La racha (24-GAMIFICACION §Mecánica 1) se deriva de estos días — sin cuenta
// todavía es la única memoria de qué días hizo su ritual. `lib/racha.ts` la calcula.
function agregarDiaActivo() {
  try {
    const hoy = fechaLocal(new Date());
    const crudo = window.localStorage.getItem('nua.diasActivos');
    const lista: string[] = crudo ? (JSON.parse(crudo) as string[]) : [];
    if (lista.includes(hoy)) return;
    window.localStorage.setItem('nua.diasActivos', JSON.stringify([...lista, hoy].slice(-400)));
  } catch {
    // Sin memoria entre visitas: sin cuenta, la racha no se puede sostener igual.
  }
}

// El progreso a mitad de rutina se queda en sessionStorage: si sale sin querer
// (llamada, notificación) y vuelve a abrir el mismo enlace, retoma donde iba
// en vez de perder lo que ya escribió (hallazgo del revisor-visual, 2026-08-17).
interface Progreso {
  i: number;
  respuestas: Record<string, string>;
}
function leeProgreso(rutinaId: string): Progreso | null {
  try {
    const crudo = window.sessionStorage.getItem(`nua.progreso.${rutinaId}`);
    return crudo ? (JSON.parse(crudo) as Progreso) : null;
  } catch {
    return null;
  }
}
function guardaProgreso(rutinaId: string, progreso: Progreso) {
  try {
    window.sessionStorage.setItem(`nua.progreso.${rutinaId}`, JSON.stringify(progreso));
  } catch {
    // Sin persistencia disponible, la rutina sigue funcionando igual en esta visita.
  }
}
function borraProgreso(rutinaId: string) {
  try {
    window.sessionStorage.removeItem(`nua.progreso.${rutinaId}`);
  } catch {
    // No pasa nada: expira sola con la pestaña.
  }
}

/** Mueve el foco con las flechas dentro de un radiogroup — sin esto es un
 *  radiogroup de mentira (hallazgo del revisor-visual, 2026-08-17). */
function moverConFlechas(e: React.KeyboardEvent<HTMLDivElement>, total: number) {
  if (!['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'].includes(e.key)) return;
  e.preventDefault();
  const radios = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]'));
  const actual = radios.indexOf(document.activeElement as HTMLElement);
  const paso = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1;
  radios[(Math.max(0, actual) + paso + total) % total]?.focus();
}

/** El color de cada duración es el MISMO lenguaje del Dial de Energía (5→reserva,
 *  15→media, 20→energía) — antes esta pantalla no lo usaba en ningún sitio, ni
 *  siquiera de eco, y perdía la identidad visual de la marca (revisor-visual,
 *  2026-08-17). Solo sirve para la RAYA de los eslabones (sobre fondo plano):
 *  el `--estado-reserva` pálido es casi invisible contra su propia pista
 *  `--surface-2` en el anillo del cronómetro, así que ahí NO se usa — el
 *  anillo se queda en `--accent` sólido, siempre legible (ronda 4). */
const COLOR_POR_DURACION: Record<DuracionRutina, string> = {
  5: 'var(--estado-reserva)',
  15: 'var(--estado-media)',
  20: 'var(--estado-energia)',
};

/** Temporizador de los bloques `hacer`: NUA se calla y ella actúa. */
function Cuenta({ segundos, onFin, color }: { segundos: number; onFin: () => void; color: string }) {
  const [restan, setRestan] = useState(segundos);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (restan <= 0) {
      onFin();
      return;
    }
    const t = window.setTimeout(() => setRestan((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [restan, onFin]);

  const R = 84;
  const C = 2 * Math.PI * R;
  const mm = Math.floor(Math.max(0, restan) / 60);
  const ss = Math.max(0, restan) % 60;

  // Bloque "hacer/ensayar": NUA se calla y el anillo es lo único que queda —
  // se le da presencia real (no un círculo chico perdido en aire) en vez de
  // rellenar con contenido de relleno que no hace falta.
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-4">
      <div className="relative flex items-center justify-center">
        <svg width="240" height="240" viewBox="0 0 200 200" aria-hidden="true" className="-rotate-90">
          <circle cx="100" cy="100" r={R} fill="none" stroke="var(--surface-2)" strokeWidth={14} />
          <motion.circle
            cx="100"
            cy="100"
            r={R}
            fill="none"
            stroke={color}
            strokeWidth={14}
            strokeLinecap="round"
            strokeDasharray={C}
            initial={{ strokeDashoffset: 0 }}
            animate={{ strokeDashoffset: reduce ? 0 : C }}
            transition={{ duration: reduce ? 0 : segundos, ease: 'linear' }}
          />
        </svg>
        <span role="timer" className="absolute text-6xl tabular-nums [font-family:var(--font-display)]">
          {mm}:{String(ss).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}

function Reproductor() {
  const params = useSearchParams();
  const router = useRouter();
  const duracion = (Number(params.get('min')) || 5) as DuracionRutina;
  const rutina = rutinaPara(DURACIONES.includes(duracion) ? duracion : 5, params.get('id') ?? undefined);

  // -1 = portada de la rutina (por qué existe). bloques.length = victoria.
  // Arranca SIEMPRE en portada (igual en servidor y cliente — leer
  // sessionStorage en el inicializador de useState causaba un error de
  // hidratación real cuando había progreso previo guardado, verificado en
  // consola). El progreso guardado se retoma un instante después, ya en el
  // cliente, en el useEffect de abajo.
  const [i, setI] = useState(-1);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [guardando, setGuardando] = useState(false);
  const [chispaEn, setChispaEn] = useState<string | null>(null);
  const [confeti, setConfeti] = useState<object | null>(null);
  const reduce = useReducedMotion();
  const contenido = useRef<HTMLElement>(null);
  const supabase = useMemo(() => crearClienteNavegador(), []);

  useEffect(() => {
    contenido.current?.focus({ preventScroll: true });
  }, [i]);

  // Retoma el progreso guardado — SOLO en el cliente, un instante después del
  // primer render (no en el inicializador de useState: leer sessionStorage
  // ahí es lo que causaba el error de hidratación de arriba).
  const restaurado = useRef(false);
  useEffect(() => {
    if (restaurado.current) return;
    restaurado.current = true;
    const previo = leeProgreso(rutina.id);
    if (previo) {
      setI(previo.i);
      setRespuestas(previo.respuestas);
    }
  }, [rutina.id]);

  // Guarda el progreso en cada paso — así una llamada o una notificación a
  // mitad de rutina no le hace perder lo que ya escribió. `i` arranca en -1
  // (portada) en cada montaje, así que este efecto no puede correr con datos
  // viejos antes de que el de arriba termine de restaurar.
  useEffect(() => {
    if (i <= -1) return;
    guardaProgreso(rutina.id, { i, respuestas });
  }, [rutina.id, i, respuestas]);

  const bloque: Bloque | undefined = i >= 0 ? rutina.bloques[i] : undefined;
  const enVictoria = i >= rutina.bloques.length;

  // El confeti pesa (celebración con detalle): se pide solo al llegar a la victoria, no antes.
  useEffect(() => {
    if (!enVictoria || reduce || confeti) return;
    fetch('/lottie/congrats.json')
      .then((r) => r.json())
      .then(setConfeti)
      .catch(() => {
        // Sin confeti la victoria se sostiene igual: el círculo con el check queda como fallback.
      });
  }, [enVictoria, reduce, confeti]);

  const elige = (idBloque: string, op: string) => {
    setRespuestas((r) => ({ ...r, [idBloque]: op }));
    if (reduce) return;
    const clave = `${idBloque}:${op}`;
    setChispaEn(clave);
    window.setTimeout(() => setChispaEn((c) => (c === clave ? null : c)), 700);
  };
  const avanza = () => setI((n) => n + 1);
  const retrocede = () => setI((n) => Math.max(-1, n - 1));

  // Salir vuelve a donde estaba de verdad (onboarding o Hoy), no siempre al
  // onboarding: antes el X mandaba a quien ya es de NUA de vuelta al primer
  // paso (hallazgo del revisor-visual, 2026-08-17).
  const salir = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const btn =
    'flex h-14 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--accent)] text-[length:var(--txt-body)] font-semibold text-[var(--sobre-acento)] shadow-[var(--shadow-2)] [touch-action:manipulation] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]';

  // Guarda la victoria. Con sesión (ya es de NUA), queda en el Archivo de
  // Evidencias; sin sesión, se queda en el teléfono — la mayoría de las
  // primeras rutinas pasan aquí ANTES de tener cuenta.
  const guardarVictoria = async () => {
    if (guardando) return;
    setGuardando(true);
    guarda('nua.teLlevas', rutina.victoria.teLlevas);
    agregarRutinaHecha(rutina.id);
    agregarDiaActivo();

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('sesiones_rutina').insert({
          user_id: user.id,
          rutina_id: rutina.id,
          nombre_rutina: rutina.nombre,
          duracion: rutina.duracion,
          capacidad: rutina.capacidad,
          respuestas,
          te_llevas: rutina.victoria.teLlevas,
        });
      }
    } catch {
      // No bloquea el paso al paywall: ya quedó en localStorage.
    }

    borraProgreso(rutina.id); // ya terminó: no hay nada que retomar
    // Acción core (36): cada rutina terminada de verdad.
    // 2026-08-18: `aha_alcanzado` vivía (sin disparar nunca) en una fase muerta del
    // onboarding — el botón real siempre trae a la usuaria AQUÍ a vivir el ritual
    // completo, así que este es el único lugar donde "primera victoria real" pasa
    // de verdad. `trackAhaAlcanzado` ya deduplica sola (una vez en la vida).
    trackAhaAlcanzado();
    void track('rutina_completada', { duracion: rutina.duracion, capacidad: rutina.capacidad });
    router.push('/paywall');
  };

  return (
    // Fondo con profundidad (32: jamás plano) — un lavado radial muy sutil,
    // el tercer nivel que faltaba junto al base y las tarjetas elevadas
    // (hallazgo del revisor-visual, 2026-08-17).
    <div className="flex min-h-dvh flex-col bg-[radial-gradient(720px_480px_at_50%_0%,color-mix(in_oklab,var(--accent)_16%,var(--surface-2))_0%,transparent_75%),var(--bg)] text-[var(--text-primary)] [font-family:var(--font-body)]">
      <header className="flex items-center gap-3 px-5 pb-2 pt-4">
        <button
          type="button"
          onClick={salir}
          aria-label="Salir de la rutina"
          className="-ml-3 flex size-11 shrink-0 items-center justify-center rounded-full text-[var(--text-secondary)] [touch-action:manipulation]"
        >
          <X size={20} strokeWidth={2} aria-hidden="true" />
        </button>
        {i > -1 && (
          <button
            type="button"
            onClick={retrocede}
            aria-label="Paso anterior"
            className="flex size-11 shrink-0 items-center justify-center rounded-full text-[var(--text-secondary)] [touch-action:manipulation]"
          >
            <ArrowLeft size={20} strokeWidth={2} aria-hidden="true" />
          </button>
        )}

        {/* La cadena de aprendizaje, siempre visible: ella sabe en qué eslabón
            está. Antes se VEÍA como una tab bar tocable (mismo peso, mismo
            subrayado) pero no hacía nada al tocarla — ahora los eslabones ya
            visitados SÍ llevan de vuelta a ese paso; los que faltan se ven
            claramente apagados, no tocables (hallazgo del revisor-visual,
            2026-08-17). */}
        <ol className="flex flex-1 items-center gap-1.5" aria-label="Pasos de la rutina">
          {rutina.cadena.map((eslabon, n) => {
            const actual = n === Math.max(0, i);
            const visitado = i >= 0 && n <= i;
            {/* Los eslabones futuros van SIN raya (antes tenían una tenue y las
                3 se leían como pestañas del mismo peso) — solo lo recorrido y
                lo actual dejan marca; lo que falta se ve claramente inerte. */}
            const raya = visitado ? (
              <span
                aria-hidden="true"
                className="h-0.5 rounded-full"
                style={{ background: COLOR_POR_DURACION[rutina.duracion] }}
              />
            ) : (
              <span aria-hidden="true" className="h-0.5" />
            );
            const etiqueta = (
              <span
                className={`text-center text-[length:var(--txt-label)] leading-none ${
                  actual
                    ? 'text-[var(--text-primary)]'
                    : visitado
                      ? 'text-[var(--text-secondary)]'
                      : 'text-[var(--text-tertiary)] opacity-60'
                }`}
              >
                {eslabon}
              </span>
            );
            return (
              <li key={eslabon} className="flex flex-1 flex-col gap-1">
                {visitado && !actual ? (
                  <button
                    type="button"
                    onClick={() => setI(n)}
                    aria-label={`Volver a "${eslabon}"`}
                    className="flex w-full flex-col gap-1 [touch-action:manipulation]"
                  >
                    {raya}
                    {etiqueta}
                  </button>
                ) : (
                  <>
                    {raya}
                    {etiqueta}
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </header>

      <main
        ref={contenido}
        tabIndex={-1}
        aria-label={rutina.nombre}
        className="flex flex-1 flex-col px-5 pb-8 focus:outline-none"
      >
        <AnimatePresence mode="wait">
          {/* ── PORTADA: por qué existe esta rutina ── */}
          {i === -1 && (
            <motion.section
              key="portada"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="flex flex-1 flex-col"
            >
              <div className="flex flex-1 flex-col justify-center py-6">
                <p className="text-[length:var(--txt-label)] font-semibold uppercase tracking-[0.28em] text-[var(--text-secondary)]">
                  {rutina.duracion} min · {CAPACIDADES[rutina.capacidad].nombre}
                </p>
                <h1 className="mt-3 text-[length:var(--txt-title)] leading-tight [font-family:var(--font-display)]">
                  {rutina.nombre}
                </h1>
                <p className="mt-2 text-[length:var(--txt-body)] text-[var(--text-secondary)]">
                  {rutina.subtitulo}
                </p>

                {/* Esto iba dentro de una tarjeta con la etiqueta "POR QUÉ HACEMOS
                    ESTO". El texto no sobraba; sobraba el envoltorio: la etiqueta
                    anunciaba "aquí viene una explicación", que es justo donde ella
                    desconecta. Suelto y grande se lee como alguien hablándole. */}
                <motion.div
                  aria-hidden="true"
                  initial={reduce ? false : { scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 0.61, 0.36, 1] }}
                  className="mt-8 h-0.5 w-12 origin-left rounded-full bg-[linear-gradient(90deg,var(--accent),transparent)]"
                />
                <motion.p
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: reduce ? 0 : 0.25 }}
                  className="mt-4 text-[length:var(--txt-subtitle)] leading-relaxed"
                >
                  {rutina.porQueExiste}
                </motion.p>
              </div>

              <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={avanza} className={btn}>
                Empezar
                <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />
              </motion.button>
            </motion.section>
          )}

          {/* ── BLOQUES ── */}
          {bloque && (
            <motion.section
              key={bloque.id}
              initial={reduce ? false : { opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-1 flex-col"
            >
              <h1 className="mt-4 text-[length:var(--txt-title)] leading-tight [font-family:var(--font-display)]">
                {bloque.titulo}
              </h1>
              <p className="mt-3 text-[length:var(--txt-body)] leading-relaxed text-[var(--text-secondary)]">
                {bloque.guia}
              </p>

              {/* El porqué va ANTES de que actúe, no después: es lo que la deja
                  escribir con honestidad. Estaba debajo del campo, donde ya no
                  servía para nada. Y va como línea, no como caja con etiqueta. */}
              {bloque.paraQueSirve && (
                <p className="mt-3 text-[length:var(--txt-body)] leading-snug text-[var(--text-tertiary)]">
                  {bloque.paraQueSirve}
                </p>
              )}

              {/* justify-start, no center: centrar dejaba el campo flotando con
                  180px de aire encima. Lo que se le pide va justo debajo de lo
                  que se le dice. */}
              <div className="flex flex-1 flex-col justify-start pb-4 pt-6">
                {bloque.tipo === 'elegir' && (
                  <div
                    className="flex flex-col gap-3"
                    role="radiogroup"
                    aria-label={bloque.titulo}
                    onKeyDown={(e) => moverConFlechas(e, bloque.opciones?.length ?? 0)}
                  >
                    {bloque.opciones?.map((op, n) => {
                      const on = respuestas[bloque.id] === op;
                      return (
                        <motion.button
                          key={op}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          tabIndex={respuestas[bloque.id] ? (on ? 0 : -1) : n === 0 ? 0 : -1}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => elige(bloque.id, op)}
                          className={`flex min-h-14 items-center justify-between gap-3 rounded-[var(--radius-card)] border px-4 py-3 text-left text-[length:var(--txt-body)] transition-[border-color,box-shadow] duration-200 [touch-action:manipulation] ${
                            on
                              ? 'border-[var(--accent)] bg-[var(--surface)] shadow-[var(--shadow-2)] ring-2 ring-[var(--accent)]'
                              : 'border-[color-mix(in_oklab,var(--text-tertiary)_45%,transparent)] bg-[var(--surface)]'
                          }`}
                        >
                          <span className="font-medium">{op}</span>
                          <span aria-hidden="true" className="relative flex size-6 shrink-0 items-center justify-center">
                            {chispaEn === `${bloque.id}:${op}` && (
                              <Lottie
                                animationData={chispa}
                                loop={false}
                                className="pointer-events-none absolute inset-[-14px]"
                              />
                            )}
                            <span
                              className={`relative flex size-6 items-center justify-center rounded-full ${
                                on
                                  ? 'bg-[var(--accent)]'
                                  : 'border-[1.5px] border-[var(--text-tertiary)] bg-transparent'
                              }`}
                            >
                              {on && <Check size={14} strokeWidth={3} color="var(--sobre-acento)" />}
                            </span>
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                {bloque.tipo === 'escribir' && (
                  <div className="flex flex-1 flex-col">
                    {/* flex-1 en vez de rows fijas: antes dejaba ~250px de vacío
                        muerto debajo en bloques con poco texto de guía
                        (hallazgo del revisor-visual, 2026-08-17). */}
                    <textarea
                      value={respuestas[bloque.id] ?? ''}
                      onChange={(e) => setRespuestas((r) => ({ ...r, [bloque.id]: e.target.value }))}
                      aria-label={bloque.titulo}
                      placeholder={bloque.ejemplo ? `Por ejemplo: ${bloque.ejemplo}` : 'Escribe aquí'}
                      className="min-h-40 w-full flex-1 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_45%,transparent)] bg-[var(--surface)] px-4 py-3 text-[length:var(--txt-body)] leading-relaxed shadow-[var(--shadow-1)] placeholder:text-[var(--text-tertiary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                    />
                    <p className="mt-2 shrink-0 text-[length:var(--txt-label)] text-[var(--text-secondary)]">
                      Se queda en tu teléfono. Nadie más lo lee.
                    </p>
                  </div>
                )}

                {/* COMPLETAR: la frase con huecos. Es lo que convierte una intención
                    en algo reconocible después ("cuando pase X, haré Y"). */}
                {bloque.tipo === 'completar' && bloque.plantilla && (
                  <div className="rounded-[var(--radius-card)] bg-[var(--surface)] px-4 py-4 shadow-[var(--shadow-1)]">
                    <p className="text-[length:var(--txt-body)] leading-loose">
                      {bloque.plantilla[0]}
                      <input
                        value={respuestas[`${bloque.id}-a`] ?? ''}
                        onChange={(e) =>
                          setRespuestas((r) => ({ ...r, [`${bloque.id}-a`]: e.target.value }))
                        }
                        aria-label="Primera parte"
                        className="mx-1 min-w-24 border-b-2 border-[var(--accent)] bg-transparent px-1 text-[length:var(--txt-body)] focus-visible:outline-none"
                      />
                      {bloque.plantilla[1]}
                      <input
                        value={respuestas[`${bloque.id}-b`] ?? ''}
                        onChange={(e) =>
                          setRespuestas((r) => ({ ...r, [`${bloque.id}-b`]: e.target.value }))
                        }
                        aria-label="Segunda parte"
                        className="mx-1 min-w-24 border-b-2 border-[var(--accent)] bg-transparent px-1 text-[length:var(--txt-body)] focus-visible:outline-none"
                      />
                      {bloque.plantilla[2]}
                    </p>
                    {bloque.ejemplo && (
                      <p className="mt-3 text-[length:var(--txt-label)] leading-snug text-[var(--text-secondary)]">
                        Por ejemplo: {bloque.ejemplo}
                      </p>
                    )}
                  </div>
                )}

                {(bloque.tipo === 'hacer' || bloque.tipo === 'ensayar') && (
                  <Cuenta
                    segundos={Math.round((bloque.hasta - bloque.desde) * 60)}
                    color="var(--accent)"
                    onFin={() => {
                      /* El paso NO avanza solo: ella cierra cuando terminó. */
                    }}
                  />
                )}

                {bloque.marco && (
                  <p className="mt-6 border-l-2 border-[var(--accent)] pl-4 text-[length:var(--txt-subtitle)] leading-snug [font-family:var(--font-display)]">
                    {bloque.marco}
                  </p>
                )}

                {bloque.ganancia && (
                  <p className="mt-4 text-[length:var(--txt-body)] text-[var(--text-secondary)]">
                    {bloque.ganancia}
                  </p>
                )}
              </div>

              {/* "Siguiente" NUNCA se bloquea por falta de respuesta — decisión de
                  producto, no un descuido (hallazgo del revisor-visual, 2026-08-17):
                  NUA no exige que escriba o elija algo un día que no puede. Exigirlo
                  contradice "no necesitas sentirte bien para empezar". */}
              <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={avanza} className={btn}>
                {i === rutina.bloques.length - 1 ? 'Terminar' : 'Siguiente'}
                <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />
              </motion.button>
            </motion.section>
          )}

          {/* ── 🏆 VICTORIA — la última etapa del aprendizaje, no un adorno ── */}
          {enVictoria && (
            <motion.section
              key="victoria"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-1 flex-col"
            >
              <div className="flex flex-1 flex-col justify-center">
                <div className="relative flex items-center justify-center self-start">
                  {confeti && (
                    <Lottie
                      animationData={confeti}
                      loop={false}
                      className="pointer-events-none absolute inset-[-90px]"
                    />
                  )}
                  <motion.span
                    aria-hidden="true"
                    initial={reduce ? false : { scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 14 }}
                    className="relative flex size-16 items-center justify-center rounded-full bg-[var(--accent)]"
                  >
                    <Check size={30} strokeWidth={3} color="var(--sobre-acento)" />
                  </motion.span>
                </div>

                <h1 className="mt-6 text-[length:var(--txt-title)] leading-tight [font-family:var(--font-display)]">
                  {rutina.victoria.titulo}
                </h1>
                <p className="mt-3 text-[length:var(--txt-body)] leading-relaxed text-[var(--text-secondary)]">
                  {rutina.victoria.cuerpo}
                </p>

                {/* Se llamaba "TU EVIDENCIA DE HOY" y la dueña lo descartó: sonaba a
                    informe. No es un mantra ni una prueba: es lo que se lleva. */}
                <div className="mt-8 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--accent)_30%,transparent)] bg-[var(--chip-bg)] px-4 py-4 shadow-[var(--shadow-2)]">
                  <p className="text-[length:var(--txt-label)] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                    Lo que te llevas
                  </p>
                  <p className="mt-2 text-[length:var(--txt-subtitle)] leading-snug [font-family:var(--font-display)]">
                    «{rutina.victoria.teLlevas}»
                  </p>
                </div>
              </div>

              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={guardarVictoria}
                disabled={guardando}
                aria-busy={guardando}
                className={`${btn} disabled:opacity-70`}
              >
                {guardando ? 'Guardando…' : 'Guardar mi victoria'}
                <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />
              </motion.button>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function RutinaPage() {
  return (
    <Suspense fallback={<CargandoRutina />}>
      <Reproductor />
    </Suspense>
  );
}

/** Esqueleto del Suspense: antes era un `<div>` vacío — en conexión lenta se
 *  sentía colgado (hallazgo del revisor-visual, 2026-08-17). Sigue la
 *  silueta real de la portada (encabezado + título + CTA). */
function CargandoRutina() {
  return (
    <div className="flex min-h-dvh flex-col bg-[var(--bg)] px-5 pb-8 pt-4">
      <div className="skeleton h-11 w-11 rounded-full" aria-hidden="true" />
      <div className="mt-16 flex flex-1 flex-col justify-center gap-3">
        <div className="skeleton h-4 w-32 rounded-full" aria-hidden="true" />
        <div className="skeleton h-9 w-3/4 rounded-[var(--radius-inner)]" aria-hidden="true" />
        <div className="skeleton h-5 w-1/2 rounded-full" aria-hidden="true" />
      </div>
      <div className="skeleton h-14 w-full rounded-[var(--radius-button)]" aria-hidden="true" />
    </div>
  );
}
