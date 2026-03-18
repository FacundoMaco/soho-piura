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
      <main className="min-h-screen flex items-center justify-center px-4 bg-[#f5f5f5]">
        <p className="text-sm text-red-500">Error al cargar las sedes. Intenta más tarde.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f5f5] px-4 py-16 sm:px-8">
      <div className="mx-auto max-w-lg">
        <header className="mb-12 text-center">
          <p className="text-3xl font-black tracking-tight uppercase mb-6 text-[#0a0a0a]">
            SOHO<span className="text-[#E8192C]">●</span>.color
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-[#0a0a0a]">
            Reserva tu cita
          </h1>
          <p className="mt-2 text-sm text-[#666666]">
            Elige la sede donde quieres atenderte
          </p>
        </header>

        {!sedes || sedes.length === 0 ? (
          <p className="text-center text-sm text-[#666666]">No hay sedes disponibles.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {(sedes as Sede[]).map((sede) => (
              <li key={sede.id}>
                <Link
                  href={`/reservar/servicio?sede_id=${sede.id}`}
                  className="group flex flex-col gap-1 rounded-xl bg-white border border-[#e0e0e0] px-6 py-5 transition-all hover:border-[#E8192C] hover:shadow-sm"
                >
                  <span className="font-semibold text-base text-[#0a0a0a] transition-colors group-hover:text-[#E8192C]">
                    {sede.nombre}
                  </span>
                  <span className="text-xs text-[#666666]">
                    {formatHora(sede.horario_apertura)} — {formatHora(sede.horario_cierre)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <footer className="mt-16 text-center">
          <Link href="/staff" className="text-xs text-[#888888] hover:text-[#666666] transition-colors">
            Staff
          </Link>
        </footer>
      </div>
    </main>
  );
}
