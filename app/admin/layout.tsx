// GUARD DE /admin — verificado EN EL SERVIDOR, no solo ocultando la ruta.
// Ocultar el enlace del panel no basta (IDOR): cualquiera que adivine /admin y
// tenga sesión vería los datos de todas las usuarias si solo se ocultara en el
// cliente. Este layout es un Server Component: lee la sesión real de Supabase
// (cookies), confirma perfiles.role === 'admin' con una query server-side, y
// solo entonces deja pasar. RLS (event_log/error_log, migración de hoy) es la
// segunda capa: aunque alguien se saltara este guard, la base de datos igual
// rechaza el select si su perfil no es admin.

import { redirect } from 'next/navigation';
import { crearClienteServidor } from '@/lib/supabase/server';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await crearClienteServidor();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/entrar');

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (perfil?.role !== 'admin') redirect('/');

  return (
    <div className="min-h-dvh bg-[var(--bg)] text-[var(--text-primary)] [font-family:var(--font-body)]">
      {children}
    </div>
  );
}
