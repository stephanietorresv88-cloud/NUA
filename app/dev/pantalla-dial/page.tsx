'use client';

// RUTA DE DESARROLLO (no enlazada desde ningún sitio, no indexable).
// Existe para CAPTURAR una pantalla REAL de NUA y usarla en el carrusel de la
// landing: el revisor marcó que 3 marcos vacíos antes del precio comunican
// "el producto no existe". El dial SÍ existe, así que se fotografía de verdad
// en vez de dibujar un placeholder.

import { DialCard } from '@/components/landing/DialInteractivo';

export default function PantallaDial() {
  return (
    /* overflow-hidden: la captura de esta pantalla se incrusta en el carrusel de la
       landing y no debe salir con la barra de scroll del navegador dentro. */
    <main className="flex min-h-dvh flex-col overflow-hidden bg-[var(--bloque-lavanda)] px-4 pb-8 pt-10">
      <header className="mb-5 flex items-center justify-between px-1">
        <span className="text-lg tracking-[0.42em] text-[var(--text-primary)] [font-family:var(--font-display)]">
          NUA
        </span>
        <span className="text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
          Martes 12
        </span>
      </header>

      <h1 className="mb-5 px-1 text-2xl leading-tight text-[var(--text-primary)] [font-family:var(--font-display)]">
        ¿Cómo llegas hoy?
      </h1>

      <DialCard />
    </main>
  );
}
