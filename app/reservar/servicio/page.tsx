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
    <main className="min-h-screen bg-white px-4 py-16 sm:px-8">
      <div className="mx-auto max-w-lg">
        <header className="mb-12">
          <Link
            href="/"
            className="text-xs text-zinc-400 hover:text-[#C9A84C] transition-colors tracking-wide uppercase"
          >
            Volver
          </Link>
          <p className="text-xs tracking-widest uppercase text-[#C9A84C] mt-6 mb-3">
            {sedeRes.data.nombre}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Elige un servicio</h1>
        </header>

        {servicios.length === 0 ? (
          <p className="text-center text-sm text-zinc-400">No hay servicios disponibles.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {servicios.map((servicio) => (
              <li key={servicio.id}>
                <Link
                  href={`/reservar/horario?sede_id=${sede_id}&servicio_id=${servicio.id}`}
                  className="group flex items-center justify-between rounded-xl border border-zinc-200 px-6 py-5 transition-all hover:border-[#C9A84C] hover:shadow-sm"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-base group-hover:text-[#C9A84C] transition-colors">
                      {servicio.nombre}
                    </span>
                    <span className="text-xs text-zinc-400">{servicio.duracion_minutos} min</span>
                  </div>
                  <span className="text-sm font-medium text-zinc-700">
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
