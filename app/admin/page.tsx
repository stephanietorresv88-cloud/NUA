// PANEL DE ADMINISTRACIÓN — solo la dueña de NUA (verificado en app/admin/layout.tsx).
// Etapa "antes de tráfico" de 21-BACKOFFICE.md: el panel de Conversión es lo que
// importa hoy (no hay Hotmart ni visitas reales todavía). Ventas/Usuarias/Salud/Uso
// SÍ se muestran, pero cada card dice la verdad: real, o "sin datos todavía" — nunca
// un número inventado (Regla de honestidad de CLAUDE.md, ya aprendida dos veces en
// este proyecto: la landing y el paywall tuvieron cifras de dinero falsas).
//
// Negocio (LTV/CAC/payback/MRR/canal) — 2026-08-18, a pedido de la dueña: se dejan
// PREPARADOS pero vacíos ("sin datos todavía"), listos para llenarse solos en cuanto
// exista Hotmart. NO se agregó "Costo de IA": NUA no usa IA en ninguna parte de la
// app (confirmado en la auditoría), así que esa sección no aplicaría ni siquiera
// como placeholder — se deja fuera hasta que el producto de verdad use IA.

import {
  Activity,
  AlertTriangle,
  DollarSign,
  HeartPulse,
  LogOut as IconAbandono,
  MessageSquare,
  Radar,
  TrendingUp,
  Users,
} from 'lucide-react';
import { crearClienteServidor } from '@/lib/supabase/server';
import { alternarAdmin } from './acciones';
import { FormularioAccesoManual } from './acceso-manual';
import {
  GraficoAbandono,
  GraficoDistribucionNiveles,
  GraficoEmbudo,
  GraficoEvolucionCSAT,
  InfoTooltip,
  NumeroContado,
  Tendencia,
} from './ui';

export const dynamic = 'force-dynamic'; // datos del dueño, nunca cacheados entre visitas

const PASOS_FUNNEL = [
  { tipo: 'landing_vista', etiqueta: 'Vieron la página de inicio' },
  { tipo: 'onboarding_iniciado', etiqueta: 'Empezaron el cuestionario' },
  { tipo: 'resultado_visto', etiqueta: 'Vieron su ritual armado' },
  { tipo: 'paywall_visto', etiqueta: 'Vieron el precio' },
  { tipo: 'checkout_iniciado', etiqueta: 'Fueron a pagar' },
] as const;

const VENTANA_MS = 48 * 60 * 60 * 1000;
const TOTAL_PASOS_ONBOARDING = 7;

interface FilaEvento {
  type: string;
  created_at: string;
}

interface FilaEventoConMeta {
  type: string;
  metadata: Record<string, unknown> | null;
}

function contarPorTipo(filas: FilaEvento[]): Record<string, number> {
  const conteo: Record<string, number> = {};
  for (const f of filas) conteo[f.type] = (conteo[f.type] ?? 0) + 1;
  return conteo;
}

function TituloSeccion({ icono: Icono, children }: { icono: typeof Users; children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-[length:var(--txt-subtitle)] font-semibold [font-family:var(--font-display)]">
      <Icono size={18} strokeWidth={2} color="var(--accent)" aria-hidden="true" />
      {children}
    </h2>
  );
}

function TarjetaSinDatos({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-dashed border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)] bg-[var(--surface)] px-4 py-6 text-center text-[length:var(--txt-body)] leading-snug text-[var(--text-secondary)]">
      {children}
    </div>
  );
}

