'use client';

// KIT DE LANDING — §9 CTA FINAL EMOCIONAL + PS (blueprint: 55 §9)
// El bloque de MÁXIMO contraste de la página: fondo INVERTIDO (usa
// --text-primary como fondo y --bg como texto), sin nav ni distracciones.
// H2 emocional ≤8 palabras (warn) · future pacing 1-2 líneas en presente y 2ª
// persona · CTA ≥56px con el MISMO verbo del hero (42) · recap riesgo/urgencia
// SOLO con datos reales · PS estilo carta (borde izquierdo en acento) — el
// segundo texto más leído de la página (19 §9). Nada se interpone entre el PS
// y el footer.

import { motion } from 'motion/react';
import { useReveal, VIEWPORT_ONCE } from './ui';
import { MarkedCopy, warnCopy } from './MarkedCopy';

export interface CtaFinalProps {
  /** Copy MARCADO — headline emocional, máx 8 palabras (warn). */
  h2Marked: string;
  /** Copy MARCADO — future pacing 1-2 líneas, presente, 2ª persona (warn a 24). */
  futurePacingMarked: string;
  /** MISMO texto y verbo del CTA héroe (42). */
  ctaLabel: string;
  ctaHref: string;
  /** Recap riesgo/urgencia bajo el CTA — cupo SOLO si es real (19). */
  recap?: string;
  /** El PS de la oferta Hormozi — máx 4 líneas (~55 palabras, warn). */
  psMarked?: string;
  /** default 'cta-final' — lo observa StickyCtaMobile para ocultarse. */
  id?: string;
  /** Foto opcional de fondo (el "después" emocional) — con overlay oscuro para
   *  que el texto siga con contraste alto. Sin ella, el bloque queda igual que
   *  antes (fondo sólido invertido). */
  photoSrc?: string;
}

export function CtaFinal({
  h2Marked,
  futurePacingMarked,
  ctaLabel,
  ctaHref,
  recap,
  psMarked,
  id = 'cta-final',
  photoSrc,
}: CtaFinalProps) {
  warnCopy('CtaFinal → h2', h2Marked, 8);
  warnCopy('CtaFinal → future pacing', futurePacingMarked, 24);
  if (psMarked !== undefined) warnCopy('CtaFinal → PS', psMarked, 55);
  const { contenedor, item } = useReveal();

  return (
    <section
      id={id}
      aria-label="Empieza hoy"
      className="relative overflow-hidden py-20 md:py-24"
      style={{ background: 'var(--text-primary)' }}
    >
      {photoSrc && (
        <img
          src={photoSrc}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
      )}
      {/* Profundidad también en el bloque invertido: radial sutil del acento.
          Con foto de fondo, se suma un velo oscuro para que el texto siga AA. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: photoSrc
            ? 'linear-gradient(180deg, color-mix(in oklab, var(--text-primary) 88%, transparent) 0%, color-mix(in oklab, var(--text-primary) 75%, transparent) 100%)'
            : 'radial-gradient(720px 420px at 50% 0%, color-mix(in oklab, var(--accent) 16%, transparent) 0%, transparent 60%)',
        }}
      />

      <motion.div
        variants={contenedor}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
        className="relative mx-auto flex max-w-[680px] flex-col items-center px-5 text-center"
      >
        <motion.h2
          variants={item}
          className="text-balance text-[30px] font-bold leading-[1.15] [font-family:var(--font-display)] md:text-[44px]"
          style={{ color: 'var(--bg)' }}
        >
          <MarkedCopy text={h2Marked} />
        </motion.h2>

        <motion.p
          variants={item}
          className="mt-4 max-w-[520px] text-[17px] leading-relaxed"
          style={{ color: 'color-mix(in oklab, var(--bg) 78%, transparent)' }}
        >
          <MarkedCopy text={futurePacingMarked} />
        </motion.p>

        <motion.div variants={item} className="mt-8 w-full sm:w-auto">
          {/* Fill crema (--bg) sobre fondo invertido: --accent aquí medía ≈1.8:1
              contra el fondo --text-primary de esta sección (revisor-visual,
              landing v4) — el CTA no resaltaba en el bloque que más lo necesita.
              --bg sobre --text-primary sí da el contraste alto de este bloque. */}
          <motion.a
            whileTap={{ scale: 0.97 }}
            href={ctaHref}
            className="inline-flex h-14 w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--bg)] px-8 text-[17px] font-semibold text-[var(--text-primary)] shadow-[0_8px_30px_color-mix(in_oklab,var(--bg)_25%,transparent)] transition-colors duration-150 hover:bg-[color-mix(in_oklab,var(--bg)_88%,transparent)] [touch-action:manipulation] sm:w-auto"
          >
            {ctaLabel}
          </motion.a>
        </motion.div>

        {recap && (
          <motion.p
            variants={item}
            className="mt-3 text-[13px]"
            style={{ color: 'color-mix(in oklab, var(--bg) 65%, transparent)' }}
          >
            {recap}
          </motion.p>
        )}

        {psMarked !== undefined && (
          <motion.p
            variants={item}
            className="mt-10 max-w-[520px] border-l-2 pl-4 text-left text-[15px] italic leading-[1.6]"
            style={{
              borderColor: 'var(--accent)',
              color: 'color-mix(in oklab, var(--bg) 80%, transparent)',
            }}
          >
            <MarkedCopy text={psMarked} />
          </motion.p>
        )}
      </motion.div>
    </section>
  );
}
