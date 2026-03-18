import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Sede = {
  id: string;
  nombre: string;
  horario_apertura: string;
  horario_cierre: string;
};

function formatHora(hora: string): string {
  const [h, m] = hora.split(":");
  const date = new Date();
  date.setHours(Number(h), Number(m));
  return date.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", hour12: true });
}

export default async function HomePage() {
  const { data: sedes, error } = await supabase
    .from("sedes")
    .select("id, nombre, horario_apertura, horario_cierre")
    .order("nombre");

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg)" }}>
        <p className="text-sm text-red-500">Error al cargar las sedes. Intenta más tarde.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-16 sm:px-8" style={{ background: "var(--bg)" }}>
      <div className="mx-auto max-w-lg">
        <header className="mb-12 text-center">
          <p className="text-3xl font-black tracking-tight uppercase mb-6" style={{ color: "var(--text)" }}>
            SOHO<span style={{ color: "var(--primary)" }}>●</span>.color
          </p>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--text)" }}>
            Reserva tu cita
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            Elige la sede donde quieres atenderte
          </p>
        </header>

        {!sedes || sedes.length === 0 ? (
          <p className="text-center text-sm" style={{ color: "var(--text-secondary)" }}>
            No hay sedes disponibles.
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {(sedes as Sede[]).map((sede) => (
              <li key={sede.id}>
                <Link
                  href={`/reservar/servicio?sede_id=${sede.id}`}
                  className="group flex flex-col gap-1 rounded-xl px-6 py-5 transition-all"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--primary)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(232,25,44,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  }}
                >
                  <span className="font-semibold text-base transition-colors group-hover:text-[#E8192C]" style={{ color: "var(--text)" }}>
                    {sede.nombre}
                  </span>
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    {formatHora(sede.horario_apertura)} — {formatHora(sede.horario_cierre)}
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
