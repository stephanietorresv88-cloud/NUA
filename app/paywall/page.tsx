'use client';

// PAYWALL DE NUA — la pantalla que cobra.
// Blueprint: 50 §C. Llega DESPUÉS del onboarding (Modelo 2 de 02C), cuando ella
// ya vio su ritual. Nunca antes.
//
// Decisiones que vienen de las fichas, no del gusto:
// - Su miedo #1 documentado (FICHA-AVATAR) es el cobro sorpresa. De ahí sale casi
//   todo lo de esta pantalla: el total es el número grande, el precio va pegado al
//   botón, se DECLARA que la suscripción se renueva sola, se dice que OXXO/PSE/PIX
//   se pagan a mano cada vez, y la salida "Ahora no" es neutra y visible.
// - NO se promete "7 días gratis": FICHA-MERCADO §4 marca la prueba de Hotmart como
//   NO VERIFICADA en el panel y posiblemente condicionada a tarjeta. La reversión de
//   riesgo es la GARANTÍA DE 30 DÍAS sobre el primer cobro (lo único que cubre
//   Hotmart en suscripciones — y así se dice, sin redondear a "30 días" a secas).
// - El ahorro del plan anual se CALCULA desde los dos precios. La v1 decía "ahorras
//   2 meses" con precios que dan 5,3 — un número inventado sobre dinero, en la
//   pantalla cuyo argumento entero es que aquí nadie miente sobre dinero.
//
// Anti-patrones de 50 §C5 evitados: X visible desde el frame 1 · total nunca oculto ·
// cerrar cierra a la primera y devuelve a SU ritual · el mensual es un precio real y
// comprable · cero urgencia falsa · cero confirmshaming · precio ≥14px.

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { track } from '@/lib/analytics';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, animate, motion, useReducedMotion } from 'motion/react';
import { CreditCard, Lock, Plus, RefreshCw, ShieldCheck, X } from 'lucide-react';
import { CAPACIDADES, type EstadoId } from '@/lib/rituales';
import { rutinasDe, type DuracionRutina } from '@/lib/rutinas';

/** ⚠️ Auditoría 2026-08-17: esto usaba `seleccionarExperiencia()` de `lib/rituales.ts`
 *  — el motor de microacciones que dejó de ser el producto real el 2026-08-14
 *  (ver ESTADO.md "EL MODELO DE RUTINAS CAMBIÓ"). Nadie actualizó esta pantalla
 *  cuando cambió el modelo: la demo llevaba tres días mostrando un ritual que ya
 *  no existe en la app. Ahora sale de `lib/rutinas.ts`, el mismo motor que
 *  `/hoy` y `/rutina` — es literalmente el ritual que ella va a hacer. */
const MINUTOS_POR_ESTADO: Record<EstadoId, DuracionRutina> = { reserva: 5, media: 15, energia: 20 };
const DEMOS: Record<EstadoId, ReturnType<typeof rutinasDe>[number]> = {
  reserva: rutinasDe(MINUTOS_POR_ESTADO.reserva)[0]!,
  media: rutinasDe(MINUTOS_POR_ESTADO.media)[0]!,
  energia: rutinasDe(MINUTOS_POR_ESTADO.energia)[0]!,
};

type PlanId = 'anual' | 'mensual';

/** Precios de FICHA-MERCADO §1. Números, no texto: todo lo demás se deriva. */
const PRECIO: Record<PlanId, number> = { mensual: 3.99, anual: 24.99 };

const usd = (n: number) => `USD ${n.toFixed(2).replace('.', ',')}`;

const ANUAL_SI_FUERA_MENSUAL = PRECIO.mensual * 12;
const AHORRO = ANUAL_SI_FUERA_MENSUAL - PRECIO.anual;
const AHORRO_PCT = Math.round((AHORRO / ANUAL_SI_FUERA_MENSUAL) * 100);

const PLANES: Record<
  PlanId,
  {
    nombre: string;
    /** Lo que va en el número grande: SIEMPRE el equivalente mensual. */
    mostrado: number;
    periodo: string;
    /** El cobro real, sin esconderlo. Va pegado al número, no en letra chica. */
    equivalencia: string;
    nota: string;
    /** Se DECLARA la renovación automática. Callarla es la letra pequeña que la
     *  hizo escribir "ladrones, yo no contraté ninguna suscripción". */
    renovacion: string;
  }
