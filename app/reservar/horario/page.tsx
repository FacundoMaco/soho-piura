import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";
import HorarioSelector from "./HorarioSelector";

type PageProps = {
  searchParams: Promise<{ sede_id?: string; servicio_id?: string; estilista_id?: string }>;
};

export default async function HorarioPage({ searchParams }: PageProps) {
  const { sede_id, servicio_id, estilista_id } = await searchParams;

  if (!sede_id || !servicio_id) notFound();

  const [sedeRes, servicioRes, estilistasRes] = await Promise.all([
    supabase.from("sedes").select("nombre").eq("id", sede_id).single(),
    supabase.from("servicios").select("nombre").eq("id", servicio_id).single(),
    supabase.from("estilistas").select("id, nombre").eq("sede_id", sede_id).order("nombre"),
  ]);

  if (sedeRes.error || !sedeRes.data) notFound();
  if (servicioRes.error || !servicioRes.data) notFound();

  const estilistas = estilistasRes.data ?? [];

  if (!estilista_id) {
    return (
      <main className="min-h-screen px-4 py-16 sm:px-8" style={{ background: "var(--bg)" }}>
        <div className="mx-auto max-w-lg">
          <header className="mb-12">
            <Link
              href={`/reservar/servicio?sede_id=${sede_id}`}
              className="text-xs tracking-wide uppercase transition-colors"
              style={{ color: "var(--text-secondary)" }}
            >
              ← Volver
            </Link>
            <p className="text-3xl font-black tracking-tight uppercase mt-8 mb-1" style={{ color: "var(--text)" }}>
              SOHO<span style={{ color: "var(--primary)" }}>●</span>.color
            </p>
            <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "var(--primary)" }}>
              {sedeRes.data.nombre}
            </p>
            <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--text)" }}>
              {servicioRes.data.nombre}
            </h1>
            <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              Selecciona tu estilista
            </p>
          </header>

          {estilistas.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              No hay estilistas disponibles en esta sede.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {estilistas.map((e) => (
                <Link
                  key={e.id}
                  href={`/reservar/horario?sede_id=${sede_id}&servicio_id=${servicio_id}&estilista_id=${e.id}`}
                  className="flex items-center justify-between rounded-xl px-6 py-5 transition-all"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--primary)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(232,25,44,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  }}
                >
                  <span className="text-sm font-medium" style={{ color: "var(--text)" }}>
                    {e.nombre}
                  </span>
                  <svg className="h-4 w-4" style={{ color: "var(--text-secondary)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    );
  }

  const estilistaSeleccionado = estilistas.find((e) => e.id === estilista_id);
  if (!estilistaSeleccionado) notFound();

  return (
    <main className="min-h-screen px-4 py-16 sm:px-8" style={{ background: "var(--bg)" }}>
      <div className="mx-auto max-w-lg">
        <header className="mb-12">
          <Link
            href={`/reservar/horario?sede_id=${sede_id}&servicio_id=${servicio_id}`}
            className="text-xs tracking-wide uppercase transition-colors"
            style={{ color: "var(--text-secondary)" }}
          >
            ← Volver
          </Link>
          <p className="text-3xl font-black tracking-tight uppercase mt-8 mb-1" style={{ color: "var(--text)" }}>
            SOHO<span style={{ color: "var(--primary)" }}>●</span>.color
          </p>
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "var(--primary)" }}>
            {sedeRes.data.nombre}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--text)" }}>
            {servicioRes.data.nombre}
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            Con <span className="font-medium" style={{ color: "var(--text)" }}>{estilistaSeleccionado.nombre}</span> — elige fecha y hora
          </p>
        </header>

        <HorarioSelector
          sede_id={sede_id}
          servicio_id={servicio_id}
          estilistas={[estilistaSeleccionado]}
          estilista_nombre={estilistaSeleccionado.nombre}
        />
      </div>
    </main>
  );
}
