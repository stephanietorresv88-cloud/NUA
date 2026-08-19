'use server';

// ACCIONES DEL PANEL — Server Actions, corren en el servidor con la sesión de
// quien las llama (nunca con la clave maestra). Cada una vuelve a verificar
// que quien llama es admin — la RLS de abajo ya lo exige, pero repetirlo aquí
// da un mensaje de error claro en vez de una fila que simplemente no cambia.

import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { crearClienteServidor } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';

async function exigirAdmin() {
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticada.');
  const { data: perfil } = await supabase.from('perfiles').select('role').eq('id', user.id).maybeSingle();
  if (perfil?.role !== 'admin') throw new Error('No autorizada.');
  return { supabase, user };
}

/** Hace o quita admin a OTRA persona. Nunca a una misma, para no quedarse sin acceso por error. */
export async function alternarAdmin(formData: FormData) {
  const { supabase, user } = await exigirAdmin();

  const id = String(formData.get('id') ?? '');
  const rolActual = String(formData.get('rolActual') ?? '');
  if (!id || id === user.id) return;

  const nuevoRol = rolActual === 'admin' ? 'user' : 'admin';
  await supabase.from('perfiles').update({ role: nuevoRol }).eq('id', id);
  revalidatePath('/admin');
}

const CORREO_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * RUTA DE RESCATE (18-VENTA-HOTMART, "compré y no me llega"): crea el acceso
 * a mano cuando el webhook falló o todavía no existe. Usa la Admin API de
 * Supabase — necesita SUPABASE_SERVICE_ROLE_KEY, un secreto de SERVIDOR
 * (nunca NEXT_PUBLIC_, nunca visto por el cliente). Si falta, se avisa claro
 * en vez de fallar en silencio — no se crea un usuario "a medias".
 */
export async function crearAccesoManual(correo: string): Promise<{ ok: boolean; mensaje: string }> {
  await exigirAdmin();

  const email = correo.trim().toLowerCase();
  if (!CORREO_OK.test(email)) {
    return { ok: false, mensaje: 'Ese correo no parece válido.' };
  }

  const claveMaestra = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!claveMaestra) {
    return {
      ok: false,
      mensaje:
        'Falta configurar la clave maestra de Supabase (SUPABASE_SERVICE_ROLE_KEY en .env.local). Pide ayuda para agregarla — nunca se escribe en el chat.',
    };
  }

  const admin = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, claveMaestra, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await admin.auth.admin.createUser({ email, email_confirm: true });
  if (error) {
    if (error.status === 422 || /already been registered/i.test(error.message)) {
      return {
        ok: false,
        mensaje: 'Ese correo ya tiene una cuenta — puede entrar normalmente desde /entrar.',
      };
    }
    return { ok: false, mensaje: 'No se pudo crear el acceso. Inténtalo de nuevo.' };
  }

  revalidatePath('/admin');
  return { ok: true, mensaje: `Acceso creado para ${email}. Ya puede entrar desde /entrar con ese correo.` };
}
