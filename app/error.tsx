'use client';

// Red de seguridad de NUA. Sin esto, cualquier error en cliente deja una pantalla
// EN BLANCO — y la usuaria no sabe si se rompió la app, su internet o ella.
// Regla 18 del SO: la app nunca muestra pantalla blanca.

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // El detalle técnico va a la consola, nunca a su pantalla.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[var(--bg)] px-5 text-center text-[var(--text-primary)] [font-family:var(--font-body)]">
      <h1 className="text-[length:var(--txt-title)] leading-tight [font-family:var(--font-display)]">
        No pudimos cargar tu ritual
      </h1>
      {/* Qué pasó + qué hacer, sin códigos ni culpa (regla de errores del SO). */}
      <p className="mt-3 max-w-xs text-[length:var(--txt-body)] leading-relaxed text-[var(--text-secondary)]">
        No es cosa tuya. Vuelve a intentarlo y sigue donde estabas.
      </p>

      <button
        type="button"
        onClick={reset}
        className="mt-8 flex h-14 w-full max-w-xs items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] text-[length:var(--txt-body)] font-semibold text-[var(--sobre-acento)] shadow-[var(--shadow-2)] [touch-action:manipulation] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
      >
        Reintentar
      </button>

      <Link
        href="/"
        className="mt-4 flex h-11 items-center px-4 text-[length:var(--txt-body)] text-[var(--text-secondary)] underline underline-offset-4 [touch-action:manipulation]"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
