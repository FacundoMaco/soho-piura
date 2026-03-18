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
    <main className="min-h-screen bg-[#f5f5f5] px-4 py-16 sm:px-8">
      <div className="mx-auto max-w-lg">
        <header className="mb-12">
          <Link
            href="/"
            className="text-xs tracking-wide uppercase text-[#666666] hover:text-[#E8192C] transition-colors"
          >
            ← Volver
          </Link>
          <p className="text-3xl font-black tracking-tight uppercase mt-8 mb-1 text-[#0a0a0a]">
            SOHO<span className="text-[#E8192C]">●</span>.color
          </p>
          <p className="text-xs uppercase tracking-widest mb-4 text-[#E8192C]">
            {sedeRes.data.nombre}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-[#0a0a0a]">
            Elige un servicio
          </h1>
        </header>

        {servicios.length === 0 ? (
          <p className="text-center text-sm text-[#666666]">No hay servicios disponibles.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {servicios.map((servicio) => (
              <li key={servicio.id}>
                <Link
                  href={`/reservar/horario?sede_id=${sede_id}&servicio_id=${servicio.id}`}
                  className="group flex items-center justify-between rounded-xl bg-white border border-[#e0e0e0] px-6 py-5 transition-all hover:border-[#E8192C] hover:shadow-sm"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-base text-[#0a0a0a] transition-colors group-hover:text-[#E8192C]">
                      {servicio.nombre}
                    </span>
                    <span className="text-xs text-[#666666]">{servicio.duracion_minutos} min</span>
                  </div>
                  <span className="text-sm font-medium text-[#0a0a0a]">
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
