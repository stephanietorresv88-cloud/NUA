'use client';

// HOY — la pantalla principal. La ve quien ya es de NUA y vuelve.
//
// El objeto principal es el Dial de Energía (mismo dispositivo firma del
// onboarding y la landing, FICHA-ARTE): elegir el estado de hoy arma el
// ritual del día, filtrado por lo que ya tiene desbloqueado esta semana
// (lib/desbloqueo.ts — decisión de la dueña, 2026-08-14: no se abren las
// 41 rutinas de golpe).
//
// Con sesión: perfiles + sesiones_rutina vienen de Supabase (el Archivo de
// Evidencias real). Sin sesión (el caso de hoy: todavía no hay Hotmart
// conectado): se sostiene con lo que ya vive en localStorage — la pantalla
// nunca depende de tener cuenta para tener sentido.

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, animate, motion, useReducedMotion, type Variants } from 'motion/react';
import Lottie from 'lottie-react';
import { ArrowRight, Flame, Snowflake, Sparkles, X } from 'lucide-react';
import { ChecklistPrimerosPasos } from '@/components/ChecklistPrimerosPasos';
import { crearClienteNavegador } from '@/lib/supabase/client';
import { track, trackAppAbierta, trackSesionDiaria } from '@/lib/analytics';
import { rutinasDe, type DuracionRutina } from '@/lib/rutinas';
import { cantidadDesbloqueada, idsDesbloqueados, nuevasEstaSemana, semanaDesde } from '@/lib/desbloqueo';
import { calcularRacha, fechaLocal, type EstadoRacha } from '@/lib/racha';

type EstadoId = 'reserva' | 'media' | 'energia';
type DolorId = 'dormir' | 'tiempo' | 'energia' | 'todo';

interface Estado {
  id: EstadoId;
  etiqueta: string;
  minutos: DuracionRutina;
  color: string;
}

const ESTADOS: Estado[] = [
  { id: 'reserva', etiqueta: 'Necesito algo fácil', minutos: 5, color: 'var(--estado-reserva)' },
  { id: 'media', etiqueta: 'Puedo con lo esencial', minutos: 15, color: 'var(--estado-media)' },
  { id: 'energia', etiqueta: 'Hoy tengo más para mí', minutos: 20, color: 'var(--estado-energia)' },
];
const ANGULOS: Record<EstadoId, number> = { reserva: -60, media: 0, energia: 60 };
const ARCOS: { id: EstadoId; d: string }[] = [
  { id: 'reserva', d: 'M32 118.5 A88 88 0 0 1 73.4 45.4' },
  { id: 'media', d: 'M78.7 42.3 A88 88 0 0 1 161.3 42.3' },
  { id: 'energia', d: 'M166.6 45.4 A88 88 0 0 1 208 118.5' },
];
const ARCOS_TOQUE: { id: EstadoId; d: string }[] = [
  { id: 'reserva', d: 'M34.6 108.6 A88 88 0 0 1 66.5 50.5' },
  { id: 'media', d: 'M88.9 37.9 A88 88 0 0 1 151.1 37.9' },
  { id: 'energia', d: 'M173.5 50.5 A88 88 0 0 1 205.4 108.6' },
];

const DOLOR_LINEA: Record<DolorId, string> = {
  dormir: 'Aunque anoche tampoco durmieras bien.',
  tiempo: 'Aunque hoy tampoco alcance el tiempo.',
  energia: 'Aunque llegues sin nada de energía.',
  todo: 'Aunque hoy te toque cargar con todo otra vez.',
};

