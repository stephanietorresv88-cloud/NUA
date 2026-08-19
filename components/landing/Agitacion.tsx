'use client';

// KIT DE LANDING — §3 AGITACIÓN (blueprint: 55 §3)
// El costo de seguir igual, visible. El tipo de `frases` es string[] a propósito:
// es IMPOSIBLE pasarle un párrafo de 72 palabras — cada frase es corta (máx 2
// líneas; warn a las 18 palabras). El NÚMERO del costo va en [b]/[acento] desde
// el copy marcado (es el dato héroe de la sección). MISMO fondo elevado que §2
// (un solo movimiento visual, sin separador). Cero decoración de miedo.

import { motion } from 'motion/react';
import { Kicker, SectionShell, useReveal, VIEWPORT_ONCE } from './ui';
import { MarkedCopy, warnCopy, warnRango } from './MarkedCopy';

export interface AgitacionProps {
  /** Eyebrow opcional (Kicker) — le da a la sección un titular que "escanear"
   *  sin nombrar la sección completa (regla de escaneabilidad, 2026-08-18). */
  eyebrow?: string;
  /** Titular opcional de la sección, MARCADO — sin él, 4 frases seguidas se leen
   *  como un párrafo sin ancla visual (mismo hallazgo). */
  tituloMarked?: string;
  /** 2-4 frases MARCADAS y cortas — el array es el contrato: nada de párrafos. */
  frases: string[];
  /** Mini-card opcional "hoy vs en 6 meses" (55 §3). */
  contraste?: {
    labelHoy: string;
    hoy: string;
    labelFuturo: string;
    futuro: string;
  };
  id?: string;
}

export function Agitacion({ eyebrow, tituloMarked, frases, contraste, id }: AgitacionProps) {
  warnRango('Agitación → frases', frases.length, 2, 4);
  frases.forEach((f, i) => warnCopy(`Agitación → frase ${i + 1}`, f, 18));
  const { contenedor, item } = useReveal();

  return (
    <SectionShell id={id} elevacion="elevada" flush="top" ariaLabel="El costo de seguir igual">
      <motion.div
        variants={contenedor}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
        className="mx-auto max-w-[620px]"
      >
        {eyebrow && (
          <motion.div variants={item}>
            <Kicker>{eyebrow}</Kicker>
          </motion.div>
        )}
        {tituloMarked && (
          <motion.h2
            variants={item}
            className="mb-6 text-balance text-[30px] font-bold leading-[1.15] text-[var(--text-primary)] [font-family:var(--font-display)] md:text-[40px]"
          >
            <MarkedCopy text={tituloMarked} />
          </motion.h2>
        )}
        {/* Cada frase con su propio borde izquierdo: 4 párrafos pegados se leían
            como un muro de texto sin ancla visual (regla de escaneabilidad,
            2026-08-18) — el borde las convierte en 4 bloques reconocibles, sin
            subirlas a card (seguirían siendo prosa, solo que enmarcada).
            MISMA técnica de degradé que <Hairline> (49 §13: acento que se
            desvanece a transparente), no un borde sólido plano — para que sea
            el mismo lenguaje de énfasis que el resto del kit, no uno nuevo.
            No se usa <Hairline> tal cual porque esa card está reservada a
            "el elemento" de la vista (máx 1-3 usos/página); aquí son 4 marcas
            repetidas, así que solo el borde toma prestada su receta de color. */}
        <div className="flex flex-col gap-4">
          {frases.map((f, i) => (
            <motion.p
              key={i}
              variants={item}
              style={{
                borderLeft: '2px solid transparent',
                borderImage:
                  'linear-gradient(180deg, color-mix(in oklab, var(--accent) 55%, transparent), transparent 85%) 1',
              }}
              className="pl-4 text-[17px] leading-[1.6] text-[var(--text-secondary)]"
            >
              <MarkedCopy text={f} />
            </motion.p>
          ))}
        </div>

        {contraste && (
          <motion.div variants={item} className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-[var(--radius-card)] bg-[var(--bg)] p-5">
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
                {contraste.labelHoy}
              </p>
              <p className="mt-2 text-[15px] leading-snug text-[var(--text-primary)]">{contraste.hoy}</p>
            </div>
            {/* "si nada cambia": más apagado/frío — el peso lo pone el copy, no el rojo */}
            <div className="rounded-[var(--radius-card)] bg-[var(--surface-2)] p-5">
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
                {contraste.labelFuturo}
              </p>
              <p className="mt-2 text-[15px] leading-snug text-[var(--text-secondary)]">{contraste.futuro}</p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </SectionShell>
  );
}
