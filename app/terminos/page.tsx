import { PaginaLegal } from '@/components/legal/PaginaLegal';

export default function Terminos() {
  return (
    <PaginaLegal titulo="Términos y Condiciones" actualizado="17 de agosto de 2026">
      <h2>Qué es NUA</h2>
      <p>
        NUA es una aplicación de autocuidado: te ofrece un ritual diario de 5, 15 o 20 minutos que
        se adapta a la energía con la que llegas. El servicio lo presta NUA, con sede en España
        (contacto: <a href="mailto:nua.soporte@outlook.es">nua.soporte@outlook.es</a>).
      </p>

      <h2>Qué NO es NUA</h2>
      <p>
        NUA es autocuidado diario, no atención médica ni psicológica. No diagnostica ni trata
        ninguna condición. Si estás pasando algo serio, busca ayuda profesional — NUA no la
        reemplaza.
      </p>

      <h2>Cómo se vende</h2>
      <p>
        El acceso a NUA se vende como suscripción a través de Hotmart, y la aplicación vive en
        Vercel y Supabase. Al suscribirte, aceptas también las condiciones de Hotmart como
        procesador del pago.
      </p>

      <h2>Uso aceptable</h2>
      <p>
        Tu cuenta es personal e intransferible. No está permitido usar NUA para fines distintos a
        cuidarte a ti misma, ni intentar acceder a los datos de otra persona. Nos reservamos el
        derecho de suspender una cuenta que use la app de forma indebida.
      </p>

      <h2>Renovación y cancelación</h2>
      <p>
        La suscripción se renueva automáticamente (mensual o anual, según el plan que elegiste)
        hasta que la canceles. Puedes cancelar cuando quieras desde tu área de compras de Hotmart —
        no hace falta escribirnos, aunque con gusto te ayudamos si lo necesitas.
      </p>

      <h2>Reembolsos</h2>
      <p>
        La política de reembolso vive en su propia página: <a href="/reembolsos">Reembolsos</a>.
      </p>

      <h2>Propiedad del contenido</h2>
      <p>
        Los rituales, textos y el nombre &ldquo;NUA&rdquo; son propiedad de NUA. Lo que TÚ escribes dentro de
        tus rituales es tuyo — nosotros solo lo guardamos para que puedas volver a leerlo.
      </p>

      <h2>Limitación de responsabilidad</h2>
      <p>
        NUA se ofrece &ldquo;tal cual&rdquo;. Hacemos lo posible por que funcione siempre bien, pero no
        garantizamos que esté libre de errores ni que resuelva ningún problema en particular. El
        uso que le das es tu responsabilidad.
      </p>

      <h2>Ley aplicable</h2>
      <p>
        Estos términos se rigen por la ley española. Cualquier disputa se resuelve ante los
        tribunales competentes de España, sin perjuicio de los derechos que la ley de tu país de
        residencia te reconozca como consumidora.
      </p>

      <h2>Cambios</h2>
      <p>Si cambiamos algo importante de estos términos, te avisamos por correo antes de aplicarlo.</p>
    </PaginaLegal>
  );
}
