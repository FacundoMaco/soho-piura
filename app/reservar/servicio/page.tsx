import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";

type Servicio = {
  id: string;
  nombre: string;
  duracion_minutos: number;
  precio: number;
};

type PageProps = {
  searchParams: Promise<{ sede_id?: string }>;
};

export default async function ServicioPage({ searchParams }: PageProps) {
  const { sede_id } = await searchParams;

  if (!sede_id) notFound();

  const [serviciosRes, sedeRes] = await Promise.all([
    supabase.from("servicios").select("id, nombre, duracion_minutos, precio").order("nombre"),
    supabase.from("sedes").select("nombre").eq("id", sede_id).single(),
  ]);

  if (sedeRes.error || !sedeRes.data) notFound();

  const servicios = (serviciosRes.data ?? []) as Servicio[];

  return (
    <main className="min-h-screen px-4 py-16 sm:px-8" style={{ background: "var(--bg)" }}>
      <div className="mx-auto max-w-lg">
        <header className="mb-12">
          <Link
            href="/"
            className="text-xs tracking-wide uppercase transition-colors"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--primary)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-secondary)")}
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
            Elige un servicio
          </h1>
        </header>

        {servicios.length === 0 ? (
          <p className="text-center text-sm" style={{ color: "var(--text-secondary)" }}>
            No hay servicios disponibles.
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {servicios.map((servicio) => (
              <li key={servicio.id}>
                <Link
                  href={`/reservar/horario?sede_id=${sede_id}&servicio_id=${servicio.id}`}
                  className="group flex items-center justify-between rounded-xl px-6 py-5 transition-all"
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
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-base transition-colors group-hover:text-[#E8192C]" style={{ color: "var(--text)" }}>
                      {servicio.nombre}
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      {servicio.duracion_minutos} min
                    </span>
                  </div>
                  <span className="text-sm font-medium" style={{ color: "var(--text)" }}>
                    S/ {servicio.precio.toLocaleString("es-PE")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
