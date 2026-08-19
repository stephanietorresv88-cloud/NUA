'use client';

// PIEZAS DEL PANEL — interactivas (necesitan cliente): tooltip explicativo,
// número que cuenta al cargar (baseline 2 de las 7 de CLAUDE.md) y los dos
// gráficos reales sobre datos que sí existen (embudo de conversión y
// abandono por paso). Nada de esto inventa datos: solo dibuja mejor los que
// ya calculó app/admin/page.tsx en el servidor.

import { useEffect, useId, useRef, useState } from 'react';
import { animate } from 'motion/react';
import { Info } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';

/* ── <InfoTooltip> — ⓘ que explica un término técnico en simple, con tap/click
   y teclado (Escape cierra, blur cierra). Nunca hover-only: en celular no hay
   hover. ── */
export function InfoTooltip({ texto }: { texto: string }) {
  const [abierto, setAbierto] = useState(false);
  const id = useId();
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const cerrar = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setAbierto(false);
    };
    document.addEventListener('mousedown', cerrar);
    return () => document.removeEventListener('mousedown', cerrar);
  }, [abierto]);

  return (
    <span ref={ref} className="relative inline-flex">
      <button
        type="button"
        aria-expanded={abierto}
        aria-describedby={abierto ? id : undefined}
        aria-label="Qué significa esto"
        onClick={() => setAbierto((a) => !a)}
        onKeyDown={(e) => e.key === 'Escape' && setAbierto(false)}
        className="flex size-5 items-center justify-center text-[var(--text-tertiary)] [touch-action:manipulation]"
      >
        <Info size={15} strokeWidth={1.8} aria-hidden="true" />
      </button>
      {abierto && (
        <span
          id={id}
          role="tooltip"
          className="absolute left-1/2 top-full z-10 mt-1.5 w-56 -translate-x-1/2 rounded-[var(--radius-inner)] bg-[var(--text-primary)] px-3 py-2 text-[length:var(--txt-label)] leading-snug text-[var(--bg)] shadow-[var(--shadow-2)]"
        >
          {texto}
        </span>
      )}
    </span>
  );
}

/** Número que cuenta desde 0 al montar — nunca aparece estático (baseline 2). */
export function NumeroContado({ valor, sufijo = '' }: { valor: number; sufijo?: string }) {
  const [mostrado, setMostrado] = useState(0);
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setMostrado(valor);
      return;
    }
    const control = animate(0, valor, {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setMostrado(Math.round(v)),
    });
    return () => control.stop();
  }, [valor]);
  return (
    <>
      {mostrado}
      {sufijo}
    </>
  );
}

/** ↑/↓ vs el período anterior — solo cuando hay algo que comparar. */
export function Tendencia({ actual, anterior }: { actual: number; anterior: number }) {
  if (anterior === 0 && actual === 0) return null;
  if (anterior === 0) return null; // "infinito %" no dice nada útil
  const cambio = Math.round(((actual - anterior) / anterior) * 100);
  if (cambio === 0) return null;
  const sube = cambio > 0;
  return (
    <span
      className="text-[length:var(--txt-label)] font-semibold tabular-nums"
      style={{ color: sube ? 'var(--accent)' : 'var(--text-tertiary)' }}
    >
      {sube ? '↑' : '↓'} {Math.abs(cambio)}%
    </span>
  );
}

const COLOR_BARRA = 'var(--accent)';

export interface PasoEmbudo {
  etiqueta: string;
  valor: number;
}

/** Barra horizontal del embudo de conversión — cada paso, con grilla sutil. */
export function GraficoEmbudo({ pasos }: { pasos: PasoEmbudo[] }) {
  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={pasos} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 4 }}>
          <CartesianGrid horizontal={false} stroke="var(--text-tertiary)" strokeOpacity={0.15} />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="etiqueta"
            width={130}
            tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
            axisLine={false}
            tickLine={false}
          />
          <RechartsTooltip
            cursor={{ fill: 'var(--surface-2)' }}
            contentStyle={{
              background: 'var(--text-primary)',
              border: 'none',
              borderRadius: 'var(--radius-inner)',
              color: 'var(--bg)',
              fontSize: 12,
            }}
          />
          <Bar dataKey="valor" fill={COLOR_BARRA} radius={[0, 6, 6, 0]} isAnimationActive animationDuration={500}>
            {pasos.map((p) => (
              <Cell key={p.etiqueta} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Barras por paso del cuestionario — cuántas personas completan cada uno. */
export function GraficoAbandono({ pasos }: { pasos: { paso: number; valor: number }[] }) {
  const datos = pasos.map((p) => ({ etiqueta: `Paso ${p.paso}`, valor: p.valor }));
  return (
    <div className="h-[180px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={datos} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--text-tertiary)" strokeOpacity={0.15} />
          <XAxis dataKey="etiqueta" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} width={28} />
          <RechartsTooltip
            cursor={{ fill: 'var(--surface-2)' }}
            contentStyle={{
              background: 'var(--text-primary)',
              border: 'none',
              borderRadius: 'var(--radius-inner)',
              color: 'var(--bg)',
              fontSize: 12,
            }}
          />
          <Bar dataKey="valor" fill={COLOR_BARRA} radius={[6, 6, 0, 0]} isAnimationActive animationDuration={500} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
