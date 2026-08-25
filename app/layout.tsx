import type { Metadata } from 'next';
import { Gloock, Figtree } from 'next/font/google';
import { AuthBridge } from '@/components/AuthBridge';
import { MetaPixel } from '@/components/MetaPixel';
import './globals.css';

// Las dos familias de FICHA-ARTE.md. Los nombres de variable coinciden con
// --font-display / --font-body de components/landing/tokens.css.
const gloock = Gloock({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-gloock',
  display: 'swap',
});

// Figtree es VARIABLE: no se declaran pesos (los sirve todos en un solo archivo).
// Declararlos rompe el build de Turbopack y además pesa más.
const figtree = Figtree({
  subsets: ['latin'],
  variable: '--font-figtree',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'NUA — Cuídate hoy, aunque solo tengas cinco minutos',
  description:
    'Marcas cómo llegas y el Dial de Energía arma tu ritual de hoy: 5, 15 o 20 minutos. La app que se adapta a tu día, no al revés.',
  openGraph: {
    title: 'NUA — Cuídate hoy, aunque solo tengas cinco minutos',
    description:
      'El Dial de Energía ajusta tu ritual a la energía con la que llegas. El día difícil también cuenta.',
    type: 'website',
    locale: 'es_ES',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    /* suppressHydrationWarning: el script de abajo añade la clase `js` antes de
       hidratar, así que el HTML del servidor y el del cliente difieren A PROPÓSITO
       en ese atributo. Es el patrón estándar para scripts de tema/clase. */
    <html lang="es" className={`${gloock.variable} ${figtree.variable}`} suppressHydrationWarning>
      <head>
        {/* FAIL-OPEN DEL REVEAL. El kit anima las secciones desde opacity:0 y solo
            las muestra cuando el IntersectionObserver dispara. Si el JS no corre
            (falla, tarda, o es un rastreador), la página queda EN BLANCO — en una
            página de ventas eso es perder el 100% de esa visita.
            Este script marca <html class="js"> antes del primer pintado; el CSS de
            globals.css fuerza el contenido visible cuando esa clase NO está. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('js')`,
          }}
        />
      </head>
      <body className="antialiased">
        <MetaPixel />
        <AuthBridge />
        {children}
      </body>
    </html>
  );
}
