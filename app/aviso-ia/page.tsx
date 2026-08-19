import { PaginaLegal } from '@/components/legal/PaginaLegal';

export default function AvisoIA() {
  return (
    <PaginaLegal titulo="Aviso de Inteligencia Artificial" actualizado="17 de agosto de 2026">
      <h2>NUA no usa IA para armar tus rituales</h2>
      <p>
        Ahora mismo, ninguna de las rutinas que haces en NUA fue generada por inteligencia
        artificial. Cada ritual, cada pregunta y cada frase la escribió una persona. El Dial de
        Energía elige entre rutinas ya escritas según tu estado de hoy — no inventa contenido
        nuevo con IA.
      </p>

      <h2>Lo que escribes tú, se queda contigo</h2>
      <p>
        Cuando escribes algo dentro de un ritual, ese texto no pasa por ningún servicio de
        inteligencia artificial. Se guarda tal cual, para que puedas releerlo — nadie más lo
        procesa ni lo analiza.
      </p>

      <h2>Si esto cambia</h2>
      <p>
        Si en el futuro incorporamos IA en alguna parte de NUA, actualizaremos este aviso ANTES de
        que entre en vigor, te avisaremos por correo, y explicaremos con qué proveedor trabajamos y
        qué pasa con tus datos.
      </p>
    </PaginaLegal>
  );
}
