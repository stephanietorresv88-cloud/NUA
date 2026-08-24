// ═══════════════════════════════════════════════════════════════════════════
// LAS RUTINAS DE NUA
//
// Modelo aportado por la dueña el 2026-08-14. Una rutina NO es una lista de
// ejercicios con cronómetro: es una cadena con nombre propio donde ella sabe
// qué hace, por qué, y qué se lleva al terminar.
//
// ⚠️ VOZ: CERCANA Y AMIGABLE. Como le hablaría una amiga que la conoce y no la
// juzga. Nunca un método, un coach ni un manual.
//
// ⚠️ PRESUPUESTO DE PALABRAS — regla dura de la dueña (2026-08-14):
//   "esto es una app de escape del agobio, ninguna se va a poner a leer esto".
// Su clienta viene HUYENDO de tener demasiado encima. Un párrafo explicativo es
// más cosas que atender. Límites que se cuentan, no se estiman:
//   porQueExiste ≤ 25 palabras · guia ≤ 22 · paraQueSirve ≤ 12 · victoria ≤ 20
// Y `paraQueSirve` solo donde DESCULPABILIZA o cambia el marco. Si solo explica
// el ejercicio, sobra: se nota al hacerlo.
//
// ⚠️ NADA DE LENGUAJE DE ESTUDIO. Prohibido "evidencia", "respaldo", "está
// demostrado", "según la ciencia". Lo que se lleva se llama LO QUE TE LLEVAS.
// La investigación es la razón interna del diseño, jamás argumento en pantalla.
//
// ⚠️ CLAIMS (gate 61 / legal 47): NUA no diagnostica ni trata. Prohibido afirmar
// efectos fisiológicos. Se describe lo que ella HACE, no lo que le pasa dentro.
// ═══════════════════════════════════════════════════════════════════════════

import type { CapacidadId } from './rituales';

export type DuracionRutina = 5 | 15 | 20;

export type TipoBloque = 'elegir' | 'escribir' | 'completar' | 'hacer' | 'ensayar' | 'leer';

export interface Bloque {
  id: string;
  titulo: string;
  desde: number;
  hasta: number;
  tipo: TipoBloque;
  /** La voz de NUA. ≤22 palabras. */
  guia: string;
  opciones?: string[];
  plantilla?: [string, string, string];
  ejemplo?: string;
  /** ≤12 palabras y SOLO si desculpabiliza. Va como una línea, no como una caja. */
  paraQueSirve?: string;
  ganancia?: string;
  /** El permiso que reencuadra. Va destacado. */
  marco?: string;
}