> = {
  // 2026-08-18, crítica de expertos (2ª ronda): el número grande del anual mostraba
  // el equivalente mensual (3,33) con el cobro real chico debajo — el REVÉS exacto
  // de cómo lo hace la landing (Oferta, `docs/copy/landing.md` §6: "el número grande
  // es el TOTAL anual, no el prorrateo — esconder el total tras un '/mes' es la
  // mecánica que la hizo escribir 'me han cobrado sin avisar, una estafa'"). Dos
  // pantallas del mismo funnel aplicaban la regla opuesta al mismo dato, justo donde
  // se mete la tarjeta. Ahora el paywall es IGUAL que la landing: el total manda.
  anual: {
    nombre: 'Anual',
    mostrado: PRECIO.anual,
    periodo: '/año',
    equivalencia: `Equivale a ${usd(PRECIO.anual / 12)} al mes`,
    nota: `Te ahorras ${usd(AHORRO)} frente a pagar mes a mes`,
    renovacion: 'Se renueva cada año hasta que la canceles',
  },
  mensual: {
    nombre: 'Mensual',
    mostrado: PRECIO.mensual,
    periodo: '/mes',
    equivalencia: `Se cobra ${usd(PRECIO.mensual)} cada mes`,
    nota: `Serían ${usd(ANUAL_SI_FUERA_MENSUAL)} en un año`,
    renovacion: 'Se renueva cada mes hasta que la canceles',
  },
};

// 2026-08-18: Hotmart no distingue el plan por un parámetro `?plan=` inventado por la
// app — cada plan es una OFERTA distinta (`off=...`) del mismo producto, con su propio
// enlace de pago. Antes había un solo CHECKOUT genérico con un `plan` de mentira pegado
// encima; ahora cada plan tiene su URL real, tal como la dueña la copió de su panel.
const CHECKOUT: Record<PlanId, string> = {
  mensual: process.env.NEXT_PUBLIC_HOTMART_CHECKOUT_MENSUAL ?? '',
  anual: process.env.NEXT_PUBLIC_HOTMART_CHECKOUT_ANUAL ?? '',
};

const ESTADOS = ['reserva', 'media', 'energia'] as const;

const ARCOS: { id: (typeof ESTADOS)[number]; d: string }[] = [
  { id: 'reserva', d: 'M32 118.5 A88 88 0 0 1 73.4 45.4' },
  { id: 'media', d: 'M78.7 42.3 A88 88 0 0 1 161.3 42.3' },
  { id: 'energia', d: 'M166.6 45.4 A88 88 0 0 1 208 118.5' },
];

/** Las preguntas que se hace con el dedo sobre el botón (FICHA-AVATAR). */
const FAQ: { p: string; r: string }[] = [
  {
    p: '¿Qué pasa justo después de pagar?',
    r: 'Recibes un correo con tu acceso y creas tu cuenta con el mismo correo de la compra. Tu ritual de hoy te está esperando dentro.',
  },
  {
    p: '¿Y si termino no usándolo?',
    // No se la manda a "escribir" a ninguna parte sin decirle a dónde: el correo de
    // soporte llega con la compra (lo envía Hotmart con los datos del productor).
    r: 'Tienes 30 días desde tu primer cobro para pedir el reembolso completo, sin dar explicaciones. Lo pides desde tu área de compras de Hotmart o respondiendo al correo de tu compra.',
  },
  {
    p: '¿Cómo cancelo si quiero?',
    r: 'Desde tu área de compras de Hotmart, cuando quieras. No hay que llamar a nadie ni pedir permiso.',
  },
  {
    // FICHA-MERCADO §3: OXXO, PSE, boleto y PIX NO se auto-cobran. Callarlo le
    // regalaría doce sustos al año a quien no paga con tarjeta.
    p: '¿Y si pago con OXXO, PSE o PIX?',
    r: 'Esos medios no se cobran solos: en cada renovación te llega un código nuevo que pagas a mano. Con el plan anual eso pasa una vez al año, no doce.',
  },
];

