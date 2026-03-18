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
      <main className="min-h-screen bg-[#f5f5f5] px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-lg">
          <header className="mb-12">
            <Link
              href={`/reservar/servicio?sede_id=${sede_id}`}
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
              {servicioRes.data.nombre}
            </h1>
            <p className="mt-2 text-sm text-[#666666]">Selecciona tu estilista</p>
          </header>

          {estilistas.length === 0 ? (
            <p className="text-sm text-[#666666]">No hay estilistas disponibles en esta sede.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {estilistas.map((e) => (
                <Link
                  key={e.id}
                  href={`/reservar/horario?sede_id=${sede_id}&servicio_id=${servicio_id}&estilista_id=${e.id}`}
                  className="group flex items-center justify-between rounded-xl bg-white border border-[#e0e0e0] px-6 py-5 transition-all hover:border-[#E8192C] hover:shadow-sm"
                >
                  <span className="text-sm font-medium text-[#0a0a0a] transition-colors group-hover:text-[#E8192C]">
                    {e.nombre}
                  </span>
                  <svg
                    className="h-4 w-4 text-[#666666]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
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
    <main className="min-h-screen bg-[#f5f5f5] px-4 py-16 sm:px-8">
      <div className="mx-auto max-w-lg">
        <header className="mb-12">
          <Link
            href={`/reservar/horario?sede_id=${sede_id}&servicio_id=${servicio_id}`}
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
            {servicioRes.data.nombre}
          </h1>
          <p className="mt-2 text-sm text-[#666666]">
            Con <span className="font-medium text-[#0a0a0a]">{estilistaSeleccionado.nombre}</span> — elige fecha y hora
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
