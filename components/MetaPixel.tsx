'use client';

// PIXEL DE META — carga el script base de fbq() una sola vez, aquí y en
// ningún otro lugar. El ID no es secreto (viaja al navegador de cualquier
// forma), así que es seguro tenerlo en una variable NEXT_PUBLIC_.
//
// Sin ID configurado, este componente no renderiza nada — nunca se rompe
// el sitio por falta del Pixel.

import Script from 'next/script';

export function MetaPixel() {
  const id = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  if (!id) return null;

  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {`
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
      `}
    </Script>
  );
}
