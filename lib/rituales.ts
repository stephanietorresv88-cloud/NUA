// ═══════════════════════════════════════════════════════════════════════════
// SISTEMA NUA DE ENTRENAMIENTO ADAPTATIVO
// La unidad del producto NO es el hábito: es la EXPERIENCIA NUA.
//   estado → microacción → frase de práctica → evidencia → adaptación
//
// Doctrina completa y razonamiento: docs/contenido-rituales.md
// Este archivo es la BIBLIOTECA. La lógica de selección vive en seleccionarExperiencia().
//
// ⚠️ LÍMITE DE CLAIMS (gate 61 / legal 47): la investigación de neurociencia y
// ciencia del comportamiento es la razón INTERNA de por qué cada microacción está
// diseñada así. NUNCA se usa como argumento de venta ni se atribuye a autores
// concretos en la interfaz. NUA no diagnostica, no trata y no sustituye atención
// profesional. El campo `porQueAyuda` se le muestra a la usuaria en lenguaje
// corriente, sin jerga clínica y sin prometer resultados de salud.
// ═══════════════════════════════════════════════════════════════════════════

export type EstadoId = 'reserva' | 'media' | 'energia';

/** Las 7 capacidades que NUA entrena. No son categorías de hábitos: son músculos. */
export type CapacidadId =
  | 'atencion'
  | 'regulacion'
  | 'claridad'
  | 'autocuidado'
  | 'limites'
  | 'recuperacion'
  | 'autoconfianza'
  // Ampliación 2026-08-14: las capacidades que entrenan las rutinas aportadas por
  // la dueña y que el modelo no tenía. Sin ellas había que forzar cada rutina
  // dentro de una capacidad que no era la suya (iniciativa acababa en
  // "autoconfianza", que no es lo mismo que entrena).
  | 'iniciativa'
  | 'autonomia'
  | 'comunicacion'
  | 'aprendizaje'
  | 'proposito'
  | 'autoconciencia';

export const CAPACIDADES: Record<
  CapacidadId,
  { nombre: string; entrena: string; posesivo: 'tu' | 'tus' }
> = {
  atencion: { nombre: 'Atención', entrena: 'volver al presente sin pelearte contigo', posesivo: 'tu' },
  regulacion: { nombre: 'Regulación', entrena: 'cambiar tu estado antes de reaccionar', posesivo: 'tu' },
  claridad: { nombre: 'Claridad', entrena: 'convertir el ruido mental en un paso concreto', posesivo: 'tu' },
  autocuidado: { nombre: 'Autocuidado', entrena: 'que cuidarte sea conducta, no intención', posesivo: 'tu' },
  // "Límites" es el único plural: sin este campo salía "Hoy entrenamos tu límites".
  limites: { nombre: 'Límites', entrena: 'proteger tu tiempo antes de comprometerlo', posesivo: 'tus' },
  recuperacion: { nombre: 'Recuperación', entrena: 'bajar revoluciones a propósito', posesivo: 'tu' },
  autoconfianza: { nombre: 'Autoconfianza', entrena: 'actuar aunque la certeza no llegue', posesivo: 'tu' },
  iniciativa: { nombre: 'Iniciativa', entrena: 'empezar aunque siga estando la resistencia', posesivo: 'tu' },
  autonomia: { nombre: 'Autonomía', entrena: 'decidir desde tu criterio, sin certeza absoluta', posesivo: 'tu' },
  comunicacion: { nombre: 'Comunicación', entrena: 'decir lo que necesitas sin abandonarte', posesivo: 'tu' },
  aprendizaje: { nombre: 'Aprendizaje', entrena: 'convertir un error en información, no en identidad', posesivo: 'tu' },
  proposito: { nombre: 'Propósito', entrena: 'que lo que haces se parezca a lo que te importa', posesivo: 'tu' },
  autoconciencia: { nombre: 'Autoconciencia', entrena: 'ver el patrón antes de repetirlo', posesivo: 'tu' },
};

/** Las 6 arquitecturas de rutina. La rutina NO es siempre "mañana/noche". */
export type ArquitecturaId =
  | 'activacion'
  | 'enfoque'
  | 'transicion'
  | 'recuperacion'
  | 'reinicio'
  | 'decision';

