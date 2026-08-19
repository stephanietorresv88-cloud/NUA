'use client';

// LANDING DE NUA — las 10 secciones canónicas de 19 en su orden exacto,
// construidas desde el KIT (components/landing/). TODO el copy sale de
// docs/copy/landing.md y traza a FICHA-AVATAR.md.
//
// AÑADIDO al kit: <DialInteractivo /> entre §4 y §5 (justificado en ESTADO.md).
// 'use client' porque la página pasa íconos de Lucide como props.

import { useEffect } from 'react';
import { BatteryLow, BrainCircuit, Clock8, Trash2 } from 'lucide-react';
import { track } from '@/lib/analytics';
import { Hero } from '@/components/landing/Hero';
import { Problema } from '@/components/landing/Problema';
import { Agitacion } from '@/components/landing/Agitacion';
import { Solucion } from '@/components/landing/Solucion';
import { DialCard } from '@/components/landing/DialInteractivo';
import { AppPorDentro } from '@/components/landing/AppPorDentro';
import { Oferta } from '@/components/landing/Oferta';
import { Garantia } from '@/components/landing/Garantia';
import { Faq } from '@/components/landing/Faq';
import { CtaFinal } from '@/components/landing/CtaFinal';
import { FooterLegal } from '@/components/landing/FooterLegal';
import { StickyCtaMobile } from '@/components/landing/ui';

// Modelo 2 de 02C (onboarding-first anónimo): la landing vende EMPEZAR, no pagar.
// El checkout aparece después del onboarding. Mismo href en todos los CTAs.
const CTA_HREF = '/onboarding';
const CTA_LABEL = 'Armar mi ritual de hoy';

