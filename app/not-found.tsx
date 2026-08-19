import Link from 'next/link';

// 404 de marca. Antes de esto, una ruta rota (como los 4 enlaces legales que
// encontró la auditoría, 2026-08-17) caía en la pantalla genérica de Next, en
// inglés y sin salida — regla 18 del SO: la app nunca muestra pantalla blanca
// ni sin marca.

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[var(--bg)] px-5 text-center text-[var(--text-primary)] [font-family:var(--font-body)]">
      <span className="text-[length:var(--txt-label)] font-semibold tracking-[0.2em] text-[var(--accent)] [font-family:var(--font-display)]">
        NUA
      </span>
      <h1 className="mt-4 text-[length:var(--txt-title)] leading-tight [font-family:var(--font-display)]">
        Esta página no existe
      </h1>
      <p className="mt-3 max-w-xs text-[length:var(--txt-body)] leading-relaxed text-[var(--text-secondary)]">
        El enlace pudo cambiar o tener un error. Tu ritual sigue donde lo dejaste.
      </p>

      <Link
        href="/"
        className="mt-8 flex h-14 w-full max-w-xs items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] text-[length:var(--txt-body)] font-semibold text-[var(--sobre-acento)] shadow-[var(--shadow-2)] [touch-action:manipulation] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