/** Conteo animado del número héroe (baseline 2 de las 7 de CLAUDE.md). El PRECIO no
 *  se anima a propósito: un precio que sube solo parece tragamonedas justo donde ella
 *  necesita confiar en el número. */
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

/** Acordeón propio en vez de <details>: el nativo abre de golpe (no se puede animar
 *  el cierre de forma fiable entre navegadores). Mantiene el contrato de
 *  accesibilidad: botón con aria-expanded + región con aria-labelledby. */
function Pregunta({
  q,
  r,
  abierta,
  onToggle,
  foco,
}: {
  q: string;
  r: string;
  abierta: boolean;
  onToggle: () => void;
  foco: string;
}) {
  const reduce = useReducedMotion();
  const id = q.replace(/\W+/g, '-').toLowerCase();
  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_45%,transparent)]">
      <button
        type="button"
        id={`${id}-btn`}
        aria-expanded={abierta}
        aria-controls={id}
        onClick={onToggle}
        className={`flex min-h-11 w-full items-center justify-between gap-3 px-4 py-3 text-left text-[length:var(--txt-subtitle)] font-semibold [touch-action:manipulation] ${foco}`}
      >
        {q}
        <motion.span
          aria-hidden="true"
          animate={{ rotate: abierta ? 45 : 0 }}
          transition={{ duration: reduce ? 0 : 0.2 }}
          className="shrink-0 text-[var(--accent)]"
        >
          <Plus size={20} strokeWidth={2.2} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {abierta && (
          <motion.div
            id={id}
            role="region"
            aria-labelledby={`${id}-btn`}
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.2, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <p className="px-4 pb-3 text-[length:var(--txt-body)] leading-snug text-[var(--text-secondary)]">
              {r}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PaywallContenido() {
  const params = useSearchParams();
  const planInicial: PlanId = params.get('plan') === 'mensual' ? 'mensual' : 'anual';
  const [plan, setPlan] = useState<PlanId>(planInicial);
  const [enviando, setEnviando] = useState(false);
  const [abierta, setAbierta] = useState<number | null>(null);
  // Dos causas distintas, dos mensajes distintos: "todavía no abrimos" y "algo se
  // rompió" no son lo mismo, y confundirlas sería mentir sobre dinero.
  const [aviso, setAviso] = useState<'cerrado' | 'error' | null>(null);
  // El dato que MÁS personaliza no es el nombre: es lo que ella acaba de ELEGIR
  // (52, hallazgo 5). Ya lo tenemos del onboarding y no cuesta pedirle nada.
  // Arranca en 'reserva' y se corrige tras montar, para no romper la hidratación.
  const [suEstado, setSuEstado] = useState<EstadoId>('reserva');
  const reduce = useReducedMotion();
  const ofertaRef = useRef<HTMLDivElement>(null);

  // paywall_visto: SOLO cuando el bloque de plan+precio entra >=35% al viewport
  // (60-OPERACION-DE-CONVERSION) — el render del componente no cuenta como visto.
  useEffect(() => {
    const nodo = ofertaRef.current;
    if (!nodo) return;
    const observer = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada?.isIntersecting) return;
        void track('paywall_visto', { plan });
        observer.disconnect();
      },
      { threshold: 0.35 },
    );
    observer.observe(nodo);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- una sola vez por montaje
  }, []);

  useEffect(() => {
    // try/catch: con el almacenamiento bloqueado (modo privado) esto lanzaba y la
    // pantalla que COBRA se quedaba en blanco. Si no hay dato, se enseña el ritual
    // de reserva, que es un ejemplo honesto igual.
    let g: string | null = null;
    try {
      g = window.localStorage.getItem('nua.estado');
    } catch {
      g = null;
    }
    if (g === 'reserva' || g === 'media' || g === 'energia') setSuEstado(g);
  }, []);

  const demo = DEMOS[suEstado];
  // Baseline 2 de las 7: el número héroe cuenta, no aparece. El dial de la landing y
  // el onboarding ya animaban este mismo dato; aquí no.
  const minutosContados = useConteo(demo.duracion, reduce);

  const irAlCheckout = () => {
    if (enviando) return; // anti doble-tap en la acción que cobra
    const checkoutDelPlan = CHECKOUT[plan];
    if (!checkoutDelPlan) {
      setAviso('cerrado');
      return;
    }
    setEnviando(true);
    try {
      const url = new URL(checkoutDelPlan);
      // Se registra justo antes de salir de verdad hacia Hotmart — no cuando el
      // enlace todavía no existe (rama `!checkoutDelPlan` de arriba), eso no es un
      // checkout iniciado real (60-OPERACION-DE-CONVERSION).
      void track('checkout_iniciado', { plan_elegido: plan });
      window.location.href = url.toString();
    } catch {
      // Un enlace mal configurado dejaría el botón congelado en "Abriendo el pago
      // seguro…" para siempre. Se libera y se dice la verdad.
      setEnviando(false);
      setAviso('error');
    }
  };

  const foco =
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]';

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--bg)] text-[var(--text-primary)] [font-family:var(--font-body)]">
      {/* BLOQUE 1 (elevado) — cierre + promesa + el mecanismo a la vista */}
      <div className="rounded-b-[var(--radius-card)] bg-[var(--bloque-lavanda)] px-5 pb-6">
        {/* (1) CIERRE — visible desde el primer frame, 44px. Es ley (dark patterns). */}
        {/* -ml-3 pone el ícono en el mismo eje vertical que el titular: centrado en
            un área táctil de 44px, quedaba 4px hacia dentro. */}
        {/* Marca + salida: dónde estoy, qué app es, cómo vuelvo (52 §6). */}
        <header className="-ml-3 flex items-center justify-between pt-3">
          <Link
            href="/onboarding?ritual=1"
            aria-label="Cerrar y volver a mi ritual"
            className={`flex size-11 items-center justify-center rounded-full text-[var(--text-secondary)] [touch-action:manipulation] ${foco}`}
          >
            <X size={20} strokeWidth={2} aria-hidden="true" />
          </Link>
          <Link
            href="/"
            aria-label="NUA — ir al inicio"
            className={`flex h-11 items-center px-2 text-[length:var(--txt-body)] font-semibold tracking-[0.2em] text-[var(--accent)] [font-family:var(--font-display)] [touch-action:manipulation] ${foco}`}
          >
            NUA
          </Link>
        </header>

        {/* (2) HEADLINE — vende el mecanismo, no "elige tu plan" */}
        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-1 text-[length:var(--txt-title)] leading-tight [font-family:var(--font-display)]"
        >
          {/* El titular vende el DESEO, no el mecanismo (52 §1: nadie desea un motor
              adaptativo). El Dial pasa a la línea de abajo, sosteniendo la promesa.
              Gloock tiene un solo peso: el énfasis va por color + hairline. */}
          Cuídate también{' '}
          <span className="border-b-2 border-[var(--accent)] pb-0.5 text-[var(--accent)]">
            los días imposibles
          </span>
        </motion.h1>
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: reduce ? 0 : 0.08 }}
          className="mt-3 text-[length:var(--txt-body)] leading-relaxed text-[var(--text-secondary)]"
        >
          Tu Dial de Energía ajusta el ritual a cómo llegues. Todos los días.
        </motion.p>

        {/* EL DIAL, no tres puntos: el titular lo nombra, así que tiene que verse.
            Es el detalle firma de la marca (FICHA-ARTE) y lo único de NUA que no es
            intercambiable con cualquier app de hábitos. */}
        <div className="mt-4 flex flex-col items-center">
          <svg viewBox="0 0 240 132" className="h-24 shrink-0" aria-hidden="true">
            <g fill="none" strokeLinecap="round" strokeWidth={22}>
              {ARCOS.map((a, i) => (
                <motion.path
                  key={a.id}
                  d={a.d}
                  stroke={`var(--estado-${a.id})`}
                  initial={reduce ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 + i * 0.08, ease: [0.22, 0.61, 0.36, 1] }}
                />
              ))}
            </g>
            <motion.g
              initial={reduce ? false : { rotate: -58 }}
              animate={{ rotate: 0 }}
              transition={{ type: 'spring', stiffness: 90, damping: 13, delay: 0.35 }}
              style={{ originX: '120px', originY: '120px' }}
            >
              <path
                d="M120 120 L120 52"
                stroke="var(--dial-aguja)"
                strokeWidth={7}
                strokeLinecap="round"
              />
            </motion.g>
            <circle cx="120" cy="120" r="12" fill="var(--dial-aguja)" />
            <circle cx="120" cy="120" r="4" fill="var(--bloque-lavanda)" />
          </svg>

          {/* La lista de los tres estados se quitó por repetir la card del ritual, y el
              recorte se pasó: era la ÚNICA leyenda del dial y la única respuesta a "no
              tengo tiempo". Vuelve como UNA línea, no como un bloque de tres. */}
          <p className="mt-2 text-center text-[length:var(--txt-body)] text-[var(--text-secondary)]">
            Desde {DEMOS.reserva.duracion} minutos hasta {DEMOS.energia.duracion}, según cómo
            llegues.
          </p>
        </div>
      </div>

      {/* pb-36 reserva la altura de la barra de compra (fija, fuera del flujo):
          sin eso la barra rebanaba la última línea de la card anual. */}
      <main className="flex flex-1 flex-col px-5 pb-[var(--h-barra-compra)]">
        {/* Los tres bullets de prosa se fueron: decían con palabras lo que la card de
            abajo DEMUESTRA con el ritual real. Menos texto y más producto — que es
            exactamente lo que la dueña pidió el 2026-08-13. */}

        {/* LA DEMO — sin clientas que la avalen, lo único que le queda a NUA
            para probar que existe es ENSEÑARSE (FICHA-AVATAR: demo + garantía +
            transparencia sustituyen a la prueba social). Es el ritual de verdad,
            armado por el mismo motor que usa la app. */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduce ? 0 : 0.28, duration: 0.35 }}
          className="mt-6 rounded-[var(--radius-card)] bg-[var(--surface)] px-4 py-4 shadow-[var(--shadow-2)]"
        >
          {/* "El ritual que acabas de hacer" no era exacto: en el onboarding ejecuta
              UNA microacción, no el ritual entero. */}
          <p className="text-[length:var(--txt-label)] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
            El ritual que armaste hoy
          </p>
          <div className="mt-3 flex items-center gap-3">
            {/* El número llevaba su unidad en ninguna parte: un "19" suelto en un
                círculo no dice de qué. */}
            <span
              aria-hidden="true"
              className="flex size-14 shrink-0 flex-col items-center justify-center rounded-full leading-none"
              style={{ background: `var(--estado-${suEstado})` }}
            >
              <span className="text-[length:var(--txt-subtitle)] tabular-nums [font-family:var(--font-display)]">
                {minutosContados}
              </span>
              <span className="text-[length:var(--txt-label)]">min</span>
            </span>
            <p className="text-[length:var(--txt-body)] leading-snug">
              <strong className="block text-[length:var(--txt-subtitle)] font-semibold leading-tight">
                Hoy entrenamos {CAPACIDADES[demo.capacidad].posesivo}{' '}
                {CAPACIDADES[demo.capacidad].nombre.toLowerCase()}
              </strong>
              <span className="block text-[var(--text-secondary)]">{demo.subtitulo}</span>
            </p>
          </div>
          {/* Se enseñan TRES pasos, no los seis o siete del ritual: el resto se
              nombra. Volcar la lista entera aquí era la mitad del muro. */}
          <ul className="mt-3 flex flex-col gap-2">
            {demo.bloques.slice(0, 3).map((b) => {
              const segundos = Math.round((b.hasta - b.desde) * 60);
              return (
                <li
                  key={b.id}
                  className="flex items-baseline justify-between gap-3 rounded-[var(--radius-inner)] bg-[var(--surface-2)] px-3 py-2 text-[length:var(--txt-body)] leading-snug"
                >
                  <span className="font-semibold">{b.titulo}</span>
                  <span className="shrink-0 text-[length:var(--txt-label)] tabular-nums text-[var(--text-secondary)]">
                    {segundos < 60 ? `${segundos} s` : `${Math.round(segundos / 60)} min`}
                  </span>
                </li>
              );
            })}
          </ul>
          {demo.bloques.length > 3 && (
            <p className="mt-2 text-[length:var(--txt-label)] text-[var(--text-secondary)]">
              y {demo.bloques.length - 3} pasos más
            </p>
          )}
          {/* ¿QUÉ PIERDO SI NO SIGO? — la pregunta 3 de las 7. Honesta y literal:
              sin cuenta no hay historial, y sin historial el motor no puede adaptarse.
              Nada de "vas a fracasar sin esto" (eso sería culpa, no pérdida). */}
          <p className="mt-3 flex items-start gap-2 rounded-[var(--radius-inner)] bg-[var(--surface-2)] px-3 py-2 text-[length:var(--txt-body)] leading-snug">
            <Lock size={16} strokeWidth={1.8} className="mt-0.5 shrink-0" aria-hidden="true" />
            Sin cuenta, mañana NUA no recuerda cómo llegaste hoy.
          </p>
          {/* La frase de práctica es CONTENIDO del producto, no una nota al pie: se le
              da su sitio, en la tipografía de marca. Es "lo que te llevas" real de esta
              rutina, no una frase aparte inventada para la demo. */}
          <p className="mt-4 border-l-2 border-[var(--accent)] pl-3 text-[length:var(--txt-subtitle)] leading-snug [font-family:var(--font-display)]">
            «{demo.victoria.teLlevas}»
          </p>
        </motion.div>

        {/* (4)(5) PLANES — el anual viene preseleccionado por ser el recomendado
            honesto (mejor valor real y evita 12 pagos manuales por OXXO/PSE/PIX),
            no por ser el más caro. El mensual es un precio REAL y comprable, con su
            total anual a la vista para que la comparación no sea tramposa.
            Un role="radio" obliga a mover la selección con flechas y a que solo el
            elegido sea tabulable: sin eso es un radiogroup de mentira. */}
        <div
          ref={ofertaRef}
          className="mt-6 flex flex-col gap-3"
          role="radiogroup"
          aria-label="Elige tu plan"
          onKeyDown={(e) => {
            if (!['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'].includes(e.key)) return;
            e.preventDefault();
            const otro: PlanId = plan === 'anual' ? 'mensual' : 'anual';
            setPlan(otro);
            void track('paywall_plan_elegido', { plan_elegido: otro });
            (e.currentTarget.querySelector(`[data-plan="${otro}"]`) as HTMLElement | null)?.focus();
          }}
        >
          {(Object.keys(PLANES) as PlanId[]).map((id) => {
            const p = PLANES[id];
            const on = plan === id;
            return (
              <motion.button
                key={id}
                type="button"
                role="radio"
                aria-checked={on}
                data-plan={id}
                tabIndex={on ? 0 : -1}
                onClick={() => {
                  setPlan(id);
                  void track('paywall_plan_elegido', { plan_elegido: id });
                }}
                whileTap={{ scale: 0.98 }}
                /* El borde se queda en 1px y la selección se marca con ring: pasar
                   de border a border-2 movía el contenido 1px en cada toque. */
                className={`rounded-[var(--radius-card)] border bg-[var(--surface)] px-4 py-4 text-left transition-[box-shadow,border-color] duration-200 [touch-action:manipulation] ${foco} ${
                  on
                    ? 'border-[var(--accent)] shadow-[var(--shadow-2)] ring-2 ring-[var(--accent)]'
                    : 'border-[var(--text-tertiary)]'
                }`}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[length:var(--txt-subtitle)] font-semibold">{p.nombre}</span>
                  {id === 'anual' && (
                    <span className="rounded-full bg-[var(--accent)] px-3 py-1 text-[length:var(--txt-label)] font-bold uppercase tracking-wider text-white">
                      Ahorras {AHORRO_PCT}%
                    </span>
                  )}
                </div>
                <p className="mt-2 flex items-baseline gap-1">
                  <span className="text-[length:var(--txt-title)] leading-none tabular-nums [font-family:var(--font-display)]">
                    {usd(p.mostrado)}
                  </span>
                  <span className="text-[length:var(--txt-body)] text-[var(--text-secondary)]">
                    {p.periodo}
                  </span>
                </p>
                {/* El cobro real, en el mismo tamaño que el resto: la equivalencia
                    mensual acompaña al total, NUNCA lo sustituye (52 §2). */}
                <p className="mt-1 text-[length:var(--txt-body)] font-semibold">
                  {p.equivalencia}
                </p>
                <p className="mt-1 text-[length:var(--txt-body)] text-[var(--text-secondary)]">
                  {p.nota}
                </p>
              </motion.button>
            );
          })}
        </div>

        {/* (8) SALIDA LIMPIA — neutra, sin culpa, 44px táctil */}
        <div className="mt-6 text-center">
          <Link
            href="/onboarding?ritual=1"
            className={`inline-flex h-11 items-center rounded-[var(--radius-button)] px-4 text-[length:var(--txt-body)] text-[var(--text-secondary)] underline underline-offset-4 [touch-action:manipulation] ${foco}`}
          >
            Ahora no
          </Link>
        </div>

        {/* (9) ZONA DE CONFIANZA — hundida (--surface-2), separada por hairline
            degradé. Cada línea es verificable en FICHA-MERCADO §3 y §4; lo que no
            está montado todavía (avisos por correo propios) NO se promete. */}
        <div
          aria-hidden="true"
          className="mt-8 h-px w-full bg-[linear-gradient(90deg,transparent,color-mix(in_oklab,var(--accent)_35%,transparent),transparent)]"
        />
        <div className="mt-6 flex flex-col gap-3 rounded-[var(--radius-card)] bg-[var(--surface-2)] px-4 py-4 text-[length:var(--txt-body)] text-[var(--text-secondary)]">
          <span className="flex items-start gap-2">
            <ShieldCheck size={16} strokeWidth={1.8} className="mt-0.5 shrink-0" aria-hidden="true" />
            {/* Precisión obligada por FICHA-MERCADO §4: en suscripciones la garantía
                de Hotmart cubre la adhesión, no las renovaciones. Decir "30 días de
                garantía" a secas sería la letra pequeña que ella odia.
                2026-08-18, crítica de expertos #2: este texto y el de la landing
                prometían DOS mecanismos distintos ("correo" vs. "área de compras de
                Hotmart") para la misma garantía. Unificado — mismo texto en ambas
                pantallas, palabra por palabra. */}
            <span>
              <strong className="font-semibold text-[var(--text-primary)]">
                Garantía del Día Difícil:
              </strong>{' '}
              Si en 30 días NUA no te ayudó a encontrar ni un momento para ti, lo
              pides desde tu área de compras de Hotmart. Sin explicaciones.
            </span>
          </span>
          <span className="flex items-start gap-2">
            <RefreshCw size={16} strokeWidth={1.8} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>
              <strong className="font-semibold text-[var(--text-primary)]">
                {PLANES[plan].renovacion}.
              </strong>{' '}
              Cancelas desde tu área de compras de Hotmart, sin llamar a nadie.
            </span>
          </span>
          <span className="flex items-start gap-2">
            <Lock size={16} strokeWidth={1.8} className="mt-0.5 shrink-0" aria-hidden="true" />
            El cobro lo procesa Hotmart: NUA nunca ve tu tarjeta.
          </span>
          <span className="flex items-start gap-2">
            <CreditCard size={16} strokeWidth={1.8} className="mt-0.5 shrink-0" aria-hidden="true" />
            También puedes pagar con OXXO en México, PSE en Colombia o PIX en Brasil.
          </span>
        </div>

        {/* (10) LAS PREGUNTAS QUE SE HACE CON EL DEDO SOBRE EL BOTÓN */}
        <div className="mt-6 flex flex-col gap-2">
          {FAQ.map((f, i) => (
            <Pregunta key={f.p} q={f.p} r={f.r} abierta={abierta === i} onToggle={() => setAbierta(abierta === i ? null : i)} foco={foco} />
          ))}
        </div>

        {/* Ancla emocional de FICHA-AVATAR: se repite en landing, onboarding y aquí. */}
        <p className="mt-8 text-center text-[length:var(--txt-title)] [font-family:var(--font-display)]">
          Hoy también cuenta.
        </p>
      </main>

      {/* (6)(7) BARRA DE COMPRA — pegada abajo para que el precio y la acción nunca
          queden fuera de pantalla en un teléfono real (50 §C1). */}
      <div className="fixed inset-x-0 bottom-0 border-t border-[color-mix(in_oklab,var(--accent)_15%,transparent)] bg-[color-mix(in_oklab,var(--bg)_92%,transparent)] px-5 pb-5 pt-3 backdrop-blur">
        {/* El aviso vive DENTRO de la barra: si apareciera arriba, ella tocaría el
            botón desde abajo y no vería ninguna respuesta. */}
        {aviso && (
          <motion.p
            role="status"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            /* Va como capa SOBRE la barra: si creciera la barra, el colchón
               reservado (--h-barra-compra) se quedaría corto y taparía el final. */
            className="absolute inset-x-5 bottom-full mb-2 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--accent)_30%,transparent)] bg-[var(--surface)] px-4 py-3 text-[length:var(--txt-body)] leading-snug shadow-[var(--shadow-2)]"
          >
            {aviso === 'cerrado'
              ? 'NUA todavía no abrió las inscripciones, así que este botón aún no cobra nada. Tu ritual de hoy sigue disponible: toca «Ahora no» y vuelves a él.'
              : 'No pudimos abrir la página de pago. No se te cobró nada. Vuelve a tocar el botón en un momento.'}
          </motion.p>
        )}
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={irAlCheckout}
          aria-busy={enviando}
          className={`flex h-14 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--accent)] text-[length:var(--txt-body)] font-semibold text-white shadow-[var(--shadow-2)] [touch-action:manipulation] ${foco}`}
        >
          {enviando ? 'Abriendo el pago seguro…' : 'Quiero empezar a cuidarme hoy'}
        </motion.button>
        {/* El precio y la renovación van PEGADOS al botón: nunca hay que tocar para
            enterarse de cuánto es ni de que se renueva (anti-patrón §C5). */}
        <p className="mt-2 text-center text-[length:var(--txt-body)] leading-snug text-[var(--text-secondary)]">
          <span className="font-semibold tabular-nums text-[var(--text-primary)]">
            {usd(PLANES[plan].mostrado)}
            {PLANES[plan].periodo}
          </span>{' '}
          · {PLANES[plan].equivalencia} · garantía de 30 días
        </p>
        {/* La renovación se había caído de aquí y solo vivía a dos scrolls. Es el
            miedo #1 documentado de la ficha: va pegada al botón, siempre. */}
        <p className="mt-1 text-center text-[length:var(--txt-label)] text-[var(--text-secondary)]">
          {PLANES[plan].renovacion}.
        </p>
      </div>
    </div>
  );
}

export default function Paywall() {
  return (
    <Suspense
      fallback={
        /* Esqueleto con la forma real de la pantalla: en una conexión lenta se ve
           NUA cargando, no un rectángulo blanco (rendimiento percibido, 15). */
        <div className="flex min-h-dvh flex-col bg-[var(--bg)]">
          <div className="h-72 rounded-b-[var(--radius-card)] bg-[var(--bloque-lavanda)]" />
          <div className="flex flex-col gap-3 px-5 pt-6">
            <div className="h-6 w-3/4 rounded-full bg-[var(--surface-2)]" />
            <div className="h-6 w-2/3 rounded-full bg-[var(--surface-2)]" />
            <div className="mt-3 h-32 rounded-[var(--radius-card)] bg-[var(--surface-2)]" />
          </div>
          <div className="mt-auto border-t border-[color-mix(in_oklab,var(--accent)_15%,transparent)] px-5 pb-5 pt-3">
            <div className="h-14 rounded-[var(--radius-button)] bg-[var(--surface-2)]" />
          </div>
        </div>
      }
    >
      <PaywallContenido />
    </Suspense>
  );
}