export interface Rutina {
  id: string;
  nombre: string;
  subtitulo: string;
  duracion: DuracionRutina;
  capacidad: CapacidadId;
  cadena: string[];
  /** Lo primero que lee. ≤25 palabras. */
  porQueExiste: string;
  bloques: Bloque[];
  victoria: {
    titulo: string;
    /** ≤20 palabras. */
    cuerpo: string;
    /** LO QUE TE LLEVAS. En primera persona, para reconocerlo en su vida.
     *  Se llamaba "evidencia" y la dueña lo descartó: sonaba a informe. */
    teLlevas: string;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 5 MINUTOS — frenar y contener. La puerta de entrada diaria.
// ═══════════════════════════════════════════════════════════════════════════

export const RUTINAS: Rutina[] = [
  {
    id: 'respiro-emergencia-5',
    nombre: 'El Respiro de Emergencia',
    subtitulo: 'Para los días en que el mundo pesa el doble',
    duracion: 5,
    capacidad: 'recuperacion',
    cadena: ['Paro', 'Suelto', 'Me reconozco'],
    porQueExiste:
      'Para un segundo. Te prometo que nada se va a caer si paras cinco minutos. Hoy no hay que resolver nada.',
    bloques: [
      {
        id: 'aterriza',
        titulo: 'Siéntate, por fin',
        desde: 0,
        hasta: 0.5,
        tipo: 'ensayar',
        guia: 'Relaja los hombros. Toma aire contando hasta cuatro y suéltalo hasta seis. Tres veces.',
        marco: 'No necesitas sentirte bien para empezar.',
      },
      {
        id: 'vaciado',
        titulo: 'Suelta todo lo que traes',
        desde: 0.5,
        hasta: 3.5,
        tipo: 'escribir',
        guia: 'Escribe todo lo que traes encima. Sin ordenarlo ni resolverlo. Solo sácalo.',
        paraQueSirve: 'Lo que llevas en la cabeza pesa el doble que lo escrito.',
      },
      {
        id: 'reconocer',
        titulo: 'Mira lo que sí hiciste',
        desde: 3.5,
        hasta: 5,
        tipo: 'escribir',
        guia: '¿Qué hiciste hoy para sostener el día? Aunque te parezca poquito.',
        ejemplo: 'Me levanté, dejé a los niños y contesté lo urgente.',
        ganancia: 'Eso también fue sostener el día.',
      },
    ],
    victoria: {
      titulo: 'Protegiste tu espacio, hasta hoy',
      cuerpo: 'Justo el día que el mundo pesaba el doble, paraste. Eso es lo más difícil.',
      teLlevas: 'Puedo parar cinco minutos aunque el día venga torcido.',
    },
  },

  {
    id: 'desbloqueo-fisico-5',
    nombre: 'El Desbloqueo Físico',
    subtitulo: 'Sacudirte la tensión que ni notabas',
    duracion: 5,
    capacidad: 'regulacion',
    cadena: ['Aflojo', 'Respiro', 'Descanso'],
    porQueExiste:
      'Llevas horas con la mandíbula apretada y ni te has dado cuenta. Vamos a sacudirnos esa tensión, ¿sí?',
    bloques: [
      {
        id: 'soltar',
        titulo: 'Aflójalo todo',
        desde: 0,
        hasta: 1.5,
        tipo: 'ensayar',
        guia: 'Separa los dientes. Sube los hombros y déjalos caer tres veces. Sacude las manos.',
        paraQueSirve: 'El cuerpo se queda agarrado aunque tú ya lo hayas olvidado.',
      },
      {
        id: 'respirar',
        titulo: 'Respira parejo',
        desde: 1.5,
        hasta: 3.5,
        tipo: 'hacer',
        guia: 'Una mano en el pecho. Toma aire hasta cuatro, suéltalo hasta cuatro. Sin forzar.',
        marco: 'Tu cuerpo no es tu enemigo cuando estás cansada.',
      },
      {
        id: 'vista',
        titulo: 'Deja descansar la vista',
        desde: 3.5,
        hasta: 5,
        tipo: 'ensayar',
        guia: 'Mira al punto más lejano que tengas. Quédate ahí sin buscar nada.',
        ganancia: 'Llevabas horas mirando a cuarenta centímetros.',
      },
    ],
    victoria: {
      titulo: 'Le diste a tu cuerpo el respiro que pedía',
      cuerpo: 'Llevaba horas avisándote y hoy sí lo escuchaste.',
      teLlevas: 'Puedo notar dónde llevo la tensión y soltarla a propósito.',
    },
  },

  {
    id: 'corte-inercia-5',
    nombre: 'El Corte de Inercia',
    subtitulo: 'Ganarle una batalla pequeña a la pereza',
    duracion: 5,
    capacidad: 'iniciativa',
    cadena: ['Lo nombro', 'Lo hago', 'Cierro'],
    porQueExiste:
      'Hay algo rondándote que te da pereza infinita y te gasta energía solo de pensarlo. Una batalla pequeña. ¿Te animas?',
    bloques: [
      {
        id: 'nombrar',
        titulo: 'Dime qué es',
        desde: 0,
        hasta: 1,
        tipo: 'escribir',
        guia: '¿Qué es lo único que te está haciendo ruido? Eso que llevas días rodeando.',
        ejemplo: 'La llamada al banco que llevo tres días esquivando.',
        paraQueSirve: 'Mientras no tiene nombre, ocupa el doble.',
      },
      {
        id: 'hacerlo',
        titulo: 'Dos minutos y ya',
        desde: 1,
        hasta: 3,
        tipo: 'hacer',
        guia: 'Haz un pedacito durante dos minutos. Sin que quede bien. Aquí me callo yo.',
        marco: 'No hace falta terminarlo. Hace falta empezarlo.',
      },
      {
        id: 'sellar',
        titulo: 'Ponle el punto final',
        desde: 3,
        hasta: 5,
        tipo: 'leer',
        guia: 'Mano en el pecho: lo que se haga de aquí en adelante es extra.',
        ganancia: 'Ya le ganaste a la parte difícil, que era empezar.',
      },
    ],
    victoria: {
      titulo: 'Hoy le ganaste a la inercia',
      cuerpo: 'Eso que llevaba días dándote vueltas ya está empezado.',
      teLlevas: 'Puedo empezar algo aunque me dé pereza, si lo hago pequeño.',
    },
  },

  {
    id: 'ventilacion-5',
    nombre: 'La Pausa de Ventilación',
    subtitulo: 'Sacar el desorden de tu cabeza',
    duracion: 5,
    capacidad: 'claridad',
    cadena: ['Vacío', 'Tacho', 'Elijo una'],
    porQueExiste:
      'Tienes la cabeza a punto de explotar. Vamos a sacar las cosas para que dejes de gastar energía recordándolas.',
    bloques: [
      {
        id: 'lista',
        titulo: 'Suéltalo todo aquí',
        desde: 0,
        hasta: 2,
        tipo: 'escribir',
        guia: 'Escribe todo lo que crees que "deberías" estar haciendo. Aunque sea absurdo.',
      },
      {
        id: 'tachar',
        titulo: 'Tacha sin culpa',
        desde: 2,
        hasta: 4,
        tipo: 'escribir',
        guia: 'Quita lo que hoy no depende de ti. De lo que quede, escribe solo una.',
        ejemplo: 'Hoy: solo la llamada del colegio.',
        marco: 'Elegir una no es rendirse. Es dejar de pelear con quince.',
      },
      {
        id: 'pacto',
        titulo: 'Tu pacto de mínimos',
        desde: 4,
        hasta: 5,
        tipo: 'completar',
        guia: 'Déjalo dicho y suelta el teléfono.',
        plantilla: ['Hoy me basta con ', ' y ', '.'],
        ejemplo: 'Hoy me basta con hacer esa llamada y llegar a la cena.',
      },
    ],
    victoria: {
      titulo: 'El caos sigue fuera, pero tú ya elegiste',
      cuerpo: 'No resolviste la lista. Decidiste qué se merece tu energía hoy.',
      teLlevas: 'Puedo elegir una sola cosa cuando todo parece urgente.',
    },
  },

  {
    id: 'apagon-5',
    nombre: 'El Apagón',
    subtitulo: 'Un rato a solas contigo, sin ruido',
    duracion: 5,
    capacidad: 'atencion',
    cadena: ['Apago', 'Noto', 'Descanso'],
    porQueExiste:
      'Llevas el día entero con algo pidiéndote atención. Desconecta el mundo un momento. Te lo mereces.',
    bloques: [
      {
        id: 'apagar',
        titulo: 'Apaga lo que puedas',
        desde: 0,
        hasta: 1,
        tipo: 'leer',
        guia: 'Silencia lo que tengas cerca y gira las pantallas.',
        marco: 'No tienes que relajarte. Solo estar aquí.',
      },
      {
        id: 'escaneo',
        titulo: 'Nota dónde estás',
        desde: 1,
        hasta: 4,
        tipo: 'ensayar',
        guia: 'Busca tres sitios donde tu cuerpo toca algo, dos sonidos lejanos y una temperatura.',
        paraQueSirve: 'A la cabeza le sale mejor algo concreto que "cálmate".',
      },
      {
        id: 'quedarse',
        titulo: 'Quédate un momento',
        desde: 4,
        hasta: 5,
        tipo: 'hacer',
        guia: 'Toma aire hondo, suelta la prisa y quédate en ese hueco en blanco.',
      },
    ],
    victoria: {
      titulo: 'Apagaste el ruido de fuera',
      cuerpo: 'Cinco minutos sin que nadie te pidiera nada. Eso también es cuidarte.',
      teLlevas: 'Puedo darme un rato en silencio sin sentir que pierdo el tiempo.',
    },
  },

  // ── Ampliación 2026-08-14: de 5 a 14 rutinas de 5 min. Cada una nace de un
  // momento distinto (el mapa de situaciones de la dueña) para que no se repita
  // el patrón en dos semanas de uso diario. ──

  {
    id: 'aterrizaje-5',
    nombre: 'El Aterrizaje',
    subtitulo: 'Para cuando te despiertas ya con el peso encima',
    duracion: 5,
    capacidad: 'regulacion',
    cadena: ['Llego', 'Bajo el ritmo', 'Empiezo'],
    porQueExiste:
      'Hay días que empiezan pesados antes de que pase nada. No hace falta arreglar el día entero: solo aterrizar antes de arrancarlo.',
    bloques: [
      {
        id: 'despertar',
        titulo: 'Antes de agarrar el teléfono',
        desde: 0,
        hasta: 1.5,
        tipo: 'ensayar',
        guia: 'Quédate un minuto sentada en la cama. No mires el teléfono todavía.',
        marco: 'El día no ha empezado hasta que tú decidas que empieza.',
      },
      {
        id: 'cuerpo',
        titulo: 'Nota cómo llegas',
        desde: 1.5,
        hasta: 3,
        tipo: 'elegir',
        guia: '¿Cómo sientes el cuerpo ahora mismo?',
        opciones: ['Pesado', 'Con nudo en el estómago', 'Cansada aunque dormiste', 'Bien, solo despacio'],
        paraQueSirve: 'Saber cómo llegas te dice cuánto pedirte hoy.',
      },
      {
        id: 'primer-paso',
        titulo: 'Elige tu primer movimiento',
        desde: 3,
        hasta: 5,
        tipo: 'completar',
        guia: 'Antes de que empiece el ruido de fuera.',
        plantilla: ['Lo primero que voy a hacer es ', ' porque ', '.'],
        ejemplo: 'Lo primero que voy a hacer es estirarme despacio porque hoy necesito ir suave.',
      },
    ],
    victoria: {
      titulo: 'Empezaste el día tú, no el ruido',
      cuerpo: 'Antes de que nadie te pidiera nada, ya habías decidido cómo entrar.',
      teLlevas: 'Puedo decidir cómo entro al día antes de que el día decida por mí.',
    },
  },

  {
    id: 'chispazo-5',
    nombre: 'El Chispazo',
    subtitulo: 'Para el segundo en que algo te hizo saltar',
    duracion: 5,
    capacidad: 'regulacion',
    cadena: ['Lo siento', 'Freno', 'Elijo'],
    porQueExiste:
      'Algo te acaba de encender. No vamos a apagarlo de golpe. Vamos a que no decidas nada mientras sigue ardiendo.',
    bloques: [
      {
        id: 'nombrar',
        titulo: '¿Qué te encendió?',
        desde: 0,
        hasta: 1.5,
        tipo: 'escribir',
        guia: 'Cuéntame qué acaba de pasar. Sin filtrar nada.',
        ejemplo: 'Me contestó de mala forma delante de todos.',
      },
      {
        id: 'freno',
        titulo: 'Freno de mano',
        desde: 1.5,
        hasta: 3.5,
        tipo: 'hacer',
        guia: 'Cinco respiraciones largas antes de escribir o decir nada. Aquí me callo yo.',
        marco: 'Lo que sientes es real. Lo que hagas con eso, lo eliges tú.',
      },
      {
        id: 'elige',
        titulo: '¿Qué vas a hacer ahora?',
        desde: 3.5,
        hasta: 5,
        tipo: 'elegir',
        guia: 'Con la cabeza un poco más fría, ¿qué eliges?',
        opciones: [
          'Hablarlo cuando esté más tranquila',
          'Escribirle lo que le diría y no mandarlo aún',
          'Dejarlo pasar, no merece más energía',
          'Decir algo ahora, ya lo decidí',
        ],
      },
    ],
    victoria: {
      titulo: 'No decidiste nada en caliente',
      cuerpo: 'Lo que sientas sigue siendo válido. Lo que hagas con eso, ya lo elegiste tú.',
      teLlevas: 'Puedo sentir el chispazo sin dejar que decida por mí.',
    },
  },

  {
    id: 'cuenta-pendiente-5',
    nombre: 'La Cuenta Pendiente',
    subtitulo: 'Para bajar la lista de cosas por las que te riñes',
    duracion: 5,
    capacidad: 'autoconfianza',
    cadena: ['La miro', 'La bajo', 'La suelto'],
    porQueExiste:
      'Llevas una lista mental de todo lo que no hiciste bien hoy. Vamos a mirarla de frente, y a soltar la mitad.',
    bloques: [
      {
        id: 'lista',
        titulo: 'Escribe la lista',
        desde: 0,
        hasta: 1.5,
        tipo: 'escribir',
        guia: 'Todo lo que crees que hiciste mal hoy. Sin editarlo.',
      },
      {
        id: 'filtro',
        titulo: 'Pregúntale a cada una',
        desde: 1.5,
        hasta: 3.5,
        tipo: 'escribir',
        guia: 'De esa lista, ¿cuál le importaría a alguien dentro de una semana?',
        paraQueSirve: 'Casi todo lo que te riñe hoy, se olvida solo mañana.',
      },
      {
        id: 'soltar',
        titulo: 'Suelta el resto',
        desde: 3.5,
        hasta: 5,
        tipo: 'leer',
        guia: 'Lo que quede, tacha. No hace falta cargarlo hasta mañana.',
        ganancia: 'Una lista más corta ya es un descanso.',
      },
    ],
    victoria: {
      titulo: 'Bajaste el peso de la lista',
      cuerpo: 'No te falló nadie. Solo llevabas más encima de lo que valía la pena cargar.',
      teLlevas: 'No todo lo que me reprocho merece quedarse en la lista.',
    },
  },

  {
    id: 'apagar-luz-5',
    nombre: 'Apagar la Luz',
    subtitulo: 'Para cuando la cabeza sigue encendida en la cama',
    duracion: 5,
    capacidad: 'recuperacion',
    cadena: ['Lo anoto', 'Lo cierro', 'Descanso'],
    porQueExiste:
      'La cabeza no para porque cree que si no piensa en ello, se le va a olvidar. Vamos a dejarlo escrito para que pueda soltarlo.',
    bloques: [
      {
        id: 'volcado',
        titulo: 'Escribe lo que da vueltas',
        desde: 0,
        hasta: 2,
        tipo: 'escribir',
        guia: 'Todo lo que sigue rondándote. Mañana lo lees; ahora solo sácalo.',
      },
      {
        id: 'manana',
        titulo: 'Dile a mañana que se encargue',
        desde: 2,
        hasta: 3.5,
        tipo: 'completar',
        guia: 'Elige lo primero que vas a mirar mañana.',
        plantilla: ['Mañana, lo primero es ', '. Con eso ', ' basta.'],
        ejemplo: 'Mañana, lo primero es escribirle. Con eso por ahora basta.',
      },
      {
        id: 'cerrar',
        titulo: 'Cierra la tapa',
        desde: 3.5,
        hasta: 5,
        tipo: 'leer',
        guia: 'Ya quedó escrito. Tu cabeza puede soltarlo; el papel lo sostiene por ti.',
        marco: 'No hace falta resolverlo a las once de la noche.',
      },
    ],
    victoria: {
      titulo: 'Le diste a tu cabeza permiso para soltar',
      cuerpo: 'Lo pendiente sigue ahí, pero ya no depende de que tú lo sostengas despierta.',
      teLlevas: 'Puedo dejar algo por escrito y soltarlo hasta mañana.',
    },
  },

  {
    id: 'cambio-piel-5',
    nombre: 'El Cambio de Piel',
    subtitulo: 'Para no llevarte la oficina puesta a casa',
    duracion: 5,
    capacidad: 'limites',
    cadena: ['Cierro una puerta', 'Abro otra', 'Llego entera'],
    porQueExiste:
      'Llegar a casa con el trabajo todavía encima es lo que te deja sin nada para los tuyos. Vamos a marcar el cambio.',
    bloques: [
      {
        id: 'cerrar-puerta',
        titulo: 'Cierra el trabajo, aunque sea de mentira',
        desde: 0,
        hasta: 1.5,
        tipo: 'ensayar',
        guia: 'Di, en voz alta o solo para ti: "por hoy, hasta aquí."',
        marco: 'Lo que quedó sin hacer sigue ahí mañana. No se va a escapar.',
      },
      {
        id: 'transicion',
        titulo: 'Marca el cambio con el cuerpo',
        desde: 1.5,
        hasta: 3.5,
        tipo: 'hacer',
        guia: 'Camina, cámbiate de ropa o lávate las manos. Algo que le diga a tu cuerpo que cambiaste de sitio.',
      },
      {
        id: 'llegar',
        titulo: '¿Con quién quieres estar ahora?',
        desde: 3.5,
        hasta: 5,
        tipo: 'escribir',
        guia: '¿Qué necesitas para llegar entera, no solo llegar?',
      },
    ],
    victoria: {
      titulo: 'Cerraste una puerta antes de abrir otra',
      cuerpo: 'Los tuyos se merecen que llegues tú, no la versión cansada del trabajo.',
      teLlevas: 'Puedo marcar dónde termina el trabajo y dónde empiezo yo en casa.',
    },
  },

  {
    id: 'antes-de-entrar-5',
    nombre: 'Antes de Entrar',
    subtitulo: 'Para los minutos antes de la llamada o la reunión',
    duracion: 5,
    capacidad: 'autoconfianza',
    cadena: ['Respiro', 'Me centro', 'Entro'],
    porQueExiste:
      'Faltan minutos para algo que te pone nerviosa. No vamos a hacer que desaparezcan los nervios. Vamos a entrar con ellos, no contra ellos.',
    bloques: [
      {
        id: 'respirar',
        titulo: 'Baja el pulso',
        desde: 0,
        hasta: 1.5,
        tipo: 'hacer',
        guia: 'Tres respiraciones largas. Solo eso, antes de pensar en nada más.',
      },
      {
        id: 'centro',
        titulo: '¿Qué quieres proteger ahí dentro?',
        desde: 1.5,
        hasta: 3.5,
        tipo: 'elegir',
        guia: 'De todo lo que puede pasar, ¿qué depende de ti?',
        opciones: [
          'Decir lo que pienso con calma',
          'Escuchar antes de defenderme',
          'No prometer de más',
          'Que no se me olvide lo importante',
        ],
        marco: 'No controlas cómo va a salir. Controlas cómo entras tú.',
      },
      {
        id: 'entra',
        titulo: 'Ya puedes entrar',
        desde: 3.5,
        hasta: 5,
        tipo: 'leer',
        guia: 'Los nervios no significan que vaya a salir mal. Significan que te importa.',
      },
    ],
    victoria: {
      titulo: 'Entraste con los nervios, no contra ellos',
      cuerpo: 'No hacía falta que desaparecieran. Solo que no decidieran por ti.',
      teLlevas: 'Puedo estar nerviosa y aun así entrar centrada.',
    },
  },

  {
    id: 'bajada-seis-5',
    nombre: 'La Bajada de las Seis',
    subtitulo: 'Para cuando a media tarde ya no queda nada',
    duracion: 5,
    capacidad: 'autocuidado',
    cadena: ['Lo noto', 'Le doy algo', 'Sigo'],
    porQueExiste:
      'Hay una hora del día en que se acaba la gasolina y queda medio día por delante. Vamos a darte algo antes de seguir.',
    bloques: [
      {
        id: 'notar',
        titulo: 'Nota que se acabó',
        desde: 0,
        hasta: 1,
        tipo: 'leer',
        guia: 'No es que falles. Llevas horas sin parar y tu cuerpo lo está avisando.',
      },
      {
        id: 'dar',
        titulo: 'Dale algo de verdad',
        desde: 1,
        hasta: 3.5,
        tipo: 'elegir',
        guia: '¿Qué necesitas de verdad ahora, no lo que "deberías"?',
        opciones: [
          'Agua y algo de comer',
          'Salir un momento a otro aire',
          'Cinco minutos sin hacer nada',
          'Bajar el ritmo, no parar del todo',
        ],
      },
      {
        id: 'seguir',
        titulo: 'Sigue, pero más despacio',
        desde: 3.5,
        hasta: 5,
        tipo: 'leer',
        guia: 'No hace falta terminar el día al mismo ritmo que lo empezaste.',
        ganancia: 'Bajar el ritmo no es rendirse.',
      },
    ],
    victoria: {
      titulo: 'Le diste a tu tarde lo que pedía',
      cuerpo: 'No aguantaste con los dientes apretados. Le diste al cuerpo lo que pedía.',
      teLlevas: 'Puedo bajar el ritmo a media tarde sin sentir que fallo.',
    },
  },

  {
    id: 'cerrar-pestana-5',
    nombre: 'Cerrar la Pestaña',
    subtitulo: 'Para cuando el scroll te dejó peor de lo que estabas',
    duracion: 5,
    capacidad: 'autoconfianza',
    cadena: ['Lo noto', 'Vuelvo a mí', 'Sigo'],
    porQueExiste:
      'Estabas bien hasta que abriste el teléfono. Vamos a volver a ti antes de seguir con el día.',
    bloques: [
      {
        id: 'notar',
        titulo: 'Nota qué pasó',
        desde: 0,
        hasta: 1.5,
        tipo: 'escribir',
        guia: '¿Qué viste que te dejó así? Dilo tal cual, sin quitarle importancia.',
      },
      {
        id: 'comparacion',
        titulo: 'Eso que viste es una versión',
        desde: 1.5,
        hasta: 3.5,
        tipo: 'leer',
        guia: 'Nadie enseña el resto del día. Estás comparando tu detrás de cámaras con su selección.',
        marco: 'No estás perdiendo frente a nadie. Estás comparando cosas distintas.',
      },
      {
        id: 'volver',
        titulo: 'Vuelve a lo tuyo',
        desde: 3.5,
        hasta: 5,
        tipo: 'completar',
        guia: 'Antes de seguir el día, quédate con esto.',
        plantilla: ['Hoy lo mío fue ', ', y eso no sale ', '.'],
        ejemplo: 'Hoy lo mío fue sacar adelante una mañana difícil, y eso no sale en ninguna foto.',
      },
    ],
    victoria: {
      titulo: 'Volviste a ti antes de seguir',
      cuerpo: 'Cerraste la comparación antes de que te ganara el día entero.',
      teLlevas: 'Puedo notar cuándo una pantalla me aleja de mí, y volver.',
    },
  },

  {
    id: 'ladrillo-5',
    nombre: 'Un Ladrillo a la Vez',
    subtitulo: 'Para cuando todo te interrumpe y no avanzas en nada',
    duracion: 5,
    capacidad: 'atencion',
    cadena: ['Lo nombro', 'Elijo uno', 'Empiezo'],
    porQueExiste:
      'Entre notificaciones y gente pidiéndote cosas, llevas la mañana saltando sin terminar nada. Vamos a plantarte en una sola cosa.',
    bloques: [
      {
        id: 'todo',
        titulo: '¿Cuántas cosas llevas abiertas?',
        desde: 0,
        hasta: 1.5,
        tipo: 'escribir',
        guia: 'Nombra todo lo que tienes a medias ahora mismo.',
      },
      {
        id: 'elige',
        titulo: 'Elige solo una',
        desde: 1.5,
        hasta: 2.5,
        tipo: 'escribir',
        guia: 'De esa lista, ¿cuál te da más paz si la cierras hoy?',
      },
      {
        id: 'bloque',
        titulo: 'Dale tres minutos sin nada más',
        desde: 2.5,
        hasta: 5,
        tipo: 'hacer',
        guia: 'Silencia lo demás y quédate solo con esa. Aquí me callo yo.',
        paraQueSirve: 'Un ladrillo bien puesto avanza más que diez a medias.',
      },
    ],
    victoria: {
      titulo: 'Le diste a algo tu atención entera',
      cuerpo: 'No terminaste con todo. Terminaste con algo, de verdad, sin repartir la cabeza.',
      teLlevas: 'Puedo darle a una sola cosa toda mi atención, aunque sea un rato.',
    },
  },

  {
    id: 'quitarme-si-5',
    nombre: 'Quitarme el Sí',
    subtitulo: 'Para cuando aceptaste algo que no querías aceptar',
    duracion: 5,
    capacidad: 'limites',
    cadena: ['Lo veo', 'Lo nombro', 'Decido'],
    porQueExiste:
      'Dijiste que sí por no incomodar, y ahora te pesa. Vamos a mirarlo antes de que se convierta en resentimiento.',
    bloques: [
      {
        id: 'que-si',
        titulo: '¿A qué dijiste que sí?',
        desde: 0,
        hasta: 1.5,
        tipo: 'escribir',
        guia: 'Ese compromiso que aceptaste y que ya te está pesando.',
      },
      {
        id: 'motivo',
        titulo: '¿Por qué dijiste que sí?',
        desde: 1.5,
        hasta: 3,
        tipo: 'elegir',
        guia: 'Sé honesta contigo.',
        opciones: [
          'Por no quedar mal',
          'Por costumbre de decir que sí',
          'En el momento parecía fácil',
          'No supe decir que no a tiempo',
        ],
        paraQueSirve: 'Verlo no te hace débil. Te dice qué cuidar la próxima vez.',
      },
      {
        id: 'decidir',
        titulo: '¿Qué haces con este sí?',
        desde: 3,
        hasta: 5,
        tipo: 'elegir',
        guia: 'No hace falta deshacerlo todo. Elige un movimiento.',
        opciones: [
          'Lo sostengo esta vez, y cambio la próxima',
          'Aviso que necesito ajustarlo',
          'Pido ayuda para hacerlo más ligero',
        ],
      },
    ],
    victoria: {
      titulo: 'Viste el sí antes de que se pudriera',
      cuerpo: 'No hiciste nada drástico. Solo dejaste de cargarlo en silencio.',
      teLlevas: 'Puedo notar un sí que no quería decir, y hacer algo con eso.',
    },
  },

  {
    id: 'permiso-llorar-5',
    nombre: 'El Permiso de Llorar',
    subtitulo: 'Para cuando lo llevas atragantado y no sale',
    duracion: 5,
    capacidad: 'autocuidado',
    cadena: ['Me detengo', 'Me permito', 'Respiro'],
    porQueExiste:
      'A veces no hace falta resolver nada. Hace falta soltar lo que llevas atragantado. Aquí no hay prisa ni nadie mirando.',
    bloques: [
      {
        id: 'detener',
        titulo: 'Detente un momento',
        desde: 0,
        hasta: 1,
        tipo: 'leer',
        guia: 'No tienes que aguantar ahora mismo. Aquí puedes bajar la guardia.',
      },
      {
        id: 'permitir',
        titulo: 'Dale espacio a lo que sientes',
        desde: 1,
        hasta: 3.5,
        tipo: 'hacer',
        guia: 'Si quieres llorar, llora. Si no sale, solo quédate con lo que sientas.',
        marco: 'Llorar no es debilidad. Es soltar lo que ya no cabía.',
      },
      {
        id: 'respirar',
        titulo: 'Vuelve despacio',
        desde: 3.5,
        hasta: 5,
        tipo: 'ensayar',
        guia: 'Cuando quieras, respira hondo unas veces y vuelve a este momento.',
      },
    ],
    victoria: {
      titulo: 'Te diste permiso de sentir',
      cuerpo: 'No lo resolviste todo, y no hacía falta. Le diste espacio a algo que lo pedía.',
      teLlevas: 'Puedo darme permiso de sentir sin tener que arreglarlo enseguida.',
    },
  },

  {
    id: 'una-cosa-menos-5',
    nombre: 'Una Cosa Menos',
    subtitulo: 'Para cuando hasta elegir qué cocinar te cuesta',
    duracion: 5,
    capacidad: 'claridad',
    cadena: ['Las veo', 'Quito una', 'Decido'],
    porQueExiste:
      'No es que no puedas decidir. Es que llevas cien decisiones pequeñas hoy y ya no queda margen. Vamos a quitarte una de encima.',
    bloques: [
      {
        id: 'decisiones',
        titulo: '¿Qué te toca decidir ahora?',
        desde: 0,
        hasta: 1.5,
        tipo: 'escribir',
        guia: 'Todo lo pequeño que todavía tienes que resolver hoy.',
      },
      {
        id: 'delega',
        titulo: '¿Cuál puedes soltar o simplificar?',
        desde: 1.5,
        hasta: 3.5,
        tipo: 'escribir',
        guia: 'Una que puedas resolver fácil, delegar, o dejar para otro día.',
        paraQueSirve: 'No todas las decisiones necesitan ser perfectas.',
      },
      {
        id: 'decide',
        titulo: 'Decide esa, ya',
        desde: 3.5,
        hasta: 5,
        tipo: 'completar',
        guia: 'Zanjada, sin darle más vueltas.',
        plantilla: ['Decido ', ' y dejo ', ' para otro día.'],
        ejemplo: 'Decido qué cocinar hoy y dejo el resto de la lista para otro día.',
      },
    ],
    victoria: {
      titulo: 'Te quitaste una decisión de encima',
      cuerpo: 'Las demás siguen ahí, pero ya tienes una menos peleándote la cabeza.',
      teLlevas: 'Puedo cerrar una decisión pequeña sin necesitar que sea perfecta.',
    },
  },

  {
    id: 'un-paso-mas-5',
    nombre: 'Un Paso Más',
    subtitulo: 'Para cuando estás a mitad y quieres soltarlo todo',
    duracion: 5,
    capacidad: 'iniciativa',
    cadena: ['Lo veo', 'Reduzco', 'Sigo un poco'],
    porQueExiste:
      'Vas a mitad de algo y te dan ganas de dejarlo. No vamos a exigirte que termines. Solo un paso más pequeño que el anterior.',
    bloques: [
      {
        id: 'donde',
        titulo: '¿Dónde estás parada?',
        desde: 0,
        hasta: 1.5,
        tipo: 'escribir',
        guia: 'Cuéntame qué es y qué parte ya hiciste.',
      },
      {
        id: 'reducir',
        titulo: 'Hazlo más chico todavía',
        desde: 1.5,
        hasta: 3,
        tipo: 'escribir',
        guia: '¿Cuál es el paso más pequeño que puedes dar ahora, no el que falta entero?',
        marco: 'No tienes que terminarlo hoy. Solo no dejarlo caer del todo.',
      },
      {
        id: 'paso',
        titulo: 'Da ese paso',
        desde: 3,
        hasta: 5,
        tipo: 'hacer',
        guia: 'Solo ese, nada más. Aquí me callo yo.',
      },
    ],
    victoria: {
      titulo: 'No lo soltaste del todo',
      cuerpo: 'No hacía falta terminar hoy. Hacía falta no dejarlo caer, y no lo dejaste.',
      teLlevas: 'Puedo dar un paso más aunque quiera rendirme.',
    },
  },

  {
    id: 'ensayar-no-5',
    nombre: 'Ensayar el No',
    subtitulo: 'Para el no que llevas semanas sin decir',
    duracion: 5,
    capacidad: 'comunicacion',
    cadena: ['Lo nombro', 'Lo ensayo', 'Lo sostengo'],
    porQueExiste:
      'Hay un no que llevas evitando por miedo a la reacción del otro. No lo vas a decir ahora. Vamos a ensayarlo primero.',
    bloques: [
      {
        id: 'que-no',
        titulo: '¿A qué necesitas decir que no?',
        desde: 0,
        hasta: 1.5,
        tipo: 'escribir',
        guia: 'Eso que llevas aceptando aunque no quieras.',
      },
      {
        id: 'ensayo',
        titulo: 'Dilo aquí primero',
        desde: 1.5,
        hasta: 3.5,
        tipo: 'completar',
        guia: 'Practica la frase antes de decirla de verdad.',
        plantilla: ['No voy a poder ', ', pero sí puedo ', '.'],
        ejemplo: 'No voy a poder este sábado, pero sí puedo el que viene.',
      },
      {
        id: 'sostener',
        titulo: 'Prepárate para sostenerlo',
        desde: 3.5,
        hasta: 5,
        tipo: 'leer',
        guia: 'Si la otra persona se incomoda, no significa que te hayas equivocado.',
        marco: 'Un no incómodo sigue siendo un no válido.',
      },
    ],
    victoria: {
      titulo: 'Ya lo tienes ensayado',
      cuerpo: 'No hacía falta decirlo perfecto. Hacía falta tenerlo listo para cuando llegue.',
      teLlevas: 'Puedo decir que no aunque incomode, y seguir estando bien.',
    },
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 15 MINUTOS — autocuidado y compasión.
  // ═════════════════════════════════════════════════════════════════════════

  {
    id: 'escudo-culpa-15',
    nombre: 'El Escudo contra la Culpa',
    subtitulo: 'Bajarle el volumen a la voz que te riñe',
    duracion: 15,
    capacidad: 'autocuidado',
    cadena: ['La escucho', 'La cambio', 'Me la creo'],
    porQueExiste:
      'Ven aquí un momento. Sé que hoy te estás riñendo por no llegar a todo. Vamos a parar esa vocecita.',
    bloques: [
      {
        id: 'la-frase',
        titulo: 'Dime qué te has dicho hoy',
        desde: 0,
        hasta: 4,
        tipo: 'escribir',
        guia: 'Esa frase que te repites cuando algo no sale. Tal cual, sin suavizarla.',
        ejemplo: 'Otra vez no llegué a nada. Soy un desastre.',
        paraQueSirve: 'Dicha por dentro parece verdad. Escrita, ya no tanto.',
      },
      {
        id: 'la-amiga',
        titulo: 'Imagina que te lo cuenta otra',
        desde: 4,
        hasta: 11,
        tipo: 'escribir',
        guia: 'Una amiga a la que quieres te cuenta ese mismo cansancio. ¿Qué le dirías? Escríbeselo.',
        paraQueSirve: 'A ella le encuentras palabras que a ti no te dices.',
        marco: 'Lo que le dirías a ella también vale para ti.',
      },
      {
        id: 'sellar',
        titulo: 'Ahora dítelo a ti',
        desde: 11,
        hasta: 15,
        tipo: 'leer',
        guia: 'Cruza los brazos sobre el pecho y léelo otra vez, para ti. Sin prisa.',
      },
    ],
    victoria: {
      titulo: 'Soltaste un poco del peso',
      cuerpo: 'Te hablaste como le hablarías a alguien que te importa. Eso casi nunca te toca.',
      teLlevas: 'Puedo hablarme como le hablaría a alguien que quiero.',
    },
  },

  {
    id: 'santuario-15',
    nombre: 'El Santuario',
    subtitulo: 'Un rato en el que nadie te necesita',
    duracion: 15,
    capacidad: 'limites',
    cadena: ['Cierro la puerta', 'Lo suelto', 'Me quedo'],
    porQueExiste:
      'Todo el mundo quiere un trozo de ti. Hoy cerramos la puerta un rato: este cuarto de hora es tuyo.',
    bloques: [
      {
        id: 'puerta',
        titulo: 'Cierra la puerta',
        desde: 0,
        hasta: 3,
        tipo: 'ensayar',
        guia: 'Imagina una puerta entre todo lo pendiente y tú. Ciérrala despacio. Todo puede esperar.',
        marco: 'Aquí dentro nadie te necesita.',
      },
      {
        id: 'cansancio',
        titulo: 'Suelta el cansancio de sostener',
        desde: 3,
        hasta: 11,
        tipo: 'escribir',
        guia: 'Escribe lo que cargas por resolverle la vida a otros. Lo que no dices en voz alta.',
        paraQueSirve: 'Ese cansancio no es de las tareas. Es de estar disponible.',
      },
      {
        id: 'palmas',
        titulo: 'Quédate aquí un momento',
        desde: 11,
        hasta: 15,
        tipo: 'leer',
        guia: 'Palmas hacia arriba sobre las piernas, codos flojos. No tienes que hacer nada más.',
        ganancia: 'Hoy tienes derecho a no estar disponible.',
      },
    ],
    victoria: {
      titulo: 'Recuperaste un rato que era tuyo',
      cuerpo: 'No se lo quitaste a nadie: te lo devolviste a ti.',
      teLlevas: 'Puedo no estar disponible un rato sin que se caiga nada.',
    },
  },

  {
    id: 'silencio-15',
    nombre: 'El Ritual del Silencio',
    subtitulo: 'Bajarle las revoluciones al motor',
    duracion: 15,
    capacidad: 'recuperacion',
    cadena: ['Me acomodo', 'Me aflojo', 'Me voy lejos'],
    porQueExiste:
      '¿Cuánto hace que no te regalas quince minutos de silencio de verdad? Respira, acomódate y afloja.',
    bloques: [
      {
        id: 'acomodo',
        titulo: 'Ponte cómoda de verdad',
        desde: 0,
        hasta: 4,
        tipo: 'ensayar',
        guia: 'Baja la luz, busca un rincón y apoya las manos en las piernas. Sin postura de nada.',
      },
      {
        id: 'recorrido',
        titulo: 'Recorre y suelta',
        desde: 4,
        hasta: 11,
        tipo: 'hacer',
        guia: 'Baja la atención de la cabeza a los pies. Donde pases, imagina que pesa y se suelta.',
        paraQueSirve: 'Un recorrido concreto es más fácil que pedirle calma.',
      },
      {
        id: 'paisaje',
        titulo: 'Vete a un sitio tranquilo',
        desde: 11,
        hasta: 15,
        tipo: 'ensayar',
        guia: 'Piensa en un sitio donde estuviste tranquila. Métete ahí: qué se oye, qué temperatura hace.',
        ganancia: 'El mundo de fuera puede esperar en pausa.',
      },
    ],
    victoria: {
      titulo: 'Le diste a tu cabeza un rato de silencio',
      cuerpo: 'Quince minutos sin resolver, sin decidir y sin contestarle a nadie.',
      teLlevas: 'Puedo parar del todo un rato, y el día sigue igual de bien.',
    },
  },

  {
    id: 'cosecha-15',
    nombre: 'La Cosecha',
    subtitulo: 'Encontrar lo bueno que pasó desapercibido',
    duracion: 15,
    capacidad: 'atencion',
    cadena: ['Busco', 'Lo revivo', 'Lo guardo'],
    porQueExiste:
      'Cuando vas a mil, solo ves lo que falta. Vamos a buscar los ratitos de luz que hoy pasaron desapercibidos.',
    bloques: [
      {
        id: 'tres',
        titulo: 'Busca tres momentos pequeños',
        desde: 0,
        hasta: 5,
        tipo: 'escribir',
        guia: 'Tres momentos diminutos de las últimas veinticuatro horas que estuvieron bien.',
        ejemplo: 'El primer café solo. Mi hija contándome algo. Diez minutos de sol.',
        paraQueSirve: 'No es que no ocurran: es que no te paras a mirarlos.',
      },
      {
        id: 'revivir',
        titulo: 'Quédate con uno',
        desde: 5,
        hasta: 11,
        tipo: 'escribir',
        guia: 'Elige el que más te apetezca y cuéntamelo: dónde estabas, qué se oía, qué notaste.',
      },
      {
        id: 'guardar',
        titulo: 'Guárdatelo',
        desde: 11,
        hasta: 15,
        tipo: 'leer',
        guia: 'Cierra los ojos un momento con ese recuerdo puesto. Ahí sigue.',
        marco: 'Aunque vaya con prisas, mi vida tiene ratos buenos.',
      },
    ],
    victoria: {
      titulo: 'Hoy sí miraste lo bueno',
      cuerpo: 'Estaba ahí igual que ayer. La diferencia es que hoy te paraste a mirarlo.',
      teLlevas: 'Puedo encontrar algo bueno del día aunque el día haya sido difícil.',
    },
  },

  {
    id: 'esencia-15',
    nombre: 'Quitarte la Armadura',
    subtitulo: 'Acordarte de quién eres debajo de todo',
    duracion: 15,
    capacidad: 'autoconfianza',
    cadena: ['La suelto', 'Me pregunto', 'Me acuerdo'],
    porQueExiste:
      'De tanto poder con todo se te olvida la persona que hay debajo. Vamos a quitárnosla un rato.',
    bloques: [
      {
        id: 'armadura',
        titulo: 'Déjala en el suelo',
        desde: 0,
        hasta: 4,
        tipo: 'ensayar',
        guia: 'Imagina que llevas una armadura de aguantarlo todo. Quítatela y nota los hombros sin ella.',
      },
      {
        id: 'pregunta',
        titulo: 'Pregúntate con calma',
        desde: 4,
        hasta: 11,
        tipo: 'escribir',
        guia: '¿Qué necesitas hoy para sentirte cuidada por ti? Lo primero que te venga.',
        paraQueSirve: 'Es la pregunta que siempre va después de las de todos.',
      },
      {
        id: 'recordar',
        titulo: 'Acuérdate de esto',
        desde: 11,
        hasta: 15,
        tipo: 'leer',
        guia: 'Lo que vales no depende de cuánto hagas. Mereces descansar por existir.',
        ganancia: 'Eso sigue siendo verdad mañana.',
      },
    ],
    victoria: {
      titulo: 'Te acordaste de quién eres debajo',
      cuerpo: 'Lo que hay bajo la armadura también eres tú, y llevaba tiempo esperando.',
      teLlevas: 'Lo que valgo no depende de cuánto haya hecho hoy.',
    },
  },

  // ── Ampliación 2026-08-14: de 5 a 12 rutinas de 15 min. Estas van más al
  // fondo que las de 5: no son para el momento agudo, son para lo que carga
  // de base — un rol nunca elegido, cuidar hasta borrarse, el cuerpo, lo que
  // dejó de hacer por ella, la máscara de "puedo con todo", el descanso. ──

  {
    id: 'ya-no-cargar-15',
    nombre: 'Lo Que Ya No Quiero Cargar',
    subtitulo: 'Para soltar un papel que ya ni recuerdas haber elegido',
    duracion: 15,
    capacidad: 'limites',
    cadena: ['Lo nombro', 'Veo de quién es', 'Lo suelto'],
    porQueExiste:
      'Hay roles que cargas hace tanto que ya ni preguntas si los elegiste. Vamos a mirar uno y ver si aún quieres sostenerlo.',
    bloques: [
      {
        id: 'nombrar',
        titulo: 'Nombra ese papel',
        desde: 0,
        hasta: 4,
        tipo: 'escribir',
        guia: '¿Qué haces por costumbre, sin que nadie te lo pida ya? Cuéntamela.',
        ejemplo: 'Organizar todas las reuniones familiares, siempre yo.',
      },
      {
        id: 'de-quien',
        titulo: '¿De quién es esta carga?',
        desde: 4,
        hasta: 9,
        tipo: 'completar',
        guia: 'Separa lo que de verdad quieres de lo que heredaste sin darte cuenta.',
        plantilla: ['Lo cargo porque ', ', pero en el fondo ', '.'],
        ejemplo: 'Lo cargo porque siempre lo hice yo, pero en el fondo ya no quiero ser la única.',
      },
      {
        id: 'soltar',
        titulo: 'Decide qué haces con esto',
        desde: 9,
        hasta: 15,
        tipo: 'escribir',
        guia: 'No hace falta soltarlo todo hoy. ¿Qué parte sí puedes empezar a repartir?',
        marco: 'No te lo pidieron para siempre. Lo sostienes tú, mientras tú decidas.',
      },
    ],
    victoria: {
      titulo: 'Miraste una carga que llevabas en automático',
      cuerpo: 'No la soltaste toda, y no hacía falta. Viste que era una elección, no una condena.',
      teLlevas: 'Puedo revisar lo que cargo y decidir si todavía quiero cargarlo.',
    },
  },

  {
    id: 'cuidar-sin-perderme-15',
    nombre: 'Cuidar Sin Perderme',
    subtitulo: 'Para cuando das tanto que ya no sabes qué necesitas tú',
    duracion: 15,
    capacidad: 'autocuidado',
    cadena: ['Miro cuánto doy', 'Busco dónde estoy', 'Me pongo en la lista'],
    porQueExiste:
      'Cuidas tan bien de los demás que a veces se te olvida que tú también estás en esa lista. Vamos a ponerte de vuelta.',
    bloques: [
      {
        id: 'cuanto-doy',
        titulo: '¿A quién cuidas hoy?',
        desde: 0,
        hasta: 4,
        tipo: 'escribir',
        guia: 'Nombra a todos los que hoy dependieron un poco de ti.',
      },
      {
        id: 'donde-estoy',
        titulo: '¿Y tú, dónde quedaste?',
        desde: 4,
        hasta: 10,
        tipo: 'escribir',
        guia: 'De todo lo que diste hoy, ¿cuánto te diste a ti misma?',
        paraQueSirve: 'Cuidar a otros no debería significar desaparecer de la lista.',
      },
      {
        id: 'lista',
        titulo: 'Ponte en la lista de mañana',
        desde: 10,
        hasta: 15,
        tipo: 'completar',
        guia: 'Algo concreto, aunque sea pequeño.',
        plantilla: ['Mañana, entre todo lo demás, voy a darme ', ' antes de las ', '.'],
        ejemplo: 'Mañana, entre todo lo demás, voy a darme diez minutos antes de las nueve.',
      },
    ],
    victoria: {
      titulo: 'Te pusiste de vuelta en tu propia lista',
      cuerpo: 'Cuidar de los tuyos no tiene por qué costarte a ti. Hoy te incluiste también.',
      teLlevas: 'Puedo cuidar a otros sin borrarme yo de la lista.',
    },
  },

  {
    id: 'cuerpo-sostiene-15',
    nombre: 'El Cuerpo que Sostiene Todo',
    subtitulo: 'Para agradecerle lo que carga sin quejarse',
    duracion: 15,
    capacidad: 'autocuidado',
    cadena: ['Lo miro', 'Le agradezco', 'Le doy algo'],
    porQueExiste:
      'Tu cuerpo sostiene el día entero sin que casi lo notes. Vamos a pararnos un momento a mirarlo con otros ojos.',
    bloques: [
      {
        id: 'mirar',
        titulo: 'Mira todo lo que hizo hoy',
        desde: 0,
        hasta: 4,
        tipo: 'escribir',
        guia: 'Tu cuerpo, sin quejarse, ¿cuánto cargó, caminó o sostuvo hoy?',
      },
      {
        id: 'agradecer',
        titulo: 'Agradécele algo concreto',
        desde: 4,
        hasta: 9,
        tipo: 'completar',
        guia: 'No algo estético. Algo que hizo por ti hoy.',
        plantilla: ['Gracias, cuerpo, por ', ' aunque ', '.'],
        ejemplo: 'Gracias, cuerpo, por aguantar de pie toda la tarde aunque estabas agotado.',
      },
      {
        id: 'dar',
        titulo: 'Dale algo ahora',
        desde: 9,
        hasta: 15,
        tipo: 'hacer',
        guia: 'Estírate, date una crema con calma, o quédate quieta sin exigirle nada.',
      },
    ],
    victoria: {
      titulo: 'Miraste a tu cuerpo con otros ojos',
      cuerpo: 'No es solo lo que se ve. Es todo lo que carga por ti sin que se lo agradezcas.',
      teLlevas: 'Puedo agradecerle a mi cuerpo lo que sostiene, no solo pedirle más.',
    },
  },

  {
    id: 'recordar-me-gusta-15',
    nombre: 'Recordar lo que Me Gusta',
    subtitulo: 'Para reencontrar algo que se quedó en el camino',
    duracion: 15,
    capacidad: 'proposito',
    cadena: ['Lo busco', 'Lo recuerdo', 'Le hago sitio'],
    porQueExiste:
      'Entre tanto que sostener, hay cosas que te gustaban y que dejaste de hacer sin darte cuenta. Vamos a buscar una.',
    bloques: [
      {
        id: 'buscar',
        titulo: '¿Qué te gustaba hacer?',
        desde: 0,
        hasta: 5,
        tipo: 'escribir',
        guia: 'Algo que disfrutabas antes de que la vida se llenara tanto.',
        ejemplo: 'Pintar, aunque fuera mal. Leer sin mirar el reloj.',
      },
      {
        id: 'recordar',
        titulo: '¿Por qué lo dejaste?',
        desde: 5,
        hasta: 10,
        tipo: 'escribir',
        guia: 'No para culparte. Solo para ver qué se cruzó en el camino.',
        paraQueSirve: 'A veces no lo decidiste tú: dejó de haber espacio.',
      },
      {
        id: 'sitio',
        titulo: 'Hazle un huequito',
        desde: 10,
        hasta: 15,
        tipo: 'completar',
        guia: 'No hace falta que vuelva entero. Un pedacito basta.',
        plantilla: ['Esta semana le voy a hacer sitio a ', ' aunque solo sean ', '.'],
        ejemplo: 'Esta semana le voy a hacer sitio a leer aunque solo sean quince minutos.',
      },
    ],
    victoria: {
      titulo: 'Le hiciste sitio a algo tuyo',
      cuerpo: 'No tienes que recuperarlo todo de golpe. Hoy solo le abriste la puerta otra vez.',
      teLlevas: 'Puedo hacerle espacio a algo que me gusta, aunque sea poquito.',
    },
  },

  {
    id: 'permiso-no-poder-15',
    nombre: 'El Permiso de No Poder Siempre',
    subtitulo: 'Para bajar la máscara de que aguantas con todo',
    duracion: 15,
    capacidad: 'autocuidado',
    cadena: ['La veo', 'La bajo', 'Respiro'],
    porQueExiste:
      'Llevas tiempo demostrando que puedes con todo, incluso cuando no puedes. Aquí no hace falta demostrar nada.',
    bloques: [
      {
        id: 'mascara',
        titulo: '¿Qué llevas fingiendo que puedes?',
        desde: 0,
        hasta: 5,
        tipo: 'escribir',
        guia: 'Algo que dices que llevas bien, aunque por dentro no tanto.',
      },
      {
        id: 'bajar',
        titulo: 'Bájala un momento',
        desde: 5,
        hasta: 11,
        tipo: 'leer',
        guia: 'Aquí no tienes que sostener nada. No hay nadie mirando cómo lo haces.',
        marco: 'Poder con todo no te hace más fuerte. Solo más cansada.',
      },
      {
        id: 'respirar',
        titulo: 'Respira sin la máscara',
        desde: 11,
        hasta: 15,
        tipo: 'hacer',
        guia: 'Unas respiraciones largas, tal cual estás, sin arreglarte la cara todavía.',
      },
    ],
    victoria: {
      titulo: 'Bajaste la máscara un rato',
      cuerpo: 'No pasó nada malo. El mundo siguió girando aunque no demostraras que podías con todo.',
      teLlevas: 'Puedo bajar la máscara de "puedo con todo" sin que se caiga nada.',
    },
  },

  {
    id: 'paces-cuerpo-15',
    nombre: 'Hacer las Paces con Mi Cuerpo',
    subtitulo: 'Para mirarte sin la lista de lo que cambiarías',
    duracion: 15,
    capacidad: 'autoconfianza',
    cadena: ['Lo miro', 'Lo escucho', 'Lo acepto hoy'],
    porQueExiste:
      'Es fácil mirarte y solo ver la lista de lo que cambiarías. Hoy vamos a mirar distinto, aunque sea un rato.',
    bloques: [
      {
        id: 'lista-critica',
        titulo: '¿Qué te dices de tu cuerpo?',
        desde: 0,
        hasta: 5,
        tipo: 'escribir',
        guia: 'Esa lista de cosas que te repites cuando te miras. Sin filtrarla.',
      },
      {
        id: 'escuchar',
        titulo: 'Ahora pregúntale a él',
        desde: 5,
        hasta: 10,
        tipo: 'escribir',
        guia: 'Si tu cuerpo pudiera hablar, ¿qué te diría de cómo lo tratas?',
        paraQueSirve: 'Tu cuerpo no te falla. Lleva tiempo sin que lo escuches.',
      },
      {
        id: 'aceptar',
        titulo: 'Elige una tregua',
        desde: 10,
        hasta: 15,
        tipo: 'completar',
        guia: 'No hace falta quererlo todo hoy. Una tregua basta.',
        plantilla: ['Hoy hago las paces con ', ' aunque no ', '.'],
        ejemplo: 'Hoy hago las paces con mi barriga aunque no me encante todavía.',
      },
    ],
    victoria: {
      titulo: 'Le diste una tregua a tu cuerpo',
      cuerpo: 'No cambiaste cómo lo ves de un día para otro. Hoy solo bajaste un poco las armas.',
      teLlevas: 'Puedo tratar a mi cuerpo con algo más de tregua.',
    },
  },

  {
    id: 'descanso-sin-culpa-15',
    nombre: 'El Descanso que Sí Me Permito',
    subtitulo: 'Para descansar sin la culpa pegada detrás',
    duracion: 15,
    capacidad: 'recuperacion',
    cadena: ['Lo pido', 'Lo tomo', 'Lo disfruto'],
    porQueExiste:
      'Descansas, pero con la lista de pendientes encendida al lado. Vamos a intentar un descanso que sí sea descanso.',
    bloques: [
      {
        id: 'pedirlo',
        titulo: 'Dite que sí te lo mereces',
        desde: 0,
        hasta: 4,
        tipo: 'leer',
        guia: 'No hace falta haberlo ganado. Descansar no se merece, se necesita.',
        marco: 'El descanso no es el premio por terminar todo. Es parte del camino.',
      },
      {
        id: 'tomarlo',
        titulo: 'Aparta lo pendiente',
        desde: 4,
        hasta: 10,
        tipo: 'hacer',
        guia: 'Durante estos minutos, la lista espera. No va a irse a ningún lado.',
      },
      {
        id: 'disfrutar',
        titulo: 'Quédate sin remordimiento',
        desde: 10,
        hasta: 15,
        tipo: 'leer',
        guia: 'Si aparece la culpa, déjala pasar. No tienes que invitarla a quedarse.',
        ganancia: 'Un descanso con culpa apenas descansa.',
      },
    ],
    victoria: {
      titulo: 'Descansaste sin pedir perdón por ello',
      cuerpo: 'No hacía falta ganárselo. El descanso también es parte de sostener el día a día.',
      teLlevas: 'Puedo descansar sin que la culpa se siente al lado.',
    },
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 20 MINUTOS — ir más hondo. Sale entendiendo un patrón suyo.
  // ═════════════════════════════════════════════════════════════════════════

  {
    id: 'romper-ciclo-20',
    nombre: 'Romper el Ciclo',
    subtitulo: 'Encontrar dónde meterle mano a lo que se repite',
    duracion: 20,
    capacidad: 'autoconciencia',
    cadena: ['Lo veo', 'Lo dibujo', 'Encuentro la rendija', 'Lo ensayo'],
    porQueExiste:
      'Hay cosas que repetimos aunque no nos ayuden. No vamos a regañarte. Vamos a mirar qué pasa justo antes.',
    bloques: [
      {
        id: 'patron',
        titulo: 'Dime qué se repite',
        desde: 0,
        hasta: 4,
        tipo: 'escribir',
        guia: 'Algo que repites aunque sabes que no te ayuda. ¿En qué momentos suele aparecer?',
        ejemplo: 'Cojo el móvil en cuanto la tarea se pone cuesta arriba.',
      },
      {
        id: 'ciclo',
        titulo: 'Vamos a dibujarlo',
        desde: 4,
        hasta: 8,
        tipo: 'completar',
        guia: 'Primero pasa algo, luego notas algo, y luego haces algo.',
        plantilla: ['Cuando ', ', siento que quiero ', '.'],
        ejemplo: 'Cuando se me acumula el trabajo, siento que quiero escaparme.',
        paraQueSirve: 'No te pasa sin más: tiene un orden, y se interrumpe.',
      },
      {
        id: 'que-te-da',
        titulo: 'Y sé honesta: ¿qué te da?',
        desde: 8,
        hasta: 12,
        tipo: 'elegir',
        guia: 'Eso que haces te está dando algo, aunque después te cueste.',
        opciones: ['Alivio un rato', 'Sensación de control', 'Distracción', 'Que alguien me apruebe', 'Descanso'],
        marco: 'No es falta de fuerza de voluntad. Es que te sirve para algo.',
      },
      {
        id: 'rendija',
        titulo: 'Elige un solo punto',
        desde: 12,
        hasta: 17,
        tipo: 'completar',
        guia: 'No vamos a cambiar la cadena entera. Solo un punto, el más fácil.',
        plantilla: ['La próxima vez que ', ', voy a ', ' antes de nada.'],
        ejemplo: 'La próxima vez que quiera escaparme, voy a beber agua antes de nada.',
        paraQueSirve: 'Un cambio pequeño aguanta más que cambiarlo todo de golpe.',
      },
      {
        id: 'recordatorio',
        titulo: '¿Qué te lo va a recordar?',
        desde: 17,
        hasta: 20,
        tipo: 'elegir',
        guia: 'En el momento no te vas a acordar. ¿Qué señal puede avisarte?',
        opciones: [
          'Cuando coja el móvil sin querer',
          'Al abrir el ordenador',
          'Al llegar a casa',
          'Cuando note la tensión',
          'Antes de contestar algo',
        ],
      },
    ],
    victoria: {
      titulo: 'Encontraste una rendija',
      cuerpo: 'No hacía falta cambiarlo todo. Hoy viste dónde meter mano.',
      teLlevas: 'Cuando aparezca eso, tengo algo que hacer antes de repetir lo de siempre.',
    },
  },

  {
    id: 'conversacion-20',
    nombre: 'La Conversación Que Quiero Tener',
    subtitulo: 'Decirlo sin dejarte a ti fuera',
    duracion: 20,
    capacidad: 'comunicacion',
    cadena: ['Qué necesito', 'Lo separo', 'Me centro', 'Lo ensayo'],
    porQueExiste:
      'Hay una conversación que llevas aplazando. La preparamos, pero no para ganarla: para que puedas decir lo que necesitas.',
    bloques: [
      {
        id: 'que-quiero',
        titulo: '¿De qué quieres hablar?',
        desde: 0,
        hasta: 4,
        tipo: 'escribir',
        guia: 'Si la otra persona solo pudiera entender una cosa, ¿cuál sería?',
        paraQueSirve: 'Quedarte con una evita que acabe en reproches.',
      },
      {
        id: 'separar',
        titulo: 'Separa lo que sientes de lo que dirás',
        desde: 4,
        hasta: 8,
        tipo: 'completar',
        guia: 'Lo que sientes es válido. Pero no todo tiene que salir tal cual.',
        plantilla: ['Siento ', ' y lo que necesito es ', '.'],
        ejemplo: 'Siento que cargo con todo y lo que necesito es repartir los fines de semana.',
      },
      {
        id: 'centro',
        titulo: 'Decide cómo quieres estar tú',
        desde: 8,
        hasta: 11,
        tipo: 'elegir',
        guia: 'Antes de las palabras: ¿qué quieres proteger en esa conversación?',
        opciones: ['La calma', 'Ser clara', 'El respeto', 'Mi límite', 'Decir la verdad'],
        marco: 'Puedo decir lo que necesito sin controlar cómo va a reaccionar.',
      },
      {
        id: 'ensayo',
        titulo: 'Ensayemos lo incómodo',
        desde: 11,
        hasta: 17,
        tipo: 'ensayar',
        guia: 'Imagínalo tres veces: que te escuchan, que no están de acuerdo, y que insisten.',
        marco: 'Entiendo lo que dices. Aun así, esto es lo que necesito.',
        paraQueSirve: 'Si se pone incómodo, tendrás dónde agarrarte.',
      },
      {
        id: 'primer-paso',
        titulo: '¿Cuál es el primer movimiento?',
        desde: 17,
        hasta: 20,
        tipo: 'elegir',
        guia: 'Algo pequeño, de hoy o mañana.',
        opciones: ['Pedirle hablar', 'Mandarle un mensaje', 'Elegir el momento', 'Escribir lo que quiero decir'],
      },
    ],
    victoria: {
      titulo: 'Dejaste de preparar una discusión',
      cuerpo: 'No puedes decidir cómo va a responder. Sí cómo llegas tú.',
      teLlevas: 'Puedo decir lo que necesito sin necesitar que el otro reaccione bien.',
    },
  },

  {
    id: 'paces-error-20',
    nombre: 'Hacer las Paces con el Error',
    subtitulo: 'Que equivocarte deje de costarte tanto',
    duracion: 20,
    capacidad: 'aprendizaje',
    cadena: ['Lo miro', 'Lo separo', 'Lo pruebo', 'Me lo llevo'],
    porQueExiste:
      'Cuando algo sale mal, la frase que viene después hace más daño que el error. Vamos a mirar esa frase.',
    bloques: [
      {
        id: 'error',
        titulo: 'Cuéntame qué no salió',
        desde: 0,
        hasta: 4,
        tipo: 'escribir',
        guia: 'Algo reciente que no salió como querías. ¿Qué te dijiste justo después?',
        ejemplo: 'Se me pasó la fecha. Me dije: siempre igual, no puedo con nada.',
      },
      {
        id: 'separar',
        titulo: 'Una cosa es el hecho y otra la historia',
        desde: 4,
        hasta: 8,
        tipo: 'completar',
        guia: 'Ponlas separadas. Verás que no son lo mismo.',
        plantilla: ['Lo que pasó fue ', '. Lo que me dije fue ', '.'],
        paraQueSirve: 'Solo una de las dos se puede comprobar.',
      },
      {
        id: 'informacion',
        titulo: 'Sácale lo que sirve',
        desde: 8,
        hasta: 11,
        tipo: 'escribir',
        guia: '¿Qué sabes ahora que no sabías antes de que pasara?',
        marco: 'Un error puede decirme qué ajustar sin decidir quién soy.',
      },
      {
        id: 'experimento',
        titulo: 'Prueba una versión distinta',
        desde: 11,
        hasta: 17,
        tipo: 'hacer',
        guia: 'Coge algo pequeño parecido y hazlo cambiando una sola cosa.',
      },
      {
        id: 'aprendizaje',
        titulo: 'Déjalo escrito',
        desde: 17,
        hasta: 20,
        tipo: 'completar',
        guia: 'Para no tener que acordarte de todo esto la próxima vez.',
        plantilla: ['La próxima vez voy a ', ' porque ahora sé ', '.'],
      },
    ],
    victoria: {
      titulo: 'Le sacaste algo a un error',
      cuerpo: 'No hacía falta demostrar que no te equivocas. Hacía falta poder usarlo.',
      teLlevas: 'Puedo equivocarme, aprender algo y volver a intentarlo de otra manera.',
    },
  },

  {
    id: 'todo-demasiado-20',
    nombre: 'Cuando Todo Parece Demasiado',
    subtitulo: 'Recuperar el rumbo sin resolverlo todo',
    duracion: 20,
    capacidad: 'claridad',
    cadena: ['Lo saco', 'Bajo el ruido', 'Ordeno', 'Elijo una'],
    porQueExiste:
      'Cuando todo se junta, intentas resolverlo a la vez y acabas sin hacer nada. Hoy solo recuperamos el rumbo.',
    bloques: [
      {
        id: 'vaciar',
        titulo: 'Sácalo todo de la cabeza',
        desde: 0,
        hasta: 4,
        tipo: 'escribir',
        guia: 'Escribe todo lo que te está ocupando sitio. Sin ordenar ni resolver.',
        paraQueSirve: 'Sostenerlo de memoria te cuesta el doble.',
      },
      {
        id: 'bajar-ruido',
        titulo: 'Quita ruido, no añadas nada',
        desde: 4,
        hasta: 8,
        tipo: 'leer',
        guia: 'Silencia lo que suene, aparta el móvil y cierra lo que no necesites. Respira despacio.',
        marco: 'No vamos a quitarte el estrés. Vamos a hacerte sitio.',
      },
      {
        id: 'ordenar',
        titulo: 'Ordena en tres montones',
        desde: 8,
        hasta: 12,
        tipo: 'escribir',
        guia: 'Lo que sí es de hoy, lo que puede esperar y lo que no te toca a ti.',
      },
      {
        id: 'movimiento',
        titulo: 'Elige una y empiézala',
        desde: 12,
        hasta: 17,
        tipo: 'hacer',
        guia: 'De lo de hoy, solo una. Haz el primer trocito ahora, aunque sean dos minutos.',
        ganancia: 'Pasaste de "tengo mil cosas" a "sé qué hago ahora".',
      },
      {
        id: 'senal-vuelta',
        titulo: '¿Cómo sabrás que te vuelve a pasar?',
        desde: 17,
        hasta: 20,
        tipo: 'escribir',
        guia: 'Cuando vuelva la sensación de que todo es demasiado, ¿en qué lo notarás primero?',
        ejemplo: 'Cuando empiece a saltar de una cosa a otra sin terminar ninguna.',
      },
    ],
    victoria: {
      titulo: 'Recuperaste el rumbo',
      cuerpo: 'Hace veinte minutos todo competía. Ahora hay una cosa y un siguiente paso.',
      teLlevas: 'Puedo poner orden aunque todo parezca demasiado.',
    },
  },

  {
    id: 'lo-que-importa-20',
    nombre: 'Hacer lo que Importa',
    subtitulo: 'Acercar lo que haces a lo que te importa',
    duracion: 20,
    capacidad: 'proposito',
    cadena: ['Lo nombro', 'Lo miro', 'Veo la distancia', 'Doy un paso'],
    porQueExiste:
      'La vida se llena de urgencias y lo que te importa se queda esperando. No hay que cambiarlo todo.',
    bloques: [
      {
        id: 'valor',
        titulo: '¿Qué te importa de verdad?',
        desde: 0,
        hasta: 4,
        tipo: 'escribir',
        guia: 'Dime una cosa importante para ti. Y no la palabra sola: por qué te importa.',
        ejemplo: 'Mi salud, porque quiero llegar a los sesenta jugando con mis nietos.',
      },
      {
        id: 'realidad',
        titulo: 'Ahora mira cómo está la cosa',
        desde: 4,
        hasta: 8,
        tipo: 'completar',
        guia: 'Sin juzgarte, solo mirando.',
        plantilla: ['Lo apoyo cuando ', ' y lo alejo cuando ', '.'],
      },
      {
        id: 'distancia',
        titulo: 'La distancia más pequeña',
        desde: 8,
        hasta: 12,
        tipo: 'escribir',
        guia: '¿Cuál es la diferencia más pequeña que podrías reducir esta semana?',
        ejemplo: 'No "cambiar mi alimentación". Dejar preparada la comida de mañana.',
        paraQueSirve: 'Los cambios grandes se caen en tres días.',
      },
      {
        id: 'conducta',
        titulo: 'Ponle día, hora y sitio',
        desde: 12,
        hasta: 17,
        tipo: 'completar',
        guia: 'Una intención sin cuándo ni dónde se queda en intención.',
        plantilla: ['Voy a ', ' el ', ', en cuanto termine lo de siempre.'],
        ejemplo: 'Voy a dejar la comida preparada el domingo, en cuanto termine de recoger.',
      },
      {
        id: 'alineacion',
        titulo: '¿Y qué dice eso de ti?',
        desde: 17,
        hasta: 20,
        tipo: 'escribir',
        guia: 'Cuando lo hagas, ¿qué estará diciendo sobre lo que te importa?',
        ejemplo: 'Que mi descanso no es lo que dejo para el final.',
      },
    ],
    victoria: {
      titulo: 'Acercaste lo que haces a lo que te importa',
      cuerpo: 'No hace falta darle la vuelta a tu vida. Una cosa pequeña también dice quién eres.',
      teLlevas: 'Puedo demostrar lo que me importa con lo que hago, no solo con lo que digo.',
    },
  },

  // ── Ampliación 2026-08-14: de 5 a 10 rutinas de 20 min. Completa la
  // biblioteca en 36 (19 · 12 · 10, prioridad de la dueña por uso real). ──

  {
    id: 'ciclo-agotamiento-20',
    nombre: 'El Ciclo del Agotamiento',
    subtitulo: 'Para ver la señal antes de llegar al límite',
    duracion: 20,
    capacidad: 'recuperacion',
    cadena: ['Lo veo', 'Busco la señal', 'La atiendo antes', 'Lo ensayo'],
    porQueExiste:
      'Casi siempre notas que estás agotada cuando ya no puedes más. Vamos a buscar la señal de antes, la que sí puedes atender a tiempo.',
    bloques: [
      {
        id: 'llegada',
        titulo: '¿Cómo te diste cuenta esta vez?',
        desde: 0,
        hasta: 4,
        tipo: 'escribir',
        guia: '¿Cuándo notaste que ya no podías más? ¿Qué pasó justo antes?',
      },
      {
        id: 'senal-temprana',
        titulo: 'Busca la señal de antes',
        desde: 4,
        hasta: 9,
        tipo: 'elegir',
        guia: 'Antes de llegar al límite, tu cuerpo suele avisar. ¿Con cuál te identificas?',
        opciones: [
          'Duermo mal, aunque esté cansada',
          'Me irrito por cosas pequeñas',
          'Dejo de comer bien',
          'Ya no tengo ganas de nada que me gusta',
        ],
        paraQueSirve: 'Esa señal aparece días antes del bajón, no el mismo día.',
      },
      {
        id: 'atender',
        titulo: '¿Qué podrías hacer al notarla?',
        desde: 9,
        hasta: 15,
        tipo: 'completar',
        guia: 'Algo pequeño, no una solución enorme.',
        plantilla: ['Cuando note eso, voy a ', ' en vez de esperar a que ', '.'],
        ejemplo: 'Cuando note eso, voy a parar un rato en vez de esperar a que ya no pueda más.',
      },
      {
        id: 'ensayo',
        titulo: 'Imagina que aparece la señal',
        desde: 15,
        hasta: 20,
        tipo: 'ensayar',
        guia: 'Piensa en la próxima vez que la notes. Practica hacer eso pequeño, antes de que sea tarde.',
      },
    ],
    victoria: {
      titulo: 'Encontraste la señal de antes',
      cuerpo: 'No hacía falta esperar al límite. Ahora tienes algo que atender antes de llegar ahí.',
      teLlevas: 'Puedo notar la señal temprana y atenderla antes de agotarme del todo.',
    },
  },

  {
    id: 'limite-olvida-20',
    nombre: 'El Límite que Se Me Olvida',
    subtitulo: 'Para el límite que sabes poner y no pones',
    duracion: 20,
    capacidad: 'limites',
    cadena: ['Lo nombro', 'Veo el momento', 'Preparo la frase', 'Lo ensayo'],
    porQueExiste:
      'Hay un límite que sabes que necesitas y que sueltas cada vez. Vamos a ver qué pasa justo antes de soltarlo.',
    bloques: [
      {
        id: 'limite',
        titulo: '¿Qué límite se te olvida sostener?',
        desde: 0,
        hasta: 4,
        tipo: 'escribir',
        guia: 'Ese que sabes que necesitas, y que sueltas en cuanto alguien insiste.',
      },
      {
        id: 'momento',
        titulo: '¿En qué momento cedes?',
        desde: 4,
        hasta: 9,
        tipo: 'elegir',
        guia: '¿Qué suele pasar justo antes de que lo sueltes?',
        opciones: [
          'La otra persona insiste',
          'Siento que voy a quedar mal',
          'Me da pena decir que no',
          'Se me olvida hasta que ya es tarde',
        ],
        paraQueSirve: 'Ese momento exacto es donde se puede intervenir.',
      },
      {
        id: 'frase',
        titulo: 'Prepara qué decir en ese momento',
        desde: 9,
        hasta: 15,
        tipo: 'completar',
        guia: 'Una frase corta, lista para ese instante.',
        plantilla: ['Cuando insistan, voy a decir ', ' en vez de ', '.'],
        ejemplo: 'Cuando insistan, voy a decir que lo pienso y aviso, en vez de decir que sí de una vez.',
      },
      {
        id: 'ensayo',
        titulo: 'Ensáyalo una vez más',
        desde: 15,
        hasta: 20,
        tipo: 'ensayar',
        guia: 'Imagina que vuelve a pasar. Practica decir tu frase antes de que llegue el momento real.',
      },
    ],
    victoria: {
      titulo: 'Encontraste el momento exacto donde cedes',
      cuerpo: 'La próxima vez no vas a improvisar. Ya tienes lista la frase para ese instante.',
      teLlevas: 'Puedo sostener un límite si sé de antemano qué voy a decir.',
    },
  },

  {
    id: 'comparo-quien-era-20',
    nombre: 'Cuando Me Comparo con Quien Era Antes',
    subtitulo: 'Para la nostalgia de la que fuiste antes de sostenerlo todo',
    duracion: 20,
    capacidad: 'autoconfianza',
    cadena: ['La miro', 'La entiendo', 'Busco quién soy ahora', 'Me lo llevo'],
    porQueExiste:
      'A veces te comparas con la que eras antes, y sales perdiendo. Esa persona no tenía lo que sostienes ahora. Vamos a mirarlo distinto.',
    bloques: [
      {
        id: 'antes',
        titulo: '¿Con quién te comparas?',
        desde: 0,
        hasta: 5,
        tipo: 'escribir',
        guia: 'Esa versión de ti de antes. ¿Qué tenía que ahora sientes que no tienes?',
      },
      {
        id: 'entender',
        titulo: '¿Qué no tenía ella?',
        desde: 5,
        hasta: 10,
        tipo: 'escribir',
        guia: 'Esa persona de antes, ¿qué no cargaba que tú sí cargas ahora?',
        paraQueSirve: 'No es que valgas menos. Es que sostienes más.',
      },
      {
        id: 'ahora',
        titulo: '¿Quién eres con todo esto encima?',
        desde: 10,
        hasta: 16,
        tipo: 'escribir',
        guia: 'No la de antes. La de ahora, con todo lo que sostiene. ¿Qué tiene que antes no tenía?',
      },
      {
        id: 'llevar',
        titulo: 'Quédate con esto',
        desde: 16,
        hasta: 20,
        tipo: 'leer',
        guia: 'No eres menos que quien fuiste. Eres alguien que sostiene mucho más.',
        marco: 'Comparar quién eras con quién eres es comparar dos personas distintas.',
      },
    ],
    victoria: {
      titulo: 'Dejaste de compararte con quien ya no eres',
      cuerpo: 'La de antes no cargaba lo que tú cargas. No hay comparación justa ahí.',
      teLlevas: 'Puedo ver todo lo que sostengo ahora, no solo lo que era antes.',
    },
  },

  {
    id: 'pedir-ayuda-20',
    nombre: 'Pedir Ayuda sin Sentir que Fallo',
    subtitulo: 'Para cuando pedir ayuda se siente como perder',
    duracion: 20,
    capacidad: 'autonomia',
    cadena: ['Lo veo', 'Entiendo por qué no pido', 'Elijo a quién', 'Lo ensayo'],
    porQueExiste:
      'Prefieres cargar sola antes que pedir ayuda, aunque te esté costando caro. Vamos a ver por qué, y a practicar pedirla.',
    bloques: [
      {
        id: 'que',
        titulo: '¿Qué necesitas ahora mismo?',
        desde: 0,
        hasta: 4,
        tipo: 'escribir',
        guia: 'Algo con lo que podrían ayudarte, si te animaras a pedirlo.',
      },
      {
        id: 'porque',
        titulo: '¿Por qué no lo has pedido?',
        desde: 4,
        hasta: 9,
        tipo: 'elegir',
        guia: 'Sé honesta contigo.',
        opciones: [
          'Siento que debería poder sola',
          'Me da miedo que digan que no',
          'No quiero deberle nada a nadie',
          'Nunca lo pienso hasta que ya es tarde',
        ],
        marco: 'Pedir ayuda no es fallar. Es reconocer que no tienes que sostenerlo todo sola.',
      },
      {
        id: 'quien',
        titulo: '¿A quién se lo podrías pedir?',
        desde: 9,
        hasta: 13,
        tipo: 'escribir',
        guia: 'Alguien concreto, no "alguien" en general.',
      },
      {
        id: 'ensayo',
        titulo: 'Practica cómo lo pedirías',
        desde: 13,
        hasta: 20,
        tipo: 'completar',
        guia: 'Una frase corta y directa.',
        plantilla: ['¿Me ayudarías con ', '? Me vendría bien ', '.'],
        ejemplo: '¿Me ayudarías con recoger a los niños el jueves? Me vendría bien mucho.',
      },
    ],
    victoria: {
      titulo: 'Ensayaste pedir lo que necesitas',
      cuerpo: 'No hacía falta seguir cargando sola. Pedir ayuda no te hace menos capaz.',
      teLlevas: 'Puedo pedir ayuda sin que eso signifique que fallé.',
    },
  },

  {
    id: 'perfeccionismo-frena-20',
    nombre: 'El Perfeccionismo que Me Frena',
    subtitulo: 'Para cuando "que quede perfecto" te frena de empezar',
    duracion: 20,
    capacidad: 'iniciativa',
    cadena: ['Lo veo', 'Encuentro el mínimo', 'Lo pruebo', 'Me lo llevo'],
    porQueExiste:
      'A veces no avanzas porque quieres que quede perfecto, y eso te frena más que cualquier otra cosa. Vamos a probar con menos.',
    bloques: [
      {
        id: 'que',
        titulo: '¿Qué llevas sin empezar por esto?',
        desde: 0,
        hasta: 4,
        tipo: 'escribir',
        guia: 'Algo que pospones porque quieres hacerlo bien y no encuentras el momento.',
      },
      {
        id: 'version-minima',
        titulo: '¿Cómo sería la versión fea?',
        desde: 4,
        hasta: 9,
        tipo: 'escribir',
        guia: 'Olvídate de que quede bien. ¿Cómo sería la versión más simple posible?',
        paraQueSirve: 'Empezar mal es mejor que no empezar. Se mejora después.',
      },
      {
        id: 'probar',
        titulo: 'Haz esa versión fea, ahora',
        desde: 9,
        hasta: 16,
        tipo: 'hacer',
        guia: 'Sin buscar que quede bien. Solo que exista. Aquí me callo yo.',
      },
      {
        id: 'llevar',
        titulo: 'Mira lo que hiciste',
        desde: 16,
        hasta: 20,
        tipo: 'leer',
        guia: 'No es perfecto, y existe. Eso ya es más de lo que tenías hace veinte minutos.',
        ganancia: 'Lo imperfecto que existe vale más que lo perfecto que sigue en tu cabeza.',
      },
    ],
    victoria: {
      titulo: 'Elegiste que existiera, no que fuera perfecto',
      cuerpo: 'Lo perfecto puede esperar. Lo que hiciste hoy ya es un paso real.',
      teLlevas: 'Puedo empezar algo imperfecto en vez de esperar a que sea perfecto.',
    },
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// EL CIERRE DE GRATITUD — pedido de la dueña (2026-08-24): "dale full, sea
// bueno o malo el día, es algo muy pequeño que me parece muy lindo". Se
// inyecta AQUÍ, en el único lugar por el que pasan las 20+ rutinas antes de
// salir del módulo — así aplica a TODAS sin tocar ni un bloque escrito a
// mano arriba, y sin riesgo de desincronizar `cadena` y `bloques` en cada una.
//
// Se le reserva el último 8% del tiempo total (compactando el resto
// proporcionalmente) — en 5 min son ~24s, suficiente para pensar tres cosas
// sin alargar la promesa de duración de la rutina.
const FRACCION_GRATITUD = 0.08;

const BLOQUE_GRATITUD: Omit<Bloque, 'desde' | 'hasta'> = {
  id: 'gratitud',
  titulo: 'Antes de cerrar',
  tipo: 'ensayar',
  guia: 'Piensa en tres cosas que tienes hoy. No hace falta que sean grandes.',
  marco: 'No necesitas sentirte agradecida para intentarlo.',
};

function conGratitud(rutina: Rutina): Rutina {
  const factor = 1 - FRACCION_GRATITUD;
  return {
    ...rutina,
    cadena: [...rutina.cadena, 'Agradezco'],
    bloques: [
      ...rutina.bloques.map((b) => ({ ...b, desde: b.desde * factor, hasta: b.hasta * factor })),
      { ...BLOQUE_GRATITUD, desde: rutina.duracion * factor, hasta: rutina.duracion },
    ],
  };
}

/** Elige la rutina del día por duración. Determinista mientras no haya historial:
 *  cuando exista base de datos, aquí entra la rotación anti-fatiga. */
export function rutinaPara(duracion: DuracionRutina, id?: string): Rutina {
  if (id) {
    const pedida = RUTINAS.find((r) => r.id === id);
    if (pedida) return conGratitud(pedida);
  }
  const base = RUTINAS.find((r) => r.duracion === duracion) ?? RUTINAS[0]!;
  return conGratitud(base);
}

/** Las rutinas disponibles de una duración. */
export function rutinasDe(duracion: DuracionRutina): Rutina[] {
  return RUTINAS.filter((r) => r.duracion === duracion).map(conGratitud);
}
