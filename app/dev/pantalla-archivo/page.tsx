'use client';

// RUTA DE DESARROLLO (no enlazada desde ningún sitio, no indexable).
// Mismo motivo que /dev/pantalla-dial: el Archivo real vive detrás del login
// por correo (Supabase) y no se puede fotografiar sin una sesión real. Esta
// ruta reutiliza el MISMO markup del Archivo con datos semilla realistas
// (nombres y "te llevas" reales de lib/rutinas.ts) para el carrusel de la
// landing — no es una pantalla nueva, es la misma pantalla con datos fijos.

const FECHA_LARGA = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long', year: 'numeric' });

const ENTRADAS = [
  {
    id: '1',
    nombre: 'El Aterrizaje',
    teLlevas: 'Puedo decidir cómo entro al día antes de que el día decida por mí.',
    fecha: '2026-08-17',
  },
  {
    id: '2',
    nombre: 'La Bajada de las Seis',
    teLlevas: 'Puedo bajar el ritmo a media tarde sin sentir que fallo.',
    fecha: '2026-08-15',
  },
  {
    id: '3',
    nombre: 'El Respiro de Emergencia',
    teLlevas: 'Puedo parar cinco minutos aunque el día venga torcido.',
    fecha: '2026-08-13',
  },
  {
    id: '4',
    nombre: 'Un Ladrillo a la Vez',
    teLlevas: 'Puedo darle a una sola cosa toda mi atención, aunque sea un rato.',
    fecha: '2026-08-11',
  },
  {
    id: '5',
    nombre: 'El Desbloqueo Físico',
    teLlevas: 'Puedo notar dónde llevo la tensión y soltarla a propósito.',
    fecha: '2026-08-09',
  },
];

export default function PantallaArchivo() {
  return (
    <main className="flex min-h-dvh flex-col overflow-hidden bg-[var(--bg)] px-5 pb-8 pt-4">
      <header className="pb-2">
        <h1 className="text-[length:var(--txt-title)] leading-tight [font-family:var(--font-display)]">
          Tu archivo
        </h1>
      </header>

      <ul className="mt-2 flex flex-col gap-3">
        {ENTRADAS.map((e) => (
          <li
            key={e.id}
            className="rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] p-4"
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="truncate text-[length:var(--txt-body)] font-semibold">{e.nombre}</span>
              <span className="shrink-0 text-[length:var(--txt-label)] tabular-nums text-[var(--text-tertiary)]">
                {FECHA_LARGA.format(new Date(e.fecha))}
              </span>
            </div>
            <p className="mt-1 text-[length:var(--txt-body)] leading-snug text-[var(--text-secondary)]">
              «{e.teLlevas}»
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
