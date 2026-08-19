import { PaginaLegal } from '@/components/legal/PaginaLegal';

export default function Reembolsos() {
  return (
    <PaginaLegal titulo="Política de Reembolso" actualizado="17 de agosto de 2026">
      <h2>La Garantía del Día Difícil</h2>
      <p>
        Si en tus primeros 30 días NUA no te ha dado un solo día más liviano, escríbenos a{' '}
        <a href="mailto:nua.soporte@outlook.es">nua.soporte@outlook.es</a> y te devolvemos el
        primer cobro completo. Sin preguntas ni formularios.
      </p>

      <h2>Si eres de la Unión Europea</h2>
      <p>
        Además de la garantía de arriba, tienes derecho a desistir de tu compra dentro de los 14
        días siguientes, sin necesidad de justificar el motivo — es un derecho que te da la ley,
        no un favor nuestro. Si ejerces este derecho antes de haber usado el servicio, te
        devolvemos el 100%.
      </p>

      <h2>Cómo pedirlo</h2>
      <p>
        Escríbenos directamente, o gestiónalo desde tu área de compras de Hotmart (el mismo lugar
        donde pagaste). Hotmart procesa la devolución; nosotros confirmamos que aplica.
      </p>

      <h2>Qué pasa con tu cuenta</h2>
      <p>
        Al confirmarse el reembolso, tu acceso a NUA se cierra. Tu historial se conserva 30 días
        más por si decides volver a suscribirte y quieres recuperarlo; después se elimina.
      </p>

      <h2>Después de los primeros 30 días</h2>
      <p>
        Pasada la garantía inicial, puedes cancelar tu suscripción cuando quieras — dejas de pagar
        desde el siguiente ciclo, pero los cobros ya realizados no se reembolsan, salvo que la ley
        de tu país te dé un derecho distinto.
      </p>
    </PaginaLegal>
  );
}