function saludoPorHora(h: number): string {
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

/** Conteo animado del número héroe (baseline 2 de las 7): nunca aparece estático. */
function useConteo(objetivo: number, reduce: boolean | null) {
  const [valor, setValor] = useState(reduce ? objetivo : 0);
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

function diaDelAnio(fecha: Date): number {
  const inicio = new Date(fecha.getFullYear(), 0, 0);
  return Math.floor((fecha.getTime() - inicio.getTime()) / 86_400_000);
}

/** Flechas izquierda/derecha mueven Y seleccionan dentro del radiogroup del dial
 *  (patrón ARIA de radiogroup: la selección sigue al foco). */
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

function recuerda(clave: string, valor: string) {
  try {
    window.localStorage.setItem(clave, valor);
  } catch {
    // Sin memoria entre visitas. Hoy no se rompe por eso.
  }
}
function leeRecuerdo(clave: string): string | null {
  try {
    return window.localStorage.getItem(clave);
  } catch {
    return null;
  }
}

interface EntradaArchivo {
  nombre: string;
  teLlevas: string;
  fecha: string | null;
}

const FECHA_CORTA = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' });

/** Copy del hito de racha (56, M2) — dice POR QUÉ importa el número, no solo el
 *  número. Voz de NUA: serena · adulta · indulgente (FICHA-ARTE), cero exclamaciones. */
const HITO_COPY: Record<7 | 30 | 100 | 365, string> = {
  7: 'Una semana entera escuchándote a ti.',
  30: 'Un mes completo sin dejarte de lado.',
  100: 'Cien días eligiéndote, incluso los difíciles.',
  365: 'Un año entero. Esto ya es quien eres.',
};

const lista: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const item: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
};

export default function Hoy() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const supabase = useMemo(() => crearClienteNavegador(), []);

  const [cargando, setCargando] = useState(true);
  const [dolor, setDolor] = useState<DolorId | null>(null);
  const [semana, setSemana] = useState(1);
  const [archivo, setArchivo] = useState<EntradaArchivo[]>([]);
  const [totalSesiones, setTotalSesiones] = useState(0);
  const [hechasIds, setHechasIds] = useState<Set<string>>(new Set());
  const [racha, setRacha] = useState<EstadoRacha>({
    actual: 0,
    mejor: 0,
    congeladores: 0,
    enRiesgo: false,
    rota: false,
    perdida: 0,
    hito: null,
  });
  const [avisoCongelador, setAvisoCongelador] = useState<number | null>(null);
  const [hitoVisible, setHitoVisible] = useState<7 | 30 | 100 | 365 | null>(null);
  const [confeti, setConfeti] = useState<object | null>(null);
  const [conCuenta, setConCuenta] = useState(false);
  const [eleccion, setEleccion] = useState<EstadoId>('media');
  const [errorCarga, setErrorCarga] = useState(false);
  const [entrandoARitual, setEntrandoARitual] = useState(false);
  const [reintentando, setReintentando] = useState(false);
  // Primeros pasos, ítem 1: no hay rastro nativo de "tocó el dial" — se guarda
  // un flag propio, la única acción del checklist que no viene de otro lado.
  const [dialTocado, setDialTocado] = useState(false);
  const arrastrando = useRef(false);
  const entrandoRef = useRef(false);
  const seguirRef = useRef<HTMLButtonElement>(null);

  /** El dial se lee como un gauge analógico: soporta arrastre continuo, no
   *  solo tap discreto — si se ve arrastrable, tiene que responder al arrastre. */
  function seleccionarPorAngulo(clientX: number, clientY: number, svg: SVGSVGElement) {
    const rect = svg.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 240;
    const y = ((clientY - rect.top) / rect.height) * 150;
    const deg = Math.atan2(x - 120, 120 - y) * (180 / Math.PI);
    if (deg <= -30) setEleccion('reserva');
    else if (deg >= 30) setEleccion('energia');
    else setEleccion('media');
  }

  const cargarDatos = useMemo(
    () => async (vivo: () => boolean) => {
      try {
        setErrorCarga(false);
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setConCuenta(true);
          const [{ data: perfil }, { data: sesiones, count }] = await Promise.all([
            supabase.from('perfiles').select('dolor, created_at').eq('id', user.id).maybeSingle(),
            // limit 400 (no solo 30): "Tu archivo" solo muestra las 3 últimas, pero el
            // loop de retención Y la racha necesitan ver bien atrás — la racha se
            // rompe si falta un solo día activo en la muestra (ver lib/racha.ts).
            supabase
              .from('sesiones_rutina')
              .select('rutina_id, nombre_rutina, te_llevas, created_at', { count: 'exact' })
              .order('created_at', { ascending: false })
              .limit(400),
          ]);
          if (!vivo()) return;
          if (perfil?.dolor) setDolor(perfil.dolor as DolorId);
          if (perfil?.created_at) setSemana(semanaDesde(new Date(perfil.created_at)));
          if (sesiones) {
            setArchivo(
              sesiones.slice(0, 3).map((s) => ({ nombre: s.nombre_rutina, teLlevas: s.te_llevas, fecha: s.created_at })),
            );
            setHechasIds(new Set(sesiones.map((s) => s.rutina_id)));
            setRacha(calcularRacha(sesiones.map((s) => fechaLocal(new Date(s.created_at)))));
          }
          setTotalSesiones(count ?? 0);
        } else {
          const dolorLocal = leeRecuerdo('nua.dolor');
          if (dolorLocal) setDolor(dolorLocal as DolorId);

          let inicio = leeRecuerdo('nua.primeraVisita');
          if (!inicio) {
            inicio = new Date().toISOString();
            recuerda('nua.primeraVisita', inicio);
          }
          setSemana(semanaDesde(new Date(inicio)));

          const teLlevas = leeRecuerdo('nua.teLlevas');
          if (teLlevas) {
            setArchivo([{ nombre: 'Tu última rutina', teLlevas, fecha: null }]);
            setTotalSesiones(1);
          }

          const hechasLocal = leeRecuerdo('nua.rutinasHechas');
          if (hechasLocal) {
            try {
              setHechasIds(new Set(JSON.parse(hechasLocal) as string[]));
            } catch {
              // Sin historial legible: Hoy vuelve a rotar por día.
            }
          }

          const diasLocal = leeRecuerdo('nua.diasActivos');
          if (diasLocal) {
            try {
              setRacha(calcularRacha(JSON.parse(diasLocal) as string[]));
            } catch {
              // Sin historial legible: sin racha que mostrar todavía.
            }
          }
        }
      } catch {
        // El dial no depende de la red, pero se avisa: "Tu archivo" pudo quedar desactualizado.
        if (vivo()) setErrorCarga(true);
      } finally {
        if (vivo()) setCargando(false);
      }
    },
    [supabase],
  );

  // app_abierta (una vez en la vida del navegador) + sesion_iniciada (una vez por
  // día activo, base de D1/D7/D30 — 36). "Hoy" es la pantalla de entrada diaria.
  useEffect(() => {
    trackAppAbierta();
    trackSesionDiaria();
    if (leeRecuerdo('nua.dialTocado') === '1') setDialTocado(true);
  }, []);

  function marcarDialTocado() {
    if (dialTocado) return;
    recuerda('nua.dialTocado', '1');
    setDialTocado(true);
  }

  useEffect(() => {
    let vivo = true;
    cargarDatos(() => vivo);
    return () => {
      vivo = false;
    };
  }, [cargarDatos]);

  // Detecta qué CAMBIÓ desde la última vez que se calculó la racha (protección
  // ética, 24-GAMIFICACION §Mecánica 1 + 56 M2/M4/M5) — solo así se sabe cuándo
  // avisar de un congelador gastado o celebrar un hito, sin repetirlo cada carga.
  // La primera vez que existe este dato para alguien (aunque ya traiga historial
  // de antes de esta función) NO dispara nada: evita "sorprenderla" celebrando
  // de golpe una racha que ya tenía.
  useEffect(() => {
    if (cargando) return;
    interface VistoRacha { actual: number; congeladores: number; hitoCelebrado: number }
    let anterior: VistoRacha | null = null;
    try {
      const crudo = window.localStorage.getItem('nua.racha.visto');
      anterior = crudo ? (JSON.parse(crudo) as VistoRacha) : null;
    } catch {
      // Sin memoria del estado anterior: se trata como primera vez (no avisa nada).
    }

    if (anterior) {
      if (racha.hito !== null && racha.hito > anterior.hitoCelebrado) {
        setHitoVisible(racha.hito);
        void track('streak_milestone', { dias: racha.hito });
      }
      if (!racha.rota && racha.congeladores < anterior.congeladores) {
        const consumidos = anterior.congeladores - racha.congeladores;
        setAvisoCongelador(consumidos);
        void track('streak_frozen', { dias_perdidos: consumidos, racha_actual: racha.actual });
      } else if (racha.rota && anterior.actual > 0) {
        void track('streak_broken', { dias_perdidos: racha.perdida });
      } else if (racha.actual > anterior.actual) {
        void track('streak_extended', { dias: racha.actual });
      }
    }

    try {
      window.localStorage.setItem(
        'nua.racha.visto',
        JSON.stringify({
          actual: racha.actual,
          congeladores: racha.congeladores,
          hitoCelebrado: Math.max(anterior?.hitoCelebrado ?? 0, racha.hito ?? 0),
        }),
      );
    } catch {
      // Sin memoria entre visitas: la próxima carga puede repetir un aviso — no rompe nada.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cargando, racha.actual, racha.congeladores, racha.rota, racha.hito, racha.perdida]);

  // El foco entra al diálogo cuando abre — sin esto, un teclado o lector de
  // pantalla se queda "detrás" del overlay que acaba de taparle la pantalla.
  useEffect(() => {
    if (hitoVisible !== null) seguirRef.current?.focus();
  }, [hitoVisible]);

  // El confeti pesa: se pide solo cuando hace falta (hito real), nunca precargado.
  useEffect(() => {
    if (!hitoVisible || reduce || confeti) return;
    fetch('/lottie/congrats.json')
      .then((r) => r.json())
      .then(setConfeti)
      .catch(() => {
        // Sin confeti el hito se sostiene igual: el número y el copy son lo que importa.
      });
  }, [hitoVisible, reduce, confeti]);

  const activo = ESTADOS.find((e) => e.id === eleccion)!;
  const idsAbiertos = idsDesbloqueados(semana);
  const candidatas = rutinasDe(activo.minutos).filter((r) => idsAbiertos.has(r.id));
  const disponibles = rutinasDe(activo.minutos);
  // El loop de retención de verdad: primero ofrece algo que NO ha hecho todavía
  // (novedad real, no solo "hay rutinas nuevas esta semana"). Solo cuando ya
  // agotó las abiertas de este tiempo vuelve a rotar entre las que ya vivió.
  const sinHacer = candidatas.filter((r) => !hechasIds.has(r.id));
  const rutinaHoy = sinHacer.length
    ? sinHacer[diaDelAnio(new Date()) % sinHacer.length]!
    : candidatas.length
      ? candidatas[diaDelAnio(new Date()) % candidatas.length]!
      : disponibles[0]!;

  const nuevas = nuevasEstaSemana(semana);
  const totalAbiertas = cantidadDesbloqueada(semana);
  const minutosContados = useConteo(activo.minutos, reduce);
  const abiertasContadas = useConteo(totalAbiertas, reduce);
  const ahora = new Date();
  const fecha = new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long' }).format(ahora);

  return (
    <>
      <motion.main
        variants={lista}
        initial="hidden"
        animate="visible"
        className="mx-auto w-full max-w-md flex-1 px-5 pb-[var(--h-nav-inferior)] pt-5"
      >
        {/* ── HEADER: saludo + fecha real + lo que ya sabemos de ella ── */}
        <motion.header variants={item} className="mb-4">
          <p className="text-[length:var(--txt-label)] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
            {fecha}
          </p>
          <h1 className="mt-1 text-[length:var(--txt-title)] leading-tight [font-family:var(--font-display)]">
            {saludoPorHora(ahora.getHours())}
          </h1>
          {dolor && (
            <p className="mt-1 text-[length:var(--txt-body)] text-[var(--text-secondary)]">
              {DOLOR_LINEA[dolor]}
            </p>
          )}

          {/* ── RACHA — visible desde que hay algo real que sostener, NUNCA
              protagonista (24-GAMIFICACION §Mecánica 1 + 56 M1/M4/M5). Solo
              aparece a partir del "día 2" (racha ≥2, en riesgo, o rota) — el
              primer ritual de su vida no muestra "Racha: 1 día", que no
              significa nada todavía. Voz de NUA: serena, sin alarmismo, sin
              rojo, sin cuenta regresiva. */}
          {!cargando && !racha.rota && (racha.actual >= 2 || racha.enRiesgo) && (
            <p className="mt-2 flex items-center gap-1.5 text-[length:var(--txt-label)] font-semibold text-[var(--text-secondary)]">
              <Flame
                size={15}
                strokeWidth={2.4}
                color={racha.enRiesgo ? 'var(--text-tertiary)' : 'var(--accent)'}
                fill={racha.enRiesgo ? 'none' : 'var(--accent)'}
                aria-hidden="true"
              />
              <span className={racha.enRiesgo ? '' : 'text-[var(--text-primary)]'}>
                Racha: {racha.actual} {racha.actual === 1 ? 'día' : 'días'}
              </span>
              <span aria-hidden="true">·</span>
              <span>{racha.enRiesgo ? 'tu ritual de hoy la mantiene viva' : 'hoy también cuenta'}</span>
            </p>
          )}
          {/* ── RACHA ROTA — reencuadre sin culpa (56, M5): lo que NO se
              perdió (el récord) manda sobre lo que se rompió. Sin rojo, sin
              "perdiste", sin botón de "reparar" que no existe todavía. */}
          {!cargando && racha.rota && racha.mejor >= 2 && (
            <p className="mt-2 text-[length:var(--txt-label)] font-semibold text-[var(--text-secondary)]">
              Tu racha se pausó, no se borró — tu mejor marca sigue siendo{' '}
              <span className="text-[var(--text-primary)]">
                {racha.mejor} {racha.mejor === 1 ? 'día' : 'días'}
              </span>
              . Hoy puede empezar una nueva.
            </p>
          )}
          {/* ── CONGELADOR USADO — aviso de una vez (24: "el usuario siente
              que la app lo cuida, no que lo castiga"), se puede cerrar. ── */}
          {avisoCongelador !== null && (
            <motion.p
              role="status"
              aria-live="polite"
              initial={reduce ? false : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 flex items-start gap-1.5 rounded-[var(--radius-inner)] bg-[var(--chip-bg)] px-3 py-2 text-[length:var(--txt-label)] leading-snug text-[var(--text-secondary)]"
            >
              <Snowflake size={14} strokeWidth={2} color="var(--accent)" aria-hidden="true" className="mt-0.5 shrink-0" />
              <span className="flex-1">
                Usamos {avisoCongelador === 1 ? 'un congelador' : `${avisoCongelador} congeladores`} para
                cuidar tu racha de {racha.actual} {racha.actual === 1 ? 'día' : 'días'}. Te quedan{' '}
                {racha.congeladores}.
              </span>
              <button
                type="button"
                onClick={() => setAvisoCongelador(null)}
                aria-label="Cerrar aviso"
                className="shrink-0 text-[var(--text-tertiary)] [touch-action:manipulation]"
              >
                <X size={14} strokeWidth={2} aria-hidden="true" />
              </button>
            </motion.p>
          )}
          {errorCarga && (
            <p role="status" className="mt-2 text-[length:var(--txt-label)] text-[var(--aviso)]">
              No pudimos actualizar tu archivo.{' '}
              <button
                type="button"
                disabled={reintentando}
                onClick={async () => {
                  setReintentando(true);
                  let vivo = true;
                  await cargarDatos(() => vivo);
                  setReintentando(false);
                }}
                className="font-semibold underline underline-offset-4 disabled:opacity-60"
              >
                {reintentando ? 'Reintentando…' : 'Reintentar'}
              </button>
            </p>
          )}
        </motion.header>

        {/* ── PRIMEROS PASOS — solo hasta completar las 4 acciones (o cerrarlo);
            reusa datos que esta pantalla ya calcula, no un progreso paralelo. ── */}
        {!cargando && (
          <ChecklistPrimerosPasos
            pasos={[
              { id: 'dial', etiqueta: 'Marca cómo llegas hoy', hecho: dialTocado },
              { id: 'ritual', etiqueta: 'Completa tu primer ritual', hecho: totalSesiones > 0 },
              { id: 'cuenta', etiqueta: 'Guarda tu cuenta con tu correo', hecho: conCuenta },
              { id: 'racha', etiqueta: 'Vuelve un segundo día', hecho: racha.actual >= 2 },
            ]}
          />
        )}

        {cargando ? (
          <div
            aria-hidden="true"
            className="rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] p-4"
          >
            <div className="skeleton mx-auto h-4 w-40 rounded-[var(--radius-inner)]" />
            <div className="skeleton mx-auto mt-4 h-32 w-40 rounded-full" />
            <div className="mt-3 flex gap-2">
              <div className="skeleton h-11 flex-1 rounded-[var(--radius-inner)]" />
              <div className="skeleton h-11 flex-1 rounded-[var(--radius-inner)]" />
              <div className="skeleton h-11 flex-1 rounded-[var(--radius-inner)]" />
            </div>
            <div className="skeleton mt-3 h-14 w-full rounded-[var(--radius-inner)]" />
            <div className="skeleton mt-3 h-14 w-full rounded-[var(--radius-button)]" />
          </div>
        ) : (
          <>
            {/* ── OBJETO PRINCIPAL: el Dial de Energía ── */}
            <motion.section
              variants={item}
              aria-label="Elige tu energía de hoy"
              className="rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] p-4 shadow-[var(--shadow-2)]"
            >
              <p className="text-center text-[length:var(--txt-body)] font-semibold text-[var(--text-secondary)]">
                ¿Cómo llegas hoy?
              </p>

              <div className="mt-3 flex justify-center">
                <svg
                  viewBox="0 0 240 150"
                  className="w-52 max-w-full touch-none"
                  role="img"
                  aria-label={`Energía: ${activo.etiqueta}`}
                  onPointerDown={(e) => {
                    arrastrando.current = true;
                    seleccionarPorAngulo(e.clientX, e.clientY, e.currentTarget);
                    marcarDialTocado();
                  }}
                  onPointerMove={(e) => {
                    if (arrastrando.current) seleccionarPorAngulo(e.clientX, e.clientY, e.currentTarget);
                  }}
                  onPointerUp={() => {
                    arrastrando.current = false;
                  }}
                  onPointerLeave={() => {
                    arrastrando.current = false;
                  }}
                >
                  {/* Base atenuada, siempre visible: da la forma completa del dial. */}
                  <g fill="none" strokeLinecap="butt" strokeWidth={25} stroke="var(--dial-inactivo)">
                    {ARCOS.map((a) => (
                      <path key={a.id} d={a.d} />
                    ))}
                  </g>
                  {/* El arco activo se REDIBUJA (pathLength 0→1) en cada cambio — baseline
                      de movimiento #3: nunca un cross-fade de color solo. */}
                  <g fill="none" strokeLinecap="butt" strokeWidth={25}>
                    <motion.path
                      key={eleccion}
                      d={ARCOS.find((a) => a.id === eleccion)!.d}
                      stroke={activo.color}
                      initial={reduce ? false : { pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: reduce ? 0 : 0.45, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </g>
                  {/* Única zona clicable: los arcos de arriba son decorativos. */}
                  <g fill="none" stroke="transparent" strokeWidth={44} style={{ pointerEvents: 'stroke' }}>
                    {ARCOS_TOQUE.map((a) => (
                      <path
                        key={`toque-${a.id}`}
                        d={a.d}
                        onClick={() => {
                          setEleccion(a.id);
                          marcarDialTocado();
                        }}
                      />
                    ))}
                  </g>
                  <motion.g
                    initial={false}
                    animate={{ rotate: ANGULOS[eleccion] }}
                    transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 130, damping: 13 }}
                    style={{ originX: '120px', originY: '120px' }}
                  >
                    <path d="M120 120 L120 50" stroke="var(--dial-aguja)" strokeWidth={7} strokeLinecap="round" />
                  </motion.g>
                  <circle cx="120" cy="120" r="13" fill="var(--dial-aguja)" />
                  <circle cx="120" cy="120" r="5" fill="var(--bg)" />
                </svg>
              </div>

              <div
                role="radiogroup"
                aria-label="¿Cómo llegas hoy?"
                onKeyDown={(e) => moverConFlechas(e, ESTADOS.map((x) => x.id), setEleccion)}
                className="mt-3 flex gap-2"
              >
                {ESTADOS.map((e) => {
                  const on = e.id === eleccion;
                  // 2026-08-18, crítica de expertos #7: el chip activo SIEMPRE se
                  // pintaba de lavanda (--accent), sin importar el estado — el dial y
                  // la card de abajo sí cambian a amarillo limón en "Energía", pero el
                  // selector nunca lo mostraba. Mismo lenguaje de color que ya usan el
                  // arco del dial y la card "Tu ritual de hoy": el color de CADA estado
                  // es el suyo, el limón sigue siendo solo de energía (no se reparte).
                  return (
                    <motion.button
                      key={e.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setEleccion(e.id);
                        marcarDialTocado();
                      }}
                      style={
                        on
                          ? { backgroundColor: `color-mix(in oklab, ${e.color} 55%, var(--surface))`, borderColor: e.color }
                          : undefined
                      }
                      className={`min-h-11 flex-1 rounded-[var(--radius-inner)] border px-2 text-[length:var(--txt-label)] font-semibold transition-colors duration-150 [touch-action:manipulation] ${
                        on
                          ? 'text-[var(--text-primary)]'
                          : 'border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)] text-[var(--text-secondary)]'
                      }`}
                    >
                      {e.etiqueta}
                    </motion.button>
                  );
                })}
              </div>

              {/* ── El resultado: un DATO, no un control — etiqueta propia y sin el
                  radio/relleno uniforme de los chips de arriba, para que no se lea
                  como botón (hallazgo del revisor-visual, 2026-08-17). ── */}
              <p className="mt-3 px-1 text-[length:var(--txt-label)] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                Tu ritual de hoy
              </p>
              <motion.div
                animate={{ backgroundColor: activo.color }}
                transition={{ duration: reduce ? 0 : 0.3 }}
                className="mt-1 flex items-center gap-4 rounded-[var(--radius-inner)] px-4 py-2.5 shadow-[var(--shadow-1)]"
              >
                <span className="shrink-0 text-[length:var(--txt-hero)] leading-none tabular-nums text-[var(--text-primary)] [font-family:var(--font-display)]">
                  {minutosContados}
                  <span className="ml-1 text-[length:var(--txt-label)]">min</span>
                </span>
                <span className="min-w-0 text-[length:var(--txt-body)] leading-snug text-[var(--text-primary)]">
                  <strong className="block truncate">{rutinaHoy.nombre}</strong>
                  {rutinaHoy.subtitulo}
                </span>
              </motion.div>

              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                disabled={entrandoARitual}
                aria-busy={entrandoARitual}
                onClick={() => {
                  // Guard SÍNCRONO por ref: `disabled` solo aplica tras el re-render,
                  // así que un segundo tap en el mismo evento de teclado/tap rápido
                  // podía colarse antes de que React lo bloqueara.
                  if (entrandoRef.current) return;
                  entrandoRef.current = true;
                  setEntrandoARitual(true);
                  router.push(`/rutina?min=${activo.minutos}&id=${rutinaHoy.id}`);
                }}
                className="mt-3 flex h-14 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--accent)] text-[length:var(--txt-body)] font-semibold text-[var(--sobre-acento)] shadow-[var(--shadow-2)] [touch-action:manipulation] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:opacity-70"
              >
                {entrandoARitual ? 'Entrando…' : 'Empezar mi ritual de hoy'}
                <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />
              </motion.button>
            </motion.section>

            {/* ── ESTA SEMANA: el gatillo de novedad (24-GAMIFICACION). Sin fondo de
                card ni radio: es información, no un control — no debe invitar el toque
                (hallazgo del revisor-visual, 2026-08-17). ── */}
            <motion.p
              variants={item}
              className="mt-3 flex items-center gap-2 px-1 text-[length:var(--txt-body)] leading-snug text-[var(--text-secondary)]"
            >
              <Sparkles size={16} strokeWidth={2} color="var(--accent)" aria-hidden="true" className="shrink-0" />
              {nuevas > 0 ? (
                <>
                  <strong className="text-[var(--text-primary)]">{nuevas} rutinas nuevas</strong>&nbsp;se sumaron esta
                  semana. Ya tienes {abiertasContadas} de 41 abiertas.
                </>
              ) : (
                <>Tienes {abiertasContadas} de 41 rutinas abiertas. El lunes se suman más.</>
              )}
            </motion.p>

            {/* ── TU ARCHIVO: la inversión — lo que ya escribió ── */}
            <motion.section variants={item} className="mt-6" aria-label="Tu archivo">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-[length:var(--txt-body)] font-semibold [font-family:var(--font-display)]">
                  Tu archivo
                </h2>
                {conCuenta && totalSesiones > 0 && (
                  <Link
                    href="/archivo"
                    className="text-[length:var(--txt-label)] font-semibold text-[var(--text-secondary)] underline underline-offset-4"
                  >
                    Ver todo
                  </Link>
                )}
              </div>

              {archivo.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] px-6 py-10 text-center">
                  <span aria-hidden="true" className="flex size-12 items-center justify-center rounded-full bg-[var(--chip-bg)]">
                    <Sparkles size={22} strokeWidth={1.8} color="var(--accent)" aria-hidden="true" />
                  </span>
                  <p className="text-[length:var(--txt-body)] leading-snug text-[var(--text-secondary)]">
                    Tu primera victoria va a vivir aquí en cuanto termines tu ritual de hoy.
                  </p>
                  <button
                    type="button"
                    disabled={entrandoARitual}
                    aria-busy={entrandoARitual}
                    onClick={() => {
                      if (entrandoRef.current) return;
                      entrandoRef.current = true;
                      setEntrandoARitual(true);
                      router.push(`/rutina?min=${activo.minutos}&id=${rutinaHoy.id}`);
                    }}
                    className="flex h-11 items-center gap-1.5 rounded-[var(--radius-button)] bg-[var(--accent)] px-5 text-[length:var(--txt-label)] font-semibold text-[var(--sobre-acento)] [touch-action:manipulation] disabled:opacity-70"
                  >
                    {entrandoARitual ? 'Entrando…' : 'Empezar mi ritual de hoy'}
                    <ArrowRight size={15} strokeWidth={2.4} aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <ul className="flex flex-col gap-2">
                  {archivo.map((a, n) => (
                    <li
                      key={`${a.nombre}-${n}`}
                      className="rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] p-4"
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-[length:var(--txt-body)] font-semibold">{a.nombre}</span>
                        {a.fecha && (
                          <span className="shrink-0 text-[length:var(--txt-label)] tabular-nums text-[var(--text-tertiary)]">
                            {FECHA_CORTA.format(new Date(a.fecha))}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[length:var(--txt-body)] leading-snug text-[var(--text-secondary)]">
                        «{a.teLlevas}»
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </motion.section>

            <motion.p variants={item} className="mt-4 text-center text-[length:var(--txt-label)] text-[var(--text-tertiary)]">
              Lo que escribes se queda solo en tu cuenta.
            </motion.p>
          </>
        )}
      </motion.main>

      {/* ── HITO DE RACHA — celebración nivel 2/5 (FICHA-ARTE: NUA reconoce,
          no lanza confeti explosivo). No fullscreen-modal: un overlay que se
          cierra con un toque, coherente con que la racha es "visible, no
          protagonista" incluso en su momento más grande (56, M2). ── */}
      <AnimatePresence>
        {hitoVisible !== null && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Hito alcanzado: racha de ${hitoVisible} días`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[color-mix(in_oklab,var(--text-primary)_45%,transparent)] px-6"
            onClick={() => setHitoVisible(null)}
            onKeyDown={(e) => {
              // Único elemento tabulable dentro (el botón "Seguir"): un Tab que se
              // escapara del diálogo dejaría navegar el fondo con el modal abierto.
              if (e.key === 'Escape') setHitoVisible(null);
              if (e.key === 'Tab') {
                e.preventDefault();
                seguirRef.current?.focus();
              }
            }}
          >
            <motion.div
              initial={reduce ? false : { opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 220, damping: 20 }}
              className="relative flex w-full max-w-xs flex-col items-center gap-1 rounded-[var(--radius-card)] bg-[var(--surface)] px-6 py-8 text-center shadow-[var(--shadow-2)]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setHitoVisible(null)}
                aria-label="Cerrar"
                className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full text-[var(--text-tertiary)] [touch-action:manipulation]"
              >
                <X size={16} strokeWidth={2} aria-hidden="true" />
              </button>
              {confeti && (
                <Lottie animationData={confeti} loop={false} className="pointer-events-none absolute inset-[-70px]" />
              )}
              <span
                aria-hidden="true"
                className="flex size-14 items-center justify-center rounded-full bg-[var(--chip-bg)]"
              >
                <Flame size={26} strokeWidth={2} color="var(--accent)" fill="var(--accent)" aria-hidden="true" />
              </span>
              <p className="mt-3 text-[length:var(--txt-hero)] font-bold leading-none tabular-nums [font-family:var(--font-display)]">
                {hitoVisible}
              </p>
              <p className="text-[length:var(--txt-label)] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                días de racha
              </p>
              <p className="mt-3 text-[length:var(--txt-body)] leading-snug text-[var(--text-primary)]">
                {HITO_COPY[hitoVisible]}
              </p>
              <button
                ref={seguirRef}
                type="button"
                onClick={() => setHitoVisible(null)}
                className="mt-6 flex h-11 w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] text-[length:var(--txt-body)] font-semibold text-[var(--sobre-acento)] [touch-action:manipulation]"
              >
                Seguir
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
