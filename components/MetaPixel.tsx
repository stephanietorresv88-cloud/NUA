'use client';

// PIXEL DE META — carga el script base de fbq() una sola vez, aquí y en
// ningún otro lugar. El ID no es secreto (viaja al navegador de cualquier
// forma), así que es seguro tenerlo en una variable NEXT_PUBLIC_.
//
// Sin ID configurado, este componente no renderiza nada — nunca se rompe
// el sitio por falta del Pixel.

import Script from 'next/script';

export function MetaPixel() {
  // .trim(): un salto de línea o espacio pegado al copiar el ID en Vercel
  // rompía TODO el script (un salto de línea dentro de comillas simples es
  // inválido en JS) — verificado en producción, 2026-08-24. Nunca confiar en
  // que una variable de entorno llegue limpia.
  const id = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
  if (!id) return null;

  // dangerouslySetInnerHTML en vez de children: con children (string) esta
  // versión de Next lanzaba "Failed to execute 'appendChild': Invalid or
  // unexpected token" al inyectar el script — verificado en producción,
  // 2026-08-24. Mismo patrón que ya usa app/layout.tsx para su script inline.
  const codigo = `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${id}');
    fbq('track', 'PageView');
  `;

  return <Script id="meta-pixel" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: codigo }} />;
}
