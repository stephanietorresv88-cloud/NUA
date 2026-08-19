import type { ReactNode } from 'react';
import Link from 'next/link';

// Envoltorio compartido de las 4 páginas legales — mismo header, misma
// tipografía de marca, mismo ancho de lectura. Las páginas legales no
// necesitan el motion/craft de la app: necesitan leerse claro y encontrarse
// rápido (regla de tratamiento utilitario, no editorial).

export function PaginaLegal({
  titulo,
  actualizado,
  children,
}: {
  titulo: string;
  actualizado: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-[var(--bg)] text-[var(--text-primary)] [font-family:var(--font-body)]">
      <header className="mx-auto flex max-w-2xl items-center justify-between px-5 pb-4 pt-6">
        <Link
          href="/"
          aria-label="NUA — ir al inicio"
          className="text-[length:var(--txt-body)] font-semibold tracking-[0.2em] text-[var(--accent)] [font-family:var(--font-display)]"
        >
          NUA
        </Link>
        <Link
          href="/"
          className="text-[length:var(--txt-label)] text-[var(--text-secondary)] underline underline-offset-4"
        >
          Volver al inicio
        </Link>
      </header>

      <main className="mx-auto max-w-2xl px-5 pb-24 pt-4">
        <h1 className="text-[length:var(--txt-title)] leading-tight [font-family:var(--font-display)]">
          {titulo}
        </h1>
        <p className="mt-2 text-[length:var(--txt-label)] text-[var(--text-tertiary)]">
          Última actualización: {actualizado}
        </p>

        <div className="legal-prose mt-8">{children}</div>
      </main>
    </div>
  );
}
