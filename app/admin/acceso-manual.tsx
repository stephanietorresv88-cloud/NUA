'use client';

// RUTA DE RESCATE, en el panel — 18-VENTA-HOTMART: "compré y no me llega" es el
// ticket #1 de este modelo. Antes de que exista el webhook (o si falla), la
// dueña puede crear el acceso a mano desde aquí.

import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { crearAccesoManual } from './acciones';

export function FormularioAccesoManual() {
  const [correo, setCorreo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<{ ok: boolean; mensaje: string } | null>(null);

  const enviar = async () => {
    if (enviando || !correo.trim()) return;
    setEnviando(true);
    setResultado(null);
    const r = await crearAccesoManual(correo);
    setResultado(r);
    if (r.ok) setCorreo('');
    setEnviando(false);
  };

  return (
    // Borde punteado a propósito: es una herramienta de SOPORTE (rescate
    // ocasional), no la acción principal de la sección — mismo lenguaje
    // visual que las tarjetas "sin datos todavía" del resto del panel.
    <div className="flex flex-col gap-2 rounded-[var(--radius-card)] border border-dashed border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)] bg-[var(--surface)] px-4 py-4">
      <p className="flex items-center gap-1.5 text-[length:var(--txt-label)] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
        <UserPlus size={14} strokeWidth={2} aria-hidden="true" />
        Agregar acceso manual
      </p>
      <p className="text-[length:var(--txt-label)] text-[var(--text-tertiary)]">
        Para quien compró y no le llegó el acceso, o escribió mal su correo al comprar.
      </p>
      <div className="mt-1 flex gap-2">
        <input
          type="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && enviar()}
          placeholder="correo@ejemplo.com"
          className="min-w-0 flex-1 rounded-[var(--radius-inner)] border border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)] bg-[var(--bg)] px-3 py-2 text-[length:var(--txt-body)] placeholder:text-[var(--text-tertiary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        />
        <button
          type="button"
          onClick={enviar}
          disabled={enviando || !correo.trim()}
          aria-busy={enviando}
          className="shrink-0 rounded-[var(--radius-button)] bg-[var(--accent)] px-4 text-[length:var(--txt-body)] font-semibold text-[var(--sobre-acento)] disabled:opacity-40 [touch-action:manipulation]"
        >
          {enviando ? 'Creando…' : 'Crear acceso'}
        </button>
      </div>
      {resultado && (
        <p
          role="status"
          className="text-[length:var(--txt-label)]"
          style={{ color: resultado.ok ? 'var(--text-secondary)' : 'var(--error)' }}
        >
          {resultado.mensaje}
        </p>
      )}
    </div>
  );
}