export default async function AdminPanel() {
  const supabase = await crearClienteServidor();
  const {
    data: { user: yo },
  } = await supabase.auth.getUser();
  const ahora = Date.now();
  const inicioActual = new Date(ahora - VENTANA_MS).toISOString();
  const inicioAnterior = new Date(ahora - VENTANA_MS * 2).toISOString();

  const [
    { count: totalUsuarias },
    { count: totalRituales },
    { count: totalErrores },
    { data: erroresRecientes },
    { data: eventosVentana },
    { count: totalAppAbierta },
    { count: totalAha },
  ] = await Promise.all([
    supabase.from('perfiles').select('*', { count: 'exact', head: true }),
    supabase.from('sesiones_rutina').select('*', { count: 'exact', head: true }),
    supabase.from('error_log').select('*', { count: 'exact', head: true }),
    supabase
      .from('error_log')
      .select('message, context, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('event_log')
      .select('type, created_at')
      .eq('is_qa', false)
      .gte('created_at', inicioAnterior),
    supabase.from('event_log').select('*', { count: 'exact', head: true }).eq('type', 'app_abierta'),
    supabase.from('event_log').select('*', { count: 'exact', head: true }).eq('type', 'aha_alcanzado'),
  ]);

  const { data: listaUsuarias } = await supabase
    .from('perfiles')
    .select('id, email, role, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  // ABANDONO — todo el tiempo (no solo 48h): el volumen todavía es mínimo, una
  // ventana corta se quedaría sin nada que mostrar casi siempre.
  const { data: eventosOnboarding } = await supabase
    .from('event_log')
    .select('type, metadata')
    .eq('is_qa', false)
    .in('type', ['onboarding_iniciado', 'onboarding_completado', 'onboarding_paso_completado']);

  const filasOnboarding = (eventosOnboarding ?? []) as FilaEventoConMeta[];
  const totalOnboardingIniciado = filasOnboarding.filter((f) => f.type === 'onboarding_iniciado').length;
  const totalOnboardingCompletado = filasOnboarding.filter((f) => f.type === 'onboarding_completado').length;
  const conteoPorPaso: Record<number, number> = {};
  for (const f of filasOnboarding) {
    if (f.type !== 'onboarding_paso_completado') continue;
    const paso = Number(f.metadata?.paso);
    if (Number.isFinite(paso)) conteoPorPaso[paso] = (conteoPorPaso[paso] ?? 0) + 1;
  }
  const abandonoPct =
    totalOnboardingIniciado > 0
      ? Math.round(((totalOnboardingIniciado - totalOnboardingCompletado) / totalOnboardingIniciado) * 100)
      : null;
  const datosAbandonoPorPaso = Array.from({ length: TOTAL_PASOS_ONBOARDING }, (_, i) => ({
    paso: i + 1,
    valor: conteoPorPaso[i + 1] ?? 0,
  }));

  // OPINIONES — incluye lo que llega por la tarjeta de Ajustes Y por la
  // encuesta emergente (misma tabla `feedback`, dos mecanismos de captura).
  const [{ count: totalOpiniones }, { data: opinionesRecientes }, { data: todasCalificaciones }] =
    await Promise.all([
      supabase.from('feedback').select('*', { count: 'exact', head: true }),
      supabase
        .from('feedback')
        .select('calificacion, comentario, created_at')
        .order('created_at', { ascending: false })
        .limit(10),
      supabase.from('feedback').select('calificacion, created_at'),
    ]);
  const calificacionPromedio =
    todasCalificaciones && todasCalificaciones.length > 0
      ? todasCalificaciones.reduce((suma, f) => suma + f.calificacion, 0) / todasCalificaciones.length
      : null;

  // Distribución por nivel (1-5) — cuántas opiniones cayeron en cada cara.
  const distribucionPorNivel = [1, 2, 3, 4, 5].map((nivel) => ({
    nivel,
    cantidad: (todasCalificaciones ?? []).filter((f) => f.calificacion === nivel).length,
  }));

  // Evolución mensual: promedio y cantidad por mes, últimos 6 meses con datos.
  const FORMATO_MES = new Intl.DateTimeFormat('es', { month: 'short', year: '2-digit' });
  const porMes = new Map<string, { suma: number; cantidad: number; fecha: Date }>();
  for (const f of todasCalificaciones ?? []) {
    const fecha = new Date(f.created_at);
    const clave = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
    const entrada = porMes.get(clave) ?? { suma: 0, cantidad: 0, fecha: new Date(fecha.getFullYear(), fecha.getMonth(), 1) };
    entrada.suma += f.calificacion;
    entrada.cantidad += 1;
    porMes.set(clave, entrada);
  }
  const evolucionMensual = Array.from(porMes.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([, v]) => ({ etiqueta: FORMATO_MES.format(v.fecha), promedio: v.suma / v.cantidad, cantidad: v.cantidad }));

  const filas = (eventosVentana ?? []) as FilaEvento[];
  const actuales = filas.filter((f) => f.created_at >= inicioActual);
  const anteriores = filas.filter((f) => f.created_at < inicioActual);
  const conteoActual = contarPorTipo(actuales);
  const conteoAnterior = contarPorTipo(anteriores);
  const sinDatosDeConversion = filas.length === 0;
  const datosEmbudo = PASOS_FUNNEL.map((p) => ({ etiqueta: p.etiqueta, valor: conteoActual[p.tipo] ?? 0 }));

  const activacionPct =
    totalAppAbierta && totalAppAbierta > 0 ? Math.round(((totalAha ?? 0) / totalAppAbierta) * 100) : null;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-5 pb-16 pt-8">
      <header>
        <p className="text-[length:var(--txt-label)] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
          Solo para ti
        </p>
        <h1 className="mt-1 text-[length:var(--txt-title)] leading-tight [font-family:var(--font-display)]">
          Panel de NUA
        </h1>
      </header>

      {/* AVISOS — el panel empuja lo importante, no obliga a leer tablas (21). */}
      {totalErrores && totalErrores > 0 ? (
        <div className="flex items-start gap-2 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--error)_35%,transparent)] bg-[color-mix(in_oklab,var(--error)_8%,var(--surface))] px-4 py-3 text-[length:var(--txt-body)] leading-snug">
          <AlertTriangle size={18} strokeWidth={2} color="var(--error)" className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>
            Hay {totalErrores} {totalErrores === 1 ? 'error registrado' : 'errores registrados'} en la app.
            Revisa la sección «Salud» más abajo.
          </span>
        </div>
      ) : (
        <div className="rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] px-4 py-3 text-[length:var(--txt-body)] leading-snug text-[var(--text-secondary)]">
          ✅ Todo en orden — sin errores registrados. Los avisos de dinero (IA cara, cobros fallando,
          canal que pierde) se activan solos en cuanto exista tu cuenta de Hotmart.
        </div>
      )}

      {/* CONVERSIÓN — lo que importa ANTES de tener ventas (21: nivel "antes de tráfico"). */}
      <section className="flex flex-col gap-3">
        <TituloSeccion icono={TrendingUp}>Conversión (últimas 48 horas)</TituloSeccion>
        {sinDatosDeConversion ? (
          <TarjetaSinDatos>
            Sin visitas todavía. En cuanto alguien entre a la página, aquí vas a ver exactamente hasta
            dónde llega cada persona.
          </TarjetaSinDatos>
        ) : (
          <>
            <div className="rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] px-2 py-3">
              <GraficoEmbudo pasos={datosEmbudo} />
            </div>
            <ul className="flex flex-col gap-2">
              {PASOS_FUNNEL.map((paso) => {
                const actual = conteoActual[paso.tipo] ?? 0;
                const anterior = conteoAnterior[paso.tipo] ?? 0;
                return (
                  <li
                    key={paso.tipo}
                    className="flex items-center justify-between gap-3 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] px-4 py-3"
                  >
                    <span className="text-[length:var(--txt-body)]">{paso.etiqueta}</span>
                    <span className="flex items-baseline gap-2">
                      <span className="text-[length:var(--txt-subtitle)] font-bold tabular-nums [font-family:var(--font-display)]">
                        <NumeroContado valor={actual} />
                      </span>
                      <Tendencia actual={actual} anterior={anterior} />
                      <span className="text-[length:var(--txt-label)] tabular-nums text-[var(--text-tertiary)]">
                        (48h antes: {anterior})
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </>
        )}
        <p className="text-[length:var(--txt-label)] text-[var(--text-tertiary)]">
          «Fueron a pagar» → «Confirmaron la prueba gratis» → «Primer cobro» se activan en cuanto
          conectes tu cuenta de Hotmart (esos tres pasos vienen del webhook, no se pueden medir antes).
        </p>
      </section>

      {/* ABANDONO — cuántas personas empiezan el cuestionario y no terminan, y en qué
          paso exacto se caen. Es lo más parecido a "quién abandona la app" que se
          puede medir HOY sin Hotmart (las cancelaciones de pago necesitan el
          webhook, que todavía no existe) — sección propia, no escondida dentro de
          Conversión (la dueña no la encontraba ahí, 2026-08-18). */}
      <section className="flex flex-col gap-3">
        <TituloSeccion icono={IconAbandono}>Abandono</TituloSeccion>
        <div className="rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] px-4 py-4">
          {abandonoPct === null ? (
            <p className="text-[length:var(--txt-body)] text-[var(--text-secondary)]">
              Sin datos todavía. En cuanto alguien empiece el cuestionario, aquí verás qué porcentaje
              no lo termina y en qué paso se cae.
            </p>
          ) : (
            <>
              <p className="text-[length:var(--txt-title)] font-bold tabular-nums [font-family:var(--font-display)]">
                <NumeroContado valor={abandonoPct} sufijo="%" />
              </p>
              <p className="text-[length:var(--txt-label)] text-[var(--text-secondary)]">
                de {totalOnboardingIniciado} personas que empezaron el cuestionario,{' '}
                {totalOnboardingCompletado} lo terminaron
              </p>
              {Object.keys(conteoPorPaso).length > 0 ? (
                <div className="mt-3">
                  <GraficoAbandono pasos={datosAbandonoPorPaso} />
                </div>
              ) : (
                <p className="mt-2 text-[length:var(--txt-label)] text-[var(--text-tertiary)]">
                  Nadie completó ni el primer paso todavía — por eso el gráfico por paso no aparece.
                </p>
              )}
            </>
          )}
        </div>
      </section>

      {/* VENTAS — honesto: no hay Hotmart todavía, así que no hay nada que mostrar. */}
      <section className="flex flex-col gap-3">
        <TituloSeccion icono={DollarSign}>Ventas</TituloSeccion>
        <TarjetaSinDatos>
          Sin datos todavía. Esto se llena solo en cuanto tengas tu cuenta de Hotmart conectada y
          llegue tu primera venta.
        </TarjetaSinDatos>
      </section>

      {/* NEGOCIO — LTV/CAC/payback/MRR: preparado pero vacío a propósito (pedido de
          la dueña, 2026-08-18). Todos dependen de ingresos reales de Hotmart —
          mostrar un número aquí hoy sería inventarlo, y esta app ya aprendió esa
          lección dos veces (landing y paywall). Los InfoTooltip explican cada
          término para cuando SÍ haya datos. */}
      <section className="flex flex-col gap-3">
        <TituloSeccion icono={Radar}>Negocio</TituloSeccion>
        <TarjetaSinDatos>
          <div className="flex flex-col items-center gap-3">
            <p>
              Sin datos todavía — estas métricas se calculan con tus ventas reales de Hotmart, que
              todavía no existen.
            </p>
            <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-left text-[length:var(--txt-label)]">
              <li className="flex items-center gap-1">
                LTV <InfoTooltip texto="Lo que en promedio te deja UNA clienta durante toda su vida como suscriptora. Más alto es mejor." />
              </li>
              <li className="flex items-center gap-1">
                CAC <InfoTooltip texto="Lo que te cuesta conseguir UNA clienta nueva (publicidad, comisión de afiliados). Más bajo es mejor." />
              </li>
              <li className="flex items-center gap-1">
                LTV:CAC <InfoTooltip texto="Cuánto recuperas por cada dólar que gastas en conseguir clientas. 3:1 o más es sano; menos de 1:1 significa que pierdes dinero por clienta." />
              </li>
              <li className="flex items-center gap-1">
                Payback <InfoTooltip texto="Cuántos meses tardas en recuperar lo que gastaste en conseguir una clienta. Menos de 6 meses es ideal." />
              </li>
              <li className="flex items-center gap-1">
                MRR <InfoTooltip texto="Tus ingresos mensuales recurrentes: lo que factura la app cada mes, sumando todas las suscripciones activas." />
              </li>
            </ul>
          </div>
        </TarjetaSinDatos>
      </section>

      {/* USUARIAS — esto SÍ es real: cuenta filas de verdad en tu base de datos. */}
      <section className="flex flex-col gap-3">
        <TituloSeccion icono={Users}>Usuarias</TituloSeccion>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] px-4 py-4">
            <p className="text-[length:var(--txt-title)] font-bold tabular-nums [font-family:var(--font-display)]">
              <NumeroContado valor={totalUsuarias ?? 0} />
            </p>
            <p className="text-[length:var(--txt-label)] text-[var(--text-secondary)]">
              con cuenta creada
            </p>
          </div>
          <div className="rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] px-4 py-4">
            <p className="text-[length:var(--txt-title)] font-bold tabular-nums [font-family:var(--font-display)]">
              <NumeroContado valor={totalRituales ?? 0} />
            </p>
            <p className="text-[length:var(--txt-label)] text-[var(--text-secondary)]">
              rituales completados y guardados
            </p>
          </div>
        </div>

        {/* LISTA + hacer/quitar administradora — primero, porque es lo que más se
            consulta día a día (quién está registrada). Nunca sobre uno mismo
            (protección contra quedarse sin acceso por error). Rediseño
            2026-08-18 a pedido de la dueña: antes el formulario de "agregar
            acceso manual" iba ANTES de la lista y competía por atención con la
            acción más común; ahora la lista va primero y el rescate de acceso
            queda abajo, como lo que es — una herramienta de soporte, no la
            acción principal de esta sección. */}
        {listaUsuarias && listaUsuarias.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-[length:var(--txt-label)] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
              Todas las cuentas
            </p>
            <ul className="flex flex-col gap-2">
              {listaUsuarias.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between gap-3 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[length:var(--txt-body)] font-medium">
                      {u.email ?? '(sin correo)'}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className="rounded-full px-2 py-0.5 text-[length:var(--txt-label)] font-semibold"
                        style={
                          u.role === 'admin'
                            ? { background: 'color-mix(in oklab, var(--accent) 16%, transparent)', color: 'var(--accent)' }
                            : { background: 'var(--surface-2)', color: 'var(--text-tertiary)' }
                        }
                      >
                        {u.role === 'admin' ? 'Administradora' : 'Usuaria'}
                      </span>
                      <span className="text-[length:var(--txt-label)] text-[var(--text-tertiary)]">
                        {new Intl.DateTimeFormat('es', { dateStyle: 'medium' }).format(new Date(u.created_at))}
                      </span>
                    </div>
                  </div>
                  {u.id === yo?.id ? (
                    <span className="shrink-0 text-[length:var(--txt-label)] text-[var(--text-tertiary)]">
                      (tú)
                    </span>
                  ) : (
                    <form action={alternarAdmin}>
                      <input type="hidden" name="id" value={u.id} />
                      <input type="hidden" name="rolActual" value={u.role} />
                      <button
                        type="submit"
                        className="shrink-0 rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_45%,transparent)] px-3 py-2 text-[length:var(--txt-label)] font-semibold text-[var(--text-secondary)] [touch-action:manipulation]"
                      >
                        {u.role === 'admin' ? 'Quitar admin' : 'Hacer admin'}
                      </button>
                    </form>
                  )}
                </li>
              ))}
            </ul>
            {listaUsuarias.length === 1 && (
              <p className="text-[length:var(--txt-label)] text-[var(--text-tertiary)]">
                Aquí van a aparecer tus clientas en cuanto se registren.
              </p>
            )}
          </div>
        )}

        {/* RESCATE DE ACCESO — para quien compró y no le llegó, o su cuenta no se
            creó sola (18-VENTA-HOTMART: "compré y no me llega", el ticket #1 de
            este modelo). Necesita la clave maestra de Supabase; si falta, el
            propio formulario lo explica en vez de fallar en silencio. Va AL
            FINAL de la sección — es soporte ocasional, no la acción principal. */}
        <FormularioAccesoManual />
      </section>

      {/* USO — activación real (aha_alcanzado / app_abierta), sin ventana de tiempo
          porque el volumen todavía es mínimo — se agrega D1/D7/D30 cuando haya datos. */}
      <section className="flex flex-col gap-3">
        <TituloSeccion icono={Activity}>Uso</TituloSeccion>
        <div className="rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] px-4 py-4">
          {activacionPct === null ? (
            <p className="text-[length:var(--txt-body)] text-[var(--text-secondary)]">
              Sin visitas todavía — la activación (cuántas personas viven su primera victoria) se
              calcula en cuanto haya alguna.
            </p>
          ) : (
            <>
              <p className="flex items-center gap-1.5 text-[length:var(--txt-title)] font-bold tabular-nums [font-family:var(--font-display)]">
                <NumeroContado valor={activacionPct} sufijo="%" />
                <InfoTooltip texto="De cada 100 personas que abren NUA, cuántas terminan viviendo su primera victoria (su primer ritual completo)." />
              </p>
              <p className="text-[length:var(--txt-label)] text-[var(--text-secondary)]">
                de quienes abrieron la app vivieron su primera victoria (desde que existe este
                registro, {totalAha ?? 0} de {totalAppAbierta ?? 0})
              </p>
            </>
          )}
        </div>
      </section>

      {/* SALUD — errores reales del error_log. */}
      <section className="flex flex-col gap-3">
        <TituloSeccion icono={HeartPulse}>Salud</TituloSeccion>
        {!erroresRecientes || erroresRecientes.length === 0 ? (
          <TarjetaSinDatos>Sin errores registrados.</TarjetaSinDatos>
        ) : (
          <ul className="flex flex-col gap-2">
            {erroresRecientes.map((e, i) => (
              <li
                key={i}
                className="rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--error)_25%,transparent)] bg-[var(--surface)] px-4 py-3"
              >
                <p className="text-[length:var(--txt-body)] font-medium">{e.message}</p>
                <p className="mt-1 text-[length:var(--txt-label)] text-[var(--text-tertiary)]">
                  {e.context ?? 'sin contexto'} ·{' '}
                  {new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short' }).format(
                    new Date(e.created_at),
                  )}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* OPINIONES — lo que las usuarias dicen directamente, con o sin cuenta. */}
      <section className="flex flex-col gap-3">
        <TituloSeccion icono={MessageSquare}>Opiniones</TituloSeccion>
        {!totalOpiniones || totalOpiniones === 0 ? (
          <TarjetaSinDatos>
            Sin opiniones todavía. Aparecen aquí en cuanto alguien conteste en Ajustes o en la encuesta emergente.
          </TarjetaSinDatos>
        ) : (
          <>
            <div className="rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] px-4 py-4">
              <p className="text-[length:var(--txt-title)] font-bold tabular-nums [font-family:var(--font-display)]">
                {calificacionPromedio?.toFixed(1)} / 5
              </p>
              <p className="text-[length:var(--txt-label)] text-[var(--text-secondary)]">
                promedio de {totalOpiniones} {totalOpiniones === 1 ? 'opinión' : 'opiniones'}
              </p>
            </div>

            {evolucionMensual.length > 1 && (
              <div className="rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] px-4 pb-2 pt-4">
                <p className="mb-1 text-[length:var(--txt-label)] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                  Evolución mensual
                </p>
                <GraficoEvolucionCSAT meses={evolucionMensual} />
              </div>
            )}

            <div className="rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] px-4 pb-2 pt-4">
              <p className="mb-1 text-[length:var(--txt-label)] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                Respuestas por nivel
              </p>
              <GraficoDistribucionNiveles niveles={distribucionPorNivel} />
            </div>

            <ul className="flex flex-col gap-2">
              {(opinionesRecientes ?? []).map((o, i) => (
                <li
                  key={i}
                  className="rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[length:var(--txt-body)] font-semibold tabular-nums">
                      {o.calificacion} / 5
                    </span>
                    <span className="text-[length:var(--txt-label)] text-[var(--text-tertiary)]">
                      {new Intl.DateTimeFormat('es', { dateStyle: 'medium' }).format(new Date(o.created_at))}
                    </span>
                  </div>
                  {o.comentario && (
                    <p className="mt-1 text-[length:var(--txt-body)] leading-snug text-[var(--text-secondary)]">
                      «{o.comentario}»
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}
