import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './supabase/types';

// Seam usuaria anónima → cuenta (26-AUTH-MODERNO). El onboarding guarda el
// dolor y el momento elegidos en localStorage antes de que exista sesión.
// Al entrar por primera vez, esto los sube a `perfiles` una sola vez.
export async function migrarOnboardingAnonimo(supabase: SupabaseClient<Database>) {
  if (typeof window === 'undefined') return;

  const dolor = window.localStorage.getItem('nua.dolor');
  const momento = window.localStorage.getItem('nua.momento');
  if (!dolor && !momento) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  try {
    await supabase.from('perfiles').upsert({
      id: user.id,
      ...(dolor ? { dolor } : {}),
      ...(momento ? { momento } : {}),
    });
  } catch {
    // No bloquea la entrada: si falla, el próximo ritual completado
    // vuelve a intentarlo con los mismos datos (siguen en localStorage).
  }
}