export default function LandingNua() {
  // landing_vista: se emite solo cuando el componente realmente MONTA y corre JS
  // (36/60) — un prefetch o un bot que no ejecuta React no llega a disparar esto.
  useEffect(() => {
    void track('landing_vista', {});
  }, []);

  return (
    <div className="min-h-dvh bg-[var(--bg)] text-[var(--text-primary)] [font-family:var(--font-body)]">
      {/* ═══ 1. HERO ═══ */}
      <Hero
        appName="NUA"
        loginHref="/entrar"
        /* 2026-08-18, crítica de expertos #10: el titular vendía un beneficio
           genérico ("cuídate hoy") sin nombrar el MECANISMO — lo único que
           ninguna competidora puede firmar sin rehacer su producto. Se
           conserva "cinco minutos" (objeción #1 del avatar) pero el sujeto
           de la frase pasa a ser el Dial de Energía. */
        h1Marked="El [acento]Dial de Energía[/acento] arma tu ritual en cinco minutos"
        subtitleMarked="Nunca exige lo mismo el día bueno que el [b]día que pesa el doble[/b]"
        ctaLabel={CTA_LABEL}
        ctaHref={CTA_HREF}
        socialProof={<span>Empieza sin tarjeta · 30 días con la Garantía del Día Difícil</span>}
        /* El dial REAL sustituye al placeholder: la visitante toca el mecanismo
           en la primera pantalla (defecto #2 del revisor). */
        visual={<DialCard />}
      />

      {/* ═══ 2. PROBLEMA ═══ */}
      <Problema
        titulo="¿Te suena?"
        preguntas={[
          { icon: BrainCircuit, textoMarked: '¿Te despiertas con la cabeza saturada [b]antes[/b] de empezar el día?' },
          { icon: Clock8, textoMarked: '¿Trabajas doce horas y sientes que no avanzaste en lo importante?' },
          { icon: Trash2, textoMarked: '¿Borraste otra app de hábitos que te exigía demasiado?' },
          { icon: BatteryLow, textoMarked: '¿Llegas a casa con la energía en ceros para los tuyos?' },
        ]}
      />

      {/* ═══ 3. AGITACIÓN ═══ */}
      {/* 2026-08-18, auditoría de escaneabilidad: 4 frases seguidas sin eyebrow
          ni titular se leían como un párrafo sin ancla — ninguna otra sección
          de la landing carecía de un titular que "cargar" en el escaneo de
          solo-titulares. Sumados eyebrow + h2 (mismo patrón que el resto). */}
      <Agitacion
        eyebrow="SI NADA CAMBIA"
        tituloMarked="Esto es lo que te está costando [acento]seguir igual[/acento]"
        frases={[
          'No es que te falte fuerza de voluntad. [acento]Tu rutina no está diseñada para los días reales[/acento].',
          'Cada semana [b]decides y vuelves a decidir[/b] qué hacer contigo misma — y nunca llegas.',
          'Pasan los meses y [b]sigues cargando la culpa[/b] de ser la última de tu propia lista.',
          'No eres tú. [b]Es la rigidez[/b].',
        ]}
        contraste={{
          labelHoy: 'Hoy',
          hoy: 'Otra app borrada y la sensación de que fallaste tú.',
          labelFuturo: 'En un año, si nada cambia',
          /* Se quitó "— con un año menos": tono de miedo/mortalidad que no es la
             voz de NUA ("te entiendo y tengo una alternativa", no "perderás tu
             vida si no compras") — pedido explícito de la dueña, 2026-08-17.
             2026-08-18, auditoría de escaneabilidad: la sección prometía
             cuantificar el costo (titular "esto es lo que te está costando")
             pero ninguna frase tenía un número — el dato SÍ existe y está
             documentado en FICHA-AVATAR.md línea 33-34 ("~20 horas/mes, 10 días
             completos al año"), simplemente no se estaba usando. Se suma aquí,
             sin tono de mortalidad (es tiempo que se va en decidir, no "vida
             que se acaba" — la frase de arriba sigue prohibida). */
          futuro: 'El mismo martes que pesa el doble. Son 10 días del año que se van en decidir, no en vivir.',
        }}
      />

      {/* ═══ 4. SOLUCIÓN — el mecanismo bautizado ═══ */}
      <Solucion
        tituloMarked="[acento]Ajustado[/acento] a la energía con la que llegas"
        mecanismo="el Dial de Energía"
        bigIdeaMarked="Las apps rígidas te piden lo mismo el día bueno y [b]el día que pesa el doble[/b]. NUA no."
        pasos={[
          { titulo: 'Marcas tu energía', detalle: 'Mueves el dial según lo que puedas hoy. Un toque.' },
          { titulo: 'NUA ajusta el ritual', detalle: 'Elige duración y pasos según cómo llegaste hoy.' },
          { titulo: 'Lo haces y cuenta', detalle: 'Cinco minutos también cuentan. Tu continuidad no se rompe.' },
        ]}
        antesDespues={{
          labelAntes: 'Antes',
          antes: '«Hoy tampoco pude.»',
          labelDespues: 'Con NUA',
          despues: '«Hoy hice lo que necesitaba.»',
        }}
      />

      {/* ═══ 5. LA APP POR DENTRO — 3 frames, los 3 con captura real (2026-08-17):
              el revisor marcó los 2 marcos vacíos como el defecto más caro (justo
              antes del precio). Ritmo = /hoy real; Diario = /dev/pantalla-archivo
              (mismo markup del Archivo real, con datos semilla — el Archivo de
              verdad vive tras el login por correo y no se puede fotografiar sin
              una sesión real, igual que el dial). ═══ */}
      <AppPorDentro
        id="app-dentro"
        tituloMarked="NUA por dentro, [acento]sin sorpresas[/acento]"
        frames={[
          {
            /* Captura REAL de /dev/pantalla-dial — no es un mockup: es la pantalla
               que ya funciona. El revisor marcó los 3 marcos vacíos como el defecto
               más caro (justo antes del precio). Este es el primero y va con foto. */
            src: '/pantallas/dial.png',
            alt: 'Pantalla de NUA con el dial de energía marcando «a media» y el ritual de 10 minutos',
            label: 'Tu ritual de hoy, según cómo llegues',
          },
          {
            src: '/pantallas/ritmo.png',
            alt: 'Pantalla Hoy de NUA mostrando el saludo, el dial y el ritual del día, con el archivo reciente debajo',
            label: 'Tu continuidad, intacta',
          },
          {
            src: '/pantallas/diario.png',
            alt: 'Pantalla Archivo de NUA con varias rutinas completadas y la frase que se lleva de cada una',
            label: 'Tu diario de una frase',
          },
        ]}
        /* Mismo verbo que el CTA héroe (regla de 19 §5), pero no el texto
           literal: 4 CTAs idénticos seguidos leían mecánico (revisor, ronda 6). */
        ctaLabel="Armar el mío"
        ctaHref={CTA_HREF}
      />

      {/* ═══ 6. OFERTA — el TOTAL anual es el número grande (desvío justificado
              en ESTADO.md: el miedo #1 del avatar es el cobro sorpresa) ═══ */}
      {/* trialDias va SIN definir a propósito: FICHA-MERCADO §4 marca la prueba de
          Hotmart como NO VERIFICADA en el panel y posiblemente condicionada a
          tarjeta. Prometer "7 días gratis" sin comprobarlo es exactamente lo que
          enfurece a este avatar. Se activa cuando exista la cuenta y se verifique.
          ⚠️ El titular SÍ decía "Empieza gratis. Decides cuando ya la usaste" (auditoría
          2026-08-17): en esta sección de la LANDING todavía no hizo el onboarding, así
          que "cuando ya la usaste" era falso para quien lo lee aquí (sí es cierto en el
          paywall, que llega DESPUÉS del ritual — ese título vive aparte, en
          app/paywall/page.tsx). Lo único gratis y cierto en este punto es el onboarding
          mismo: sin tarjeta, con un ritual real antes de pedir nada. */}
      {/* 2026-08-18, crítica de expertos #1: "gratis" en esta sección (aunque
          técnicamente cierto sobre el onboarding) se lee justo arriba de un
          cobro real de USD 39,99 — para un avatar cuyo miedo #1 documentado es
          exactamente que le mientan con el cobro, eso es un riesgo real que no
          vale la pena correr. El ancla "sin tarjeta" YA vive en el hero
          (socialProof); aquí se vende lo que SÍ es cierto en esta sección: el
          precio nunca queda escondido. */}
      <Oferta
        tituloMarked="Elige tu plan. [acento]Sin sorpresas en el cobro[/acento]"
        anual={{
          nombre: 'Anual',
          /* Era "MÁS ELEGIDO" — prueba social inventada sin una sola clienta.
             Y después "AHORRAS 2 MESES", que era falso: 5,99 × 12 = 71,88 frente
             a 39,99 son 31,89 de ahorro (44%), no dos meses. Un número inventado
             sobre dinero, en la página cuya promesa es que aquí nadie te sorprende
             con un cobro, es el peor error posible. */
          badge: 'AHORRAS 44%',
          precioMes: 'USD 39,99',
          sufijo: '/año',
          descomposicionDia: 'Equivale a USD 3,33 al mes',
          totalAnual: 'Un solo cobro al año · cancelas cuando quieras',
          /* El ahorro se dice UNA vez. Antes aparecía en el badge, aquí y en las
             features: tres veces la misma frase resta credibilidad. */
          ahorro: 'Te ahorras USD 31,89 frente a pagar mes a mes',
          ctaLabel: 'Empezar con el plan anual',
          ctaHref: `${CTA_HREF}?plan=anual`,
          features: [
            'Todo lo del plan mensual',
            'Un solo cobro al año, sin recordatorios',
            'Tu precio queda congelado 12 meses',
          ],
        }}
        mensual={{
          nombre: 'Mensual',
          precioMes: 'USD 5,99',
          ctaLabel: 'Empezar con el plan mensual',
          ctaHref: `${CTA_HREF}?plan=mensual`,
          features: [
            'Tu ritual ajustado a tu energía, cada día',
            'El día difícil no rompe tu continuidad',
            'Tu diario de una frase, privado',
            'Cancelas cuando quieras desde Hotmart',
          ],
        }}
      />

      {/* ═══ 7. GARANTÍA ═══ */}
      <Garantia
        nombre="la Garantía del Día Difícil"
        /* "un día más liviano" era subjetivo (¿qué significa exactamente?).
           Ahora la promesa es concreta: encontrar UN momento para ti — algo que
           se puede verificar con un sí o un no (pedido de la dueña, 2026-08-17).
           2026-08-18, crítica de expertos #2: landing y paywall prometían DOS
           mecanismos distintos para el mismo reembolso ("escribe un correo" vs.
           "desde tu área de compras de Hotmart") — inconsistencia real que un
           avatar cuyo miedo #1 es que le mientan con el cobro puede notar.
           Unificado con el texto del paywall (el mecanismo real: Hotmart
           procesa la devolución, /reembolsos ya lo documenta como la vía). */
        condicionMarked="Si en 30 días NUA no te ayudó a encontrar ni un momento para ti, lo pides desde tu área de compras de Hotmart. [b]Sin explicaciones[/b]."
        pisoLegal="Respaldada por la garantía de Hotmart"
      />

      {/* ═══ 8. FAQ — las objeciones de FICHA-AVATAR.md ═══ */}
      <Faq
        items={[
          {
            pregunta: '¿Y si un día no tengo tiempo para nada?',
            respuestaMarked:
              'Marcas que hoy necesitas algo fácil y NUA te deja [b]un ritual de cinco minutos[/b]. Ese día cuenta igual que los demás.',
          },
          {
            pregunta: 'Ya probé apps de hábitos y las abandoné.',
            /* Respuesta central de la página: convierte la objeción #1 en el
               argumento de venta (por qué NUA es distinta, no "prueba otra vez").
               Los minutos son los REALES de la app (5/15/20 — no 3/10/30). */
            respuestaMarked:
              'Precisamente por eso existe NUA. Las apps tradicionales te piden lo mismo todos los días. NUA [b]cambia lo que te pide según cómo llegas[/b]: hoy 20 minutos, mañana cinco. Los dos cuentan.',
          },
          {
            pregunta: '¿Me van a cobrar sin avisar?',
            /* Sin prueba gratis no hay "primer cobro" escondido: se cobra al comprar
               y ya. Decir "te avisamos antes" describía un mundo con trial que no
               está confirmado (FICHA-MERCADO §4), y cancelar ocurre en Hotmart, no
               en el perfil de NUA — todavía no existe ese botón. */
            respuestaMarked:
              'No. El precio está siempre a la vista [b]antes[/b] de pagar, no hay cobros escondidos, y cancelas cuando quieras desde tu área de compras de Hotmart.',
          },
          {
            pregunta: '¿Cuánto tardo en ver algo?',
            respuestaMarked:
              'No hay que esperar semanas: tu primer ritual [b]se adapta a cómo llegas hoy[/b] y lo haces ahora mismo, sin registrarte. La meta no es que hagas más, es que encuentres algo que puedas sostener.',
          },
          {
            pregunta: '¿Es seguro pagar aquí?',
            respuestaMarked:
              'El cobro lo procesa Hotmart, no NUA: [b]nunca vemos tu tarjeta[/b]. En México puedes pagar en OXXO y en Colombia por PSE.',
          },
          {
            pregunta: '¿Esto reemplaza a un profesional?',
            respuestaMarked:
              'No. NUA es autocuidado diario, [b]no atención médica ni psicológica[/b]. Si estás pasando algo serio, busca ayuda profesional.',
          },
        ]}
      />

      {/* ═══ 9. CTA FINAL ═══ */}
      <CtaFinal
        h2Marked="«Hoy tampoco» → [acento]«Hoy hice lo que necesitaba»[/acento]"
        futurePacingMarked="Mañana abres NUA, marcas cómo llegas, y en cinco minutos ya hiciste algo por ti. Aunque el día venga torcido."
        ctaLabel={CTA_LABEL}
        ctaHref={CTA_HREF}
        recap="Empieza sin tarjeta · 30 días con la Garantía del Día Difícil"
        /* Los minutos se alinean con lo que la app entrega de verdad (5/15/20,
           decididos por la dueña el 2026-08-13). Decían 3/10/30. */
        psMarked="PS: NUA no te pide ser más constante. Ajusta tu ritual a la energía con la que llegas — 5, 15 o 20 minutos — para que el día difícil también cuente."
      />

      {/* ═══ 10. FOOTER LEGAL ═══ */}
      <FooterLegal
        appName="NUA"
        soporteEmail="nua.soporte@outlook.es"
        enlaces={[
          { label: 'Privacidad', href: '/privacidad' },
          { label: 'Términos y Condiciones', href: '/terminos' },
          { label: 'Reembolsos', href: '/reembolsos' },
          { label: 'Aviso de IA', href: '/aviso-ia' },
        ]}
      />

      <StickyCtaMobile labelComercial={CTA_LABEL} href={CTA_HREF} />
    </div>
  );
}
