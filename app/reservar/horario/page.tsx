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
      <main className="min-h-screen bg-white px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-lg">
          <header className="mb-12">
            <Link
              href={`/reservar/servicio?sede_id=${sede_id}`}
              className="text-xs text-zinc-400 hover:text-[#C9A84C] transition-colors tracking-wide uppercase"
            >
              Volver
            </Link>
            <p className="text-xs tracking-widest uppercase text-[#C9A84C] mt-6 mb-1">
              {sedeRes.data.nombre}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">{servicioRes.data.nombre}</h1>
            <p className="mt-2 text-sm text-zinc-500">Selecciona tu estilista</p>
          </header>

          {estilistas.length === 0 ? (
            <p className="text-sm text-zinc-400">No hay estilistas disponibles en esta sede.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {estilistas.map((e) => (
                <Link
                  key={e.id}
                  href={`/reservar/horario?sede_id=${sede_id}&servicio_id=${servicio_id}&estilista_id=${e.id}`}
                  className="flex items-center justify-between rounded-xl border border-zinc-200 px-6 py-5 transition-all hover:border-[#C9A84C] hover:shadow-sm"
                >
                  <span className="text-sm font-medium text-zinc-800">{e.nombre}</span>
                  <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
    <main className="min-h-screen bg-white px-4 py-16 sm:px-8">
      <div className="mx-auto max-w-lg">
        <header className="mb-12">
          <Link
            href={`/reservar/horario?sede_id=${sede_id}&servicio_id=${servicio_id}`}
            className="text-xs text-zinc-400 hover:text-[#C9A84C] transition-colors tracking-wide uppercase"
          >
            Volver
          </Link>
          <p className="text-xs tracking-widest uppercase text-[#C9A84C] mt-6 mb-1">
            {sedeRes.data.nombre}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">{servicioRes.data.nombre}</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Con <span className="font-medium text-zinc-700">{estilistaSeleccionado.nombre}</span> — elige fecha y hora
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
