// ENVÍO DE NOTIFICACIONES PUSH — SOLO servidor (Server Actions, API routes,
// cron). Llama directo a la función de Supabase (`push-notify`) con la clave
// maestra; nunca se importa desde un componente de cliente, por eso no lleva
// 'use client' ni pasa por una ruta intermedia.

interface EnviarPushInput {
  title: string;
  body: string;
  url?: string;
  user_ids?: string[];
}

export async function enviarPush({ title, body, url, user_ids }: EnviarPushInput) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const claveMaestra = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !claveMaestra) return; // sin configurar: no se envía, no se rompe nada más

  try {
    await fetch(`${supabaseUrl}/functions/v1/push-notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${claveMaestra}`,
      },
      body: JSON.stringify({ title, body, url, user_ids }),
    });
  } catch {
    // Fire-and-forget: una notificación que no salió no debe tumbar la
    // acción principal (el webhook, el cron) que la disparó.
  }
}
