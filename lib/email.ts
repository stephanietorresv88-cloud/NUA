// EMAILS TRANSACCIONALES DE NUA — Resend.
//
// Solo transaccionales aquí (18/46-EMAIL-DELIVERABILITY): parte del servicio que la
// clienta pagó, nunca lleva promociones ni List-Unsubscribe de marketing. Sale del
// subdominio dedicado `correo.clubnua.es` para que una reputación de marketing futura
// (si algún día existe) nunca pueda tumbar el correo de acceso — el que NO puede fallar.
//
// Voz: FICHA-AVATAR.md — tuteo cálido, nunca "productividad/optimizar/tu mejor versión".
// La objeción #1 del nicho es "me van a cobrar sin avisar" — por eso estos correos son
// transparentes y sin urgencia falsa.

import { Resend } from 'resend';

// Instanciación perezosa: crearlo al importar el módulo rompía el build (Next.js
// evalúa el archivo para recolectar datos de la ruta, sin la clave disponible en ese
// paso). Se crea recién cuando de verdad se manda un correo.
let resend: Resend | null = null;
function clienteResend(): Resend {
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

export const FROM_TX = 'NUA <acceso@correo.clubnua.es>';
const SITIO = 'https://www.clubnua.es';

function envoltorio(contenido: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background-color:#FAF6EE;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF6EE;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:480px;" cellpadding="0" cellspacing="0">
        <tr><td style="padding-bottom:24px;">
          <span style="font-family:Georgia,'Times New Roman',serif;font-size:20px;letter-spacing:0.2em;color:#6E5B9C;font-weight:700;">NUA</span>
        </td></tr>
        <tr><td style="background-color:#FFFFFF;border:1px solid #EFE9E0;border-radius:20px;padding:32px 28px;">
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#453A6B;">
            ${contenido}
          </div>
        </td></tr>
        <tr><td style="padding-top:20px;">
          <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#7B70A3;margin:0;">
            NUA · clubnua.es · Este correo es parte del servicio de tu cuenta.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function boton(texto: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;margin-top:20px;padding:14px 28px;background-color:#6E5B9C;color:#FFFFFF;text-decoration:none;border-radius:999px;font-family:Arial,Helvetica,sans-serif;font-weight:600;font-size:15px;">${texto}</a>`;
}

/**
 * BIENVENIDA TRAS LA COMPRA — la manda el webhook de Hotmart al crear/reactivar la
 * cuenta. No es el código para entrar (ese lo manda Supabase vía el mismo Resend,
 * configurado como SMTP personalizado) — es la confirmación cálida e inmediata de que
 * la compra funcionó y el camino para entrar, para que nadie se quede con la duda de
 * "¿ya quedó? ¿y ahora qué hago?" mientras espera el código.
 */
export async function enviarBienvenida(correo: string) {
  const html = envoltorio(`
    <p style="margin:0 0 4px;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;color:#7B70A3;">Ya eres de NUA</p>
    <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:24px;color:#453A6B;">Hoy también cuenta.</h1>
    <p style="margin:0 0 12px;">Tu compra quedó lista. Ya puedes entrar y armar tu primer espacio del día — sin contraseñas que recordar, con el mismo correo con el que compraste.</p>
    <p style="margin:0;">Entra a <strong>${SITIO.replace('https://', '')}/entrar</strong>, escribe tu correo y te mandamos un código de 6 dígitos para entrar. Nada más.</p>
    ${boton('Entrar a NUA', `${SITIO}/entrar`)}
    <p style="margin:20px 0 0;font-size:13px;color:#7B70A3;">Tu precio y tu fecha de cobro quedan siempre visibles desde tu perfil, y puedes cancelar cuando quieras en un toque — sin sorpresas, sin letras chiquitas.</p>
  `);

  return clienteResend().emails.send({
    from: FROM_TX,
    to: correo,
    subject: 'Ya eres de NUA — así entras',
    html,
    text: `Ya eres de NUA.\n\nTu compra quedó lista. Entra a ${SITIO}/entrar con el correo con el que compraste y te mandamos un código de 6 dígitos.\n\nTu precio y fecha de cobro quedan siempre visibles desde tu perfil, y puedes cancelar cuando quieras.`,
  });
}

/**
 * CANCELACIÓN DE SUSCRIPCIÓN — tono empático, sin oferta de retención agresiva (eso
 * queda para más adelante, 58-RETENCION-DE-INGRESOS). El acceso SIGUE activo hasta el
 * fin del ciclo ya pagado — coincide con lo prometido en /reembolsos.
 */
export async function enviarCancelacion(correo: string) {
  const html = envoltorio(`
    <p style="margin:0 0 4px;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;color:#7B70A3;">Tu suscripción</p>
    <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:24px;color:#453A6B;">Quedó cancelada.</h1>
    <p style="margin:0 0 12px;">No vas a pagar de nuevo. Tu acceso a NUA sigue activo hasta el final del ciclo que ya pagaste — puedes seguir usándolo hasta esa fecha, sin apuro.</p>
    <p style="margin:0;">Si te cansaste por un día difícil, no por NUA, tu cuenta va a estar aquí cuando quieras volver.</p>
  `);

  return clienteResend().emails.send({
    from: FROM_TX,
    to: correo,
    subject: 'Tu suscripción a NUA quedó cancelada',
    html,
    text: `Tu suscripción quedó cancelada. No vas a pagar de nuevo. Tu acceso sigue activo hasta el final del ciclo que ya pagaste.`,
  });
}