export const ARQUITECTURAS: Record<ArquitecturaId, { nombre: string; cuando: string }> = {
  activacion: { nombre: 'Activación', cuando: 'cuando llegas con la batería baja' },
  enfoque: { nombre: 'Enfoque', cuando: 'cuando tienes demasiadas cosas a la vez' },
  transicion: { nombre: 'Transición', cuando: 'para pasar del trabajo a tu casa' },
  recuperacion: { nombre: 'Recuperación', cuando: 'cuando llegas agotada' },
  reinicio: { nombre: 'Reinicio', cuando: 'cuando llevas días sin abrir NUA' },
  decision: { nombre: 'Decisión', cuando: 'cuando estás bloqueada' },
};

/** Una microacción: comportamiento medible, con ancla situacional y evidencia. */
export interface Microaccion {
  id: string;
  capacidad: CapacidadId;
  /** Lo que hace, en imperativo corto. Es el título que ella ve. */
  titulo: string;
  /** El cue: CUÁNDO se dispara. Una intención de implementación ("cuando X, haré Y"). */
  contexto: string;
  segundos: number;
  /** En lenguaje corriente. Se le muestra: es lo que separa esto de "respira y ya". */
  porQueAyuda: string;
  /** La frase de evidencia en pasado. Es el progreso REAL, no la racha. */
  evidencia: string;
  /** 1-5. El motor sube o baja según lo que ella complete (ver docs/contenido-rituales.md). */
  dificultad: 1 | 2 | 3 | 4 | 5;
}

/**
 * Frase de práctica. NO es un mantra: es una hipótesis que la microacción pone a prueba.
 * Fórmula: situación + permiso + acción.
 * Las 5 fases: 1 notar · 2 actuar · 3 sostener · 4 transferir · 5 autonomía.
 * La fase es INTERNA — nunca se le muestra "Nivel 2" a la usuaria.
 */
