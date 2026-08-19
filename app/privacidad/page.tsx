import { PaginaLegal } from '@/components/legal/PaginaLegal';

// Borrador redactado por el agente con los datos que dio la dueña (nombre,
// país, contacto — los únicos que el sistema no puede inventar). Sigue la
// spec de docs/sistema/47-LEGAL-FISCAL-Y-PRIVACIDAD.md. Recomendado: que un
// abogado en España lo revise antes de recibir tráfico real, sobre todo la
// transferencia de datos a Brasil (ver aviso más abajo).

export default function Privacidad() {
  return (
    <PaginaLegal titulo="Política de Privacidad" actualizado="17 de agosto de 2026">
      <h2>Quién es responsable de tus datos</h2>
      <p>
        NUA, con sede en España (contacto: <a href="mailto:nua.soporte@outlook.es">nua.soporte@outlook.es</a>),
        es responsable del tratamiento de tus datos personales cuando usas esta aplicación.
      </p>

      <h2>Qué datos recogemos</h2>
      <p>Solo lo necesario para que la app funcione:</p>
      <ul>
        <li>Tu correo electrónico, para crear tu cuenta y que puedas entrar sin contraseña.</li>
        <li>
          Lo que respondes en el cuestionario inicial (qué se te ha caído últimamente, cuándo tienes
          un hueco en el día) — para armar tu ritual.
        </li>
        <li>
          Las rutinas que completas y lo que escribes dentro de ellas (&ldquo;lo que te
          llevas&rdquo;), para que tu historial se guarde y puedas releerlo.
        </li>
      </ul>
      <p>No te pedimos ni queremos tu ubicación, tu fecha de nacimiento ni ningún dato financiero.</p>

      <h2>Para qué los usamos</h2>
      <p>
        Para darte acceso a tu cuenta, mostrarte tu ritual y tu historial, y para que NUA funcione
        como lo esperas. Nunca vendemos tus datos, y no los usamos para publicidad de terceros.
      </p>

      <h2>Con quién los compartimos</h2>
      <p>Solo con los proveedores que hacen posible que NUA exista, cada uno con una función concreta:</p>
      <ul>
        <li>
          <strong>Supabase</strong> — guarda tu cuenta y tu historial (base de datos y acceso).
        </li>
        <li>
          <strong>Vercel</strong> — aloja la aplicación para que puedas entrar desde tu navegador.
        </li>
        <li>
          <strong>Hotmart</strong> — procesa tu pago cuando te suscribes. NUA nunca ve ni guarda el
          número de tu tarjeta.
        </li>
      </ul>
      <p>
        NUA no usa inteligencia artificial para procesar tus datos (ver el{' '}
        <a href="/aviso-ia">Aviso de IA</a>), así que no compartimos tu información con proveedores
        de IA.
      </p>

      <h2>⚠️ Transferencia internacional de tus datos</h2>
      <p>
        Tu base de datos vive en los servidores de Supabase en Brasil, fuera de la Unión Europea.
        Eso significa que tus datos viajan a un país sin decisión de adecuación de la UE. Supabase
        ofrece Cláusulas Contractuales Tipo (el mecanismo que exige el RGPD para estos casos) como
        garantía para esta transferencia.
      </p>

      <h2>Cuánto tiempo los guardamos</h2>
      <p>
        Mientras tu cuenta esté activa. Si la eliminas, borramos tu perfil y tu historial de forma
        permanente — no queda una copia en ningún lado.
      </p>

      <h2>Tus derechos</h2>
      <p>
        Puedes pedirnos acceder a tus datos, corregirlos, eliminarlos, limitarlos u oponerte a su
        uso, y llevarte una copia (portabilidad). Escríbenos a{' '}
        <a href="mailto:nua.soporte@outlook.es">nua.soporte@outlook.es</a> y lo resolvemos. Si
        crees que no lo hicimos bien, puedes reclamar ante la Agencia Española de Protección de
        Datos (AEPD).
      </p>

      <h2>Cambios en esta política</h2>
      <p>
        Si hacemos un cambio importante, te avisamos por correo antes de que entre en vigor. La
        fecha de arriba siempre dice cuándo fue la última actualización.
      </p>
    </PaginaLegal>
  );
}
