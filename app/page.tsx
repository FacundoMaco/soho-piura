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
      <main className="min-h-screen flex items-center justify-center px-4">
        <p className="text-sm text-red-500">Error al cargar las sedes. Intenta más tarde.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 py-16 sm:px-8">
      <div className="mx-auto max-w-lg">
        <header className="mb-12 text-center">
          <p className="text-xs tracking-widest uppercase text-[#C9A84C] mb-3">Soho Color</p>
          <h1 className="text-3xl font-semibold tracking-tight">Reserva tu cita</h1>
          <p className="mt-3 text-sm text-zinc-500">Elige la sede donde quieres atenderte</p>
        </header>

        {!sedes || sedes.length === 0 ? (
          <p className="text-center text-sm text-zinc-400">No hay sedes disponibles.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {(sedes as Sede[]).map((sede) => (
              <li key={sede.id}>
                <Link
                  href={`/reservar/servicio?sede_id=${sede.id}`}
                  className="group flex flex-col gap-1 rounded-xl border border-zinc-200 px-6 py-5 transition-all hover:border-[#C9A84C] hover:shadow-sm"
                >
                  <span className="font-semibold text-base group-hover:text-[#C9A84C] transition-colors">
                    {sede.nombre}
                  </span>
                  <span className="text-xs text-zinc-400">
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