export interface FraseDePractica {
  id: string;
  capacidad: CapacidadId;
  fase: 1 | 2 | 3 | 4 | 5;
  texto: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// BIBLIOTECA DE MICROACCIONES
// ═══════════════════════════════════════════════════════════════════════════

export const MICROACCIONES: Microaccion[] = [
  // ── ATENCIÓN ──────────────────────────────────────────────────────────
  {
    id: 'at-mirada',
    capacidad: 'atencion',
    titulo: 'Mira un punto fijo mientras bebes',
    contexto: 'Con el primer sorbo de agua o café, antes de tocar el teléfono',
    segundos: 30,
    porQueAyuda:
      'Le das a tu cabeza treinta segundos de una sola cosa antes de la avalancha de estímulos del día.',
    evidencia: 'Hoy empezaste el día con una sola cosa en la cabeza, no con veinte.',
    dificultad: 1,
  },
  {
    id: 'at-cerrar',
    capacidad: 'atencion',
    titulo: 'Termina lo abierto antes de abrir otra cosa',
    contexto: 'Cuando te descubras saltando entre pestañas sin cerrar ninguna',
    segundos: 60,
    porQueAyuda:
      'Cada tarea a medias sigue ocupando espacio en tu cabeza aunque no la estés mirando.',
    evidencia: 'Hoy cerraste algo antes de abrir lo siguiente.',
    dificultad: 2,
  },

  // ── REGULACIÓN ────────────────────────────────────────────────────────
  {
    id: 're-suspiro',
    capacidad: 'regulacion',
    titulo: 'Dos inhalaciones y una exhalación larga',
    contexto: 'Al notar la primera punzada de prisa frente a la pantalla',
    segundos: 45,
    porQueAyuda:
      'Dos inhalaciones cortas por la nariz y una exhalación larga por la boca bajan el pulso antes de que te dé tiempo a pensar.',
    evidencia: 'Hoy bajaste el ritmo antes de que el día te bajara a ti.',
    dificultad: 1,
  },
  {
    id: 're-espera',
    capacidad: 'regulacion',
    titulo: 'Espera 30 segundos antes de responder',
    contexto: 'Cuando llegue un mensaje que te haya molestado',
    segundos: 30,
    porQueAyuda:
      'Treinta segundos son suficientes para que contestes tú y no la irritación.',
    evidencia: 'Hoy respondiste tú, no tu reacción.',
    dificultad: 3,
  },

  // ── CLARIDAD ──────────────────────────────────────────────────────────
  {
    id: 'cl-volcado',
    capacidad: 'claridad',
    titulo: 'Escribe todo lo que te ronda',
    contexto: 'Cuando sientas que tienes demasiadas cosas a la vez',
    segundos: 30,
    porQueAyuda:
      'Lo que está en tu cabeza pesa el doble que lo que está escrito. Sacarlo lo vuelve manejable.',
    evidencia: 'Hoy convertiste ruido mental en algo que se puede mirar.',
    dificultad: 1,
  },
  {
    id: 'cl-una',
    capacidad: 'claridad',
    titulo: 'Marca la única que depende de ti hoy',
    contexto: 'Justo después de vaciar la cabeza',
    segundos: 30,
    porQueAyuda:
      'La mayoría de lo que te angustia hoy no se resuelve hoy. Elegir una cosa es lo que devuelve el control.',
    evidencia: 'Hoy elegiste una prioridad antes de reaccionar.',
    dificultad: 2,
  },
  {
    id: 'cl-empieza',
    capacidad: 'claridad',
    titulo: 'Empieza esa única cosa',
    contexto: 'Con la prioridad ya elegida, sin abrir nada más',
    segundos: 300,
    porQueAyuda:
      'Empezar cinco minutos rompe la inercia mejor que cualquier plan de una hora.',
    evidencia: 'Hoy empezaste, que es la parte que suele no pasar.',
    dificultad: 3,
  },

  // ── AUTOCUIDADO ───────────────────────────────────────────────────────
  {
    id: 'au-manana',
    capacidad: 'autocuidado',
    titulo: 'Deja lista una cosa para tu mañana',
    contexto: 'Al terminar de lavarte los dientes por la noche',
    segundos: 60,
    porQueAyuda:
      'Un minuto esta noche le quita diez de fricción a la mujer que serás mañana a las siete.',
    evidencia: 'Hoy le hiciste la mañana más fácil a la de mañana.',
    dificultad: 1,
  },
  {
    id: 'au-antes',
    capacidad: 'autocuidado',
    titulo: 'Haz algo tuyo antes de abrir el correo',
    contexto: 'Antes de mirar el trabajo por primera vez en el día',
    segundos: 180,
    porQueAyuda:
      'Si tu día empieza con lo que otros necesitan, el resto va detrás de eso hasta la noche.',
    evidencia: 'Hoy tu día no empezó con las necesidades de los demás.',
    dificultad: 3,
  },

  // ── LÍMITES ───────────────────────────────────────────────────────────
  {
    id: 'li-reviso',
    capacidad: 'limites',
    titulo: 'Responde «lo reviso y te confirmo»',
    contexto: 'Cuando llegue una petición inesperada',
    segundos: 30,
    porQueAyuda:
      'No es decir que no. Es no decir que sí en automático, que es donde se te va la semana.',
    evidencia: 'Hoy protegiste tu tiempo antes de comprometerlo.',
    dificultad: 3,
  },
  {
    id: 'li-hora',
    capacidad: 'limites',
    titulo: 'Ponle hora de cierre a tu día',
    contexto: 'Al empezar la tarde, antes de que se te haga de noche',
    segundos: 60,
    porQueAyuda:
      'Un día sin final decidido se estira hasta ocupar todo lo que le dejes.',
    evidencia: 'Hoy decidiste tú cuándo terminaba tu jornada.',
    dificultad: 4,
  },

  // ── RECUPERACIÓN ──────────────────────────────────────────────────────
  {
    id: 'rc-sinmanos',
    capacidad: 'recuperacion',
    titulo: 'Suelta el teléfono y mira alrededor',
    contexto: 'Cuando lleves un rato largo sin levantar la vista',
    segundos: 90,
    porQueAyuda:
      'Mirar lejos y sin pantalla es de las pocas cosas que descansan de verdad en noventa segundos.',
    evidencia: 'Hoy te diste noventa segundos sin nada que atender.',
    dificultad: 1,
  },
  {
    id: 'rc-hombros',
    capacidad: 'recuperacion',
    titulo: 'Ponte de pie y baja los hombros',
    contexto: 'Al cerrar la última reunión del día',
    segundos: 45,
    porQueAyuda:
      'El cuerpo se queda en la reunión aunque tú ya la hayas cerrado. Esto le avisa de que terminó.',
    evidencia: 'Hoy cerraste el día con el cuerpo, no solo con la agenda.',
    dificultad: 1,
  },
  {
    id: 'rc-transicion',
    capacidad: 'recuperacion',
    titulo: 'Marca el cambio entre trabajo y casa',
    contexto: 'Al cerrar la laptop, antes de entrar en la otra jornada',
    segundos: 120,
    porQueAyuda:
      'Sin un corte, la carga del trabajo entra entera en tu casa y se nota en cómo hablas.',
    evidencia: 'Hoy llegaste a tu casa habiendo cerrado la oficina.',
    dificultad: 3,
  },

  // ── AUTOCONFIANZA ─────────────────────────────────────────────────────
  {
    id: 'ac-dosminutos',
    capacidad: 'autoconfianza',
    titulo: 'Haz eso que llevas posponiendo y dura menos de dos minutos',
    contexto: 'Cuando notes que llevas días esquivando algo pequeño',
    segundos: 120,
    porQueAyuda:
      'Lo pequeño que pospones pesa más por lo que te dices sobre ti que por la tarea en sí.',
    evidencia: 'Hoy hiciste eso que llevabas días evitando.',
    dificultad: 3,
  },
  {
    id: 'ac-decide',
    capacidad: 'autoconfianza',
    titulo: 'Elige sin tener que justificarlo',
    contexto: 'Cuando estés dando vueltas a una decisión',
    segundos: 120,
    porQueAyuda:
      'Escribe las dos opciones y elige la que elegirías si no tuvieras que explicársela a nadie.',
    evidencia: 'Hoy decidiste sin esperar a estar segura del todo.',
    dificultad: 4,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // AMPLIACIÓN 2026-08-13 — microacciones LARGAS.
  // Motivo: la biblioteca solo tenía piezas de 30-120 s, así que ningún estado
  // llegaba a su tiempo (30 min prometidos, 4 entregados). Un ritual no se hace
  // largo apilando quince cosas de medio minuto: se hace con piezas que duran.
  // Mismo esquema y misma doctrina; el cue sigue siendo obligatorio.
  // ═══════════════════════════════════════════════════════════════════════

  {
    id: 'at-monotarea',
    capacidad: 'atencion',
    titulo: 'Una sola tarea, sin pestañas al lado',
    contexto: 'Cuando te sientes a lo que de verdad importa hoy',
    segundos: 300,
    porQueAyuda:
      'Cinco minutos con una sola cosa abierta rinden más que media hora saltando entre cuatro.',
    evidencia: 'Hoy sostuviste una sola cosa cinco minutos seguidos.',
    dificultad: 3,
  },
  {
    id: 'at-sin-pantalla',
    capacidad: 'atencion',
    titulo: 'Tres minutos sin ninguna pantalla',
    contexto: 'Al terminar una reunión o una llamada, antes de abrir nada',
    segundos: 180,
    porQueAyuda:
      'El descanso entre dos cosas es lo que hace que la segunda no herede el ruido de la primera.',
    evidencia: 'Hoy separaste dos cosas en vez de encadenarlas.',
    dificultad: 2,
  },
  {
    id: 're-cuerpo',
    capacidad: 'regulacion',
    titulo: 'Suelta la mandíbula, los hombros y las manos',
    contexto: 'Cuando notes que llevas rato tensa frente a la pantalla',
    segundos: 180,
    porQueAyuda:
      'El cuerpo sostiene la tensión aunque tú ya te hayas olvidado. Soltarlo a propósito la corta.',
    evidencia: 'Hoy bajaste la tensión del cuerpo antes de que te pasara factura.',
    dificultad: 2,
  },
  {
    id: 're-caminar',
    capacidad: 'regulacion',
    titulo: 'Camina cinco minutos sin destino',
    contexto: 'Cuando una conversación te haya dejado revuelta',
    segundos: 300,
    porQueAyuda:
      'Moverte cambia tu estado más rápido que intentar convencerte de que estás bien.',
    evidencia: 'Hoy cambiaste de estado en vez de quedarte dándole vueltas.',
    dificultad: 2,
  },
  {
    id: 'cl-semana',
    capacidad: 'claridad',
    titulo: 'Mira la semana y quita una cosa',
    contexto: 'Cuando la semana ya se vea imposible, no cuando ya lo sea',
    segundos: 300,
    porQueAyuda:
      'Quitar es una decisión. Si no quitas tú, lo acaba quitando el cansancio por ti.',
    evidencia: 'Hoy le quitaste algo a tu semana a propósito.',
    dificultad: 3,
  },
  {
    id: 'cl-tres',
    capacidad: 'claridad',
    titulo: 'Escribe las tres de mañana antes de cerrar',
    contexto: 'Al cerrar la laptop, antes de levantarte',
    segundos: 240,
    porQueAyuda:
      'Dejar mañana decidido hoy es lo que te permite soltar el trabajo cuando sales de él.',
    evidencia: 'Hoy cerraste el día con mañana ya decidido.',
    dificultad: 2,
  },
  {
    id: 'au-comer',
    capacidad: 'autocuidado',
    titulo: 'Come sin trabajar al mismo tiempo',
    contexto: 'En la primera comida que hagas frente a una pantalla',
    segundos: 600,
    porQueAyuda:
      'Comer trabajando le enseña a tu cuerpo que ni siquiera comer es un momento tuyo.',
    evidencia: 'Hoy comiste sin trabajar al mismo tiempo.',
    dificultad: 3,
  },
  {
    id: 'au-cita',
    capacidad: 'autocuidado',
    titulo: 'Ponte a ti en la agenda de mañana',
    contexto: 'Cuando estés mirando el calendario por cualquier otra cosa',
    segundos: 180,
    porQueAyuda:
      'Lo que no está en la agenda lo ocupa otro. Tu rato también necesita hora.',
    evidencia: 'Hoy te reservaste un hueco como a cualquier otra reunión.',
    dificultad: 2,
  },
  {
    id: 'li-revisar',
    capacidad: 'limites',
    titulo: 'Revisa lo que dijiste que sí y quita uno',
    contexto: 'Cuando notes que la semana no cabe',
    segundos: 300,
    porQueAyuda:
      'Un compromiso que ya no puedes sostener se cae solo. Es mejor que lo bajes tú y a tiempo.',
    evidencia: 'Hoy soltaste un compromiso antes de que se te cayera encima.',
    dificultad: 4,
  },
  {
    id: 'li-no',
    capacidad: 'limites',
    titulo: 'Escribe el no que llevas días posponiendo',
    contexto: 'Cuando te acuerdes por tercera vez de esa conversación pendiente',
    segundos: 240,
    porQueAyuda:
      'La conversación que evitas te cuesta más energía cada día que la aplazas que tenerla.',
    evidencia: 'Hoy dijiste que no a algo que no cabía.',
    dificultad: 5,
  },
  {
    id: 'rc-pantallas',
    capacidad: 'recuperacion',
    titulo: 'Deja el teléfono fuera del cuarto',
    contexto: 'Al empezar a prepararte para dormir',
    segundos: 300,
    porQueAyuda:
      'Si el teléfono está al lado, tu cabeza sigue de guardia aunque tú estés acostada.',
    evidencia: 'Hoy tu descanso no compitió con el teléfono.',
    dificultad: 3,
  },
  {
    id: 'rc-transicion',
    capacidad: 'recuperacion',
    titulo: 'Diez minutos de nada entre el trabajo y la casa',
    contexto: 'Justo al terminar la jornada, antes de entrar en la otra',
    segundos: 600,
    porQueAyuda:
      'Llegar a casa con el trabajo todavía encima es lo que te deja sin nada para los tuyos.',
    evidencia: 'Hoy llegaste a tu casa habiendo cerrado el trabajo.',
    dificultad: 3,
  },
  {
    id: 'ac-lista',
    capacidad: 'autoconfianza',
    titulo: 'Escribe tres cosas que sí sostuviste esta semana',
    contexto: 'Cuando te descubras pensando que no avanzaste en nada',
    segundos: 240,
    porQueAyuda:
      'Tu cabeza guarda lo que falta y borra lo que sostuviste. Escribirlo lo devuelve a su sitio.',
    evidencia: 'Hoy viste lo que sí sostuviste, no solo lo que falta.',
    dificultad: 2,
  },
  {
    id: 'ac-pedir',
    capacidad: 'autoconfianza',
    titulo: 'Pide ayuda en una sola cosa concreta',
    contexto: 'Cuando estés a punto de cargar tú con algo que no te toca sola',
    segundos: 300,
    porQueAyuda:
      'Pedir ayuda concreta se responde. Pedirla en general no, y por eso dejas de pedirla.',
    evidencia: 'Hoy pediste ayuda en vez de cargar con ello sola.',
    dificultad: 4,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// FRASES DE PRÁCTICA — hipótesis que la microacción pone a prueba
// Fórmula: situación + permiso + acción. Se PRUEBAN, no se repiten.
// ═══════════════════════════════════════════════════════════════════════════

export const FRASES: FraseDePractica[] = [
  { id: 'f-at-1', capacidad: 'atencion', fase: 1, texto: 'Puedo notar cuándo dejé de estar aquí.' },
  { id: 'f-at-2', capacidad: 'atencion', fase: 2, texto: 'Puedo terminar una cosa antes de empezar otra.' },
  { id: 'f-re-1', capacidad: 'regulacion', fase: 1, texto: 'Puedo notar la prisa sin obedecerla.' },
  { id: 'f-re-2', capacidad: 'regulacion', fase: 2, texto: 'Puedo esperar un momento antes de responder.' },
  { id: 'f-cl-1', capacidad: 'claridad', fase: 1, texto: 'No necesito resolverlo todo para recuperar claridad.' },
  { id: 'f-cl-2', capacidad: 'claridad', fase: 2, texto: 'Puedo elegir una sola cosa y que eso sea suficiente.' },
  { id: 'f-au-1', capacidad: 'autocuidado', fase: 2, texto: 'No necesito sentirme con energía para empezar a cuidarme.' },
  { id: 'f-au-3', capacidad: 'autocuidado', fase: 3, texto: 'Mi día no tiene que empezar con las necesidades de los demás.' },
  { id: 'f-li-2', capacidad: 'limites', fase: 2, texto: 'Puedo tomarme un momento antes de decir que sí.' },
  { id: 'f-li-4', capacidad: 'limites', fase: 4, texto: 'Puedo proteger mi energía aunque alguien se lleve una decepción.' },
  { id: 'f-rc-3', capacidad: 'recuperacion', fase: 3, texto: 'Puedo cambiar de ritmo sin abandonar mi cuidado.' },
  { id: 'f-rc-5', capacidad: 'recuperacion', fase: 5, texto: 'Sé cuándo necesito exigirme y cuándo necesito bajar el ritmo.' },
  { id: 'f-ac-2', capacidad: 'autoconfianza', fase: 2, texto: 'Puedo sentir incomodidad y aun así dar el siguiente paso.' },
  { id: 'f-ac-3', capacidad: 'autoconfianza', fase: 3, texto: 'Puedo decidir aunque todavía tenga dudas.' },
];

// ═══════════════════════════════════════════════════════════════════════════
// EL DIAL: cada duración tiene un PROPÓSITO distinto, no es solo menos tiempo
// ═══════════════════════════════════════════════════════════════════════════

export const PROPOSITO_DEL_DIAL: Record<
  EstadoId,
  { minutos: number; proposito: string; lectura: string; frase: string; arquitectura: ArquitecturaId }
> = {
  // Tiempos fijados por la dueña el 2026-08-13: 5 / 15 / 20. Son una DECISIÓN DE
  // PRODUCTO (con 1 minuto no se construye ningún hábito), no un número derivado del
  // contenido que hubiera ese día. El contenido se amplió para poder cumplirlos.
  reserva: {
    minutos: 5,
    proposito: 'sostener el día',
    lectura: 'Hoy llegas en reserva.',
    frase: 'Hoy toca cuidarte, no exigirte.',
    arquitectura: 'recuperacion',
  },
  media: {
    minutos: 15,
    proposito: 'entrenar',
    lectura: 'Hoy llegas a media.',
    frase: 'Hoy entrenamos una capacidad. Sin pasarnos.',
    arquitectura: 'enfoque',
  },
  energia: {
    minutos: 20,
    proposito: 'ir más hondo',
    lectura: 'Hoy llegas con energía.',
    frase: 'Hoy podemos ir un poco más hondo.',
    arquitectura: 'decision',
  },
};

/** Una experiencia completa: lo que ella recibe y hace hoy. */
export interface Experiencia {
  estado: EstadoId;
  /** Duración REAL, sumada de los pasos. Es la que se le anuncia. */
  minutos: number;
  /** Techo que el estado se permite pedirle (3/10/30). Nunca se muestra como duración. */
  tope: number;
  segundos: number;
  capacidad: CapacidadId;
  arquitectura: ArquitecturaId;
  pasos: Microaccion[];
  frase: FraseDePractica;
  /** Se muestra AL TERMINAR, no antes. Es el progreso real. */
  evidencia: string;
  /** UNA sola pregunta, y cambia según cómo le fue. */
  reflexion: string;
}

/**
 * Selección de la experiencia del día.
 *
 * Hoy es determinista por (estado × capacidad) — suficiente para que los tres
 * estados entreguen COSAS DISTINTAS, no el mismo ritual recortado, que era el
 * defecto #1 de las dos revisiones del onboarding.
 *
 * La capa adaptativa real (subir/bajar dificultad según lo que completa, archivar
 * lo dominado, rotar para evitar fatiga) se conecta cuando exista la base de datos:
 * el modelo de arriba ya tiene los campos que necesita (`dificultad`, `fase`,
 * `capacidad`). Ver docs/contenido-rituales.md → "El motor adaptativo".
 */
export function seleccionarExperiencia(
  estado: EstadoId,
  capacidadPreferida?: CapacidadId
): Experiencia {
  const cfg = PROPOSITO_DEL_DIAL[estado];

  // Con poca energía NO se entrena una capacidad exigente: se sostiene la continuidad.
  const capacidad: CapacidadId =
    capacidadPreferida ??
    (estado === 'reserva' ? 'recuperacion' : estado === 'media' ? 'claridad' : 'limites');

  const dePorCapacidad = (c: CapacidadId) => MICROACCIONES.filter((m) => m.capacidad === c);

  // LOS TRES ESTADOS SE LLENAN HASTA SU TIEMPO. Antes cada uno usaba una regla
  // distinta (reserva un paso suelto, media la lista de una capacidad) y ninguno
  // llegaba a lo prometido. Ahora todos parten de su capacidad y completan con apoyo
  // hasta el presupuesto, con un tope de pasos para que la sesión sea sostenible.
  const apoyo: CapacidadId[] = [
    'regulacion',
    'recuperacion',
    'claridad',
    'atencion',
    'autocuidado',
    'limites',
    'autoconfianza',
  ];
  const propias = dePorCapacidad(capacidad);
  const resto = apoyo.flatMap((c) => (c === capacidad ? [] : dePorCapacidad(c)));

  // En reserva se ordena de lo más barato a lo más caro (sostener la continuidad);
  // con energía, de lo más hondo a lo más ligero (profundizar).
  const orden =
    estado === 'energia'
      ? (a: Microaccion, b: Microaccion) => b.dificultad - a.dificultad || b.segundos - a.segundos
      : (a: Microaccion, b: Microaccion) => a.dificultad - b.dificultad || a.segundos - b.segundos;

  const candidatos = [...propias.sort(orden), ...resto.sort(orden)];
  const topeSegundos = cfg.minutos * 60;
  const TOPE_PASOS = estado === 'reserva' ? 4 : estado === 'media' ? 5 : 7;

  const pasos: Microaccion[] = [];
  let acumulado = 0;

  // 1) Relleno por prioridad: primero su capacidad, en el orden del estado. Un paso
  //    entra solo si CABE — pasarse de su tiempo es tan grave como quedarse corto,
  //    porque es tiempo suyo, no nuestro.
  for (const m of candidatos) {
    if (pasos.length >= TOPE_PASOS) break;
    if (acumulado + m.segundos > topeSegundos) continue;
    pasos.push(m);
    acumulado += m.segundos;
  }

  // 2) Ajuste fino: el ritual debe SUMAR EXACTAMENTE su tiempo. Sin esto entregaba
  //    4 y 19 donde promete 5 y 20 — honesto, pero un dial que dice 19 se lee como
  //    un número roto. Se completa el hueco con la pieza más grande que quepa.
  let hueco = topeSegundos - acumulado;
  while (hueco > 0) {
    const cabe = candidatos
      .filter((m) => !pasos.includes(m) && m.segundos <= hueco)
      .sort((a, b) => b.segundos - a.segundos)[0];
    if (!cabe) break;
    pasos.push(cabe);
    acumulado += cabe.segundos;
    hueco = topeSegundos - acumulado;
  }

  // 3) Si queda un hueco que ninguna pieza suelta puede rellenar (el más corto son
  //    30 s), se CAMBIA una pieza elegida por otra mayor que cierre la diferencia
  //    exacta. Es lo que hace que "5 min" sean cinco y no cuatro y tres cuartos.
  if (hueco > 0) {
    for (const dentro of [...pasos].reverse()) {
      const reemplazo = candidatos.find(
        (m) => !pasos.includes(m) && m.segundos - dentro.segundos === hueco
      );
      if (reemplazo) {
        pasos.splice(pasos.indexOf(dentro), 1, reemplazo);
        acumulado += hueco;
        break;
      }
    }
  }

  // Los minutos que se ANUNCIAN son los que el ritual dura DE VERDAD, sumados de sus
  // pasos. El número del estado (3/10/30) es el techo que NUA se permite pedirle, no
  // una promesa de duración: anunciar 30 y entregar 4 es mentirle sobre su tiempo.
  const segundosReales = pasos.reduce((t, p) => t + p.segundos, 0);
  // Se redondea A LA BAJA: anunciar 2 min para 90 s es exagerar en pequeño justo en
  // el arreglo que existía para dejar de exagerar.
  const minutosReales = Math.max(1, Math.floor(segundosReales / 60));

  const frase =
    FRASES.filter((f) => f.capacidad === capacidad).sort((a, b) => a.fase - b.fase)[0] ??
    FRASES[0]!;

  return {
    estado,
    minutos: minutosReales,
    /** El techo del estado, para no pasarse. No se le muestra como duración. */
    tope: cfg.minutos,
    segundos: segundosReales,
    capacidad,
    arquitectura: cfg.arquitectura,
    pasos,
    frase,
    evidencia: pasos[0]?.evidencia ?? '',
    reflexion:
      estado === 'reserva'
        ? '¿Qué cambió, aunque fuera un poco?'
        : estado === 'media'
          ? '¿Qué empieza a costarte menos que antes?'
          : '¿Qué hiciste hoy distinto a como lo habrías hecho hace un mes?',
  };
}

/** Reflexión cuando NO completó. Nunca se pregunta "¿por qué no lo hiciste?". */
export const REFLEXION_SI_NO_PUDO = '¿Qué habría hecho esto más fácil hoy?';

/**
 * FILTRO DE CONTENIDO NUA. Ninguna frase del producto puede contener esto.
 * Se usa como test en CI y como recordatorio para quien escriba contenido nuevo.
 */
export const PROHIBIDO: string[] = [
  'tú puedes con todo',
  'eres imparable',
  'hoy será increíble',
  'sal de tu zona de confort',
  'tu mejor versión',
  'no te rindas',
  'piensa positivo',
  'échale ganas',
  'disciplina',
  'soy poderosa',
  'merezco todo lo bueno',
];
