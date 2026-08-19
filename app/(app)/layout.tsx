'use client';

// LAYOUT COMPARTIDO de la app interna (Hoy/Archivo/Ajustes). La nav vive UNA
// sola vez aquí — antes cada pantalla la repetía completa, así que el
// `layoutId` del indicador de tab activa nunca podía animar entre rutas (cada
// página era un árbol nuevo que se desmontaba y montaba entero). Con la nav
// fuera del contenido de página, persiste entre navegaciones y el
// deslizamiento SÍ ocurre (hallazgo del revisor-visual, 2026-08-17).

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { Home as IconHome, Library, Settings } from 'lucide-react';

const NAV = [
  { id: '/hoy', label: 'Hoy', icono: IconHome },
  { id: '/archivo', label: 'Archivo', icono: Library },
  { id: '/ajustes', label: 'Ajustes', icono: Settings },
] as const;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[var(--bg)] text-[var(--text-primary)] [font-family:var(--font-body)]">
      {/* Profundidad compartida de Hoy/Archivo/Ajustes: el mismo lavado radial
          sutil que ya lleva /rutina, NUNCA el amarillo limón (ese color es SOLO
          del estado "Energía" del dial — FICHA-ARTE, repartirlo lo vacía de
          significado; ya se revirtió una vez por esto). Pedido de la dueña,
          2026-08-17: sumar profundidad sin tocar el lenguaje de color. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(720px 480px at 50% 0%, color-mix(in oklab, var(--accent) 10%, transparent) 0%, transparent 75%)',
        }}
      />
      <div className="relative flex min-h-dvh flex-col">{children}</div>

      <nav
        aria-label="Navegación principal"
        className="fixed inset-x-0 bottom-0 border-t border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] pb-[env(safe-area-inset-bottom)]"
      >
        <div className="mx-auto flex h-16 max-w-md items-stretch justify-around px-2">
          {NAV.map(({ id, label, icono: Icono }) => {
            const activoTab = pathname === id;
            return (
              <Link
                key={id}
                href={id}
                aria-current={activoTab ? 'page' : undefined}
                className="relative flex min-w-16 flex-col items-center justify-center gap-1 [touch-action:manipulation]"
              >
                {activoTab && (
                  <motion.span
                    layoutId="tab-activa"
                    aria-hidden="true"
                    className="absolute top-0 h-0.5 w-8 rounded-full bg-[var(--accent)]"
                  />
                )}
                <Icono
                  size={22}
                  aria-hidden="true"
                  color={activoTab ? 'var(--accent)' : 'var(--text-tertiary)'}
                  strokeWidth={activoTab ? 2.4 : 2}
                />
                <span
                  className={`text-[length:var(--txt-label)] font-medium ${
                    activoTab ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)]'
                  }`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
