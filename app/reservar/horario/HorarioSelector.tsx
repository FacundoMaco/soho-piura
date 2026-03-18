"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Estilista = {
  id: string;
  nombre: string;
};

type Slot = {
  inicio: string;
  fin: string;
  estilista_id: string;
};

type Props = {
  sede_id: string;
  servicio_id: string;
  estilistas: Estilista[];
  estilista_nombre: string;
};

function todayString(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatSlotHora(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", hour12: true });
}

export default function HorarioSelector({ sede_id, servicio_id, estilistas, estilista_nombre }: Props) {
  const router = useRouter();
  const [fecha, setFecha] = useState(todayString());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fecha) return;

    setLoading(true);
    setError(null);
    setSlots([]);

    const fetches = estilistas.map((e) =>
      fetch(
        `/api/disponibilidad?estilista_id=${e.id}&servicio_id=${servicio_id}&sede_id=${sede_id}&fecha=${fecha}`
      )
        .then((r) => r.json())
        .then((data: { slots?: { inicio: string; fin: string }[] }) =>
          (data.slots ?? []).map((s) => ({ ...s, estilista_id: e.id }))
        )
        .catch(() => [] as Slot[])
    );

    Promise.all(fetches).then((results) => {
      const seen = new Set<string>();
      const merged: Slot[] = [];

      for (const list of results) {
        for (const slot of list) {
          if (!seen.has(slot.inicio)) {
            seen.add(slot.inicio);
            merged.push(slot);
          }
        }
      }

      merged.sort((a, b) => a.inicio.localeCompare(b.inicio));
      setSlots(merged);
      setLoading(false);
    });
  }, [fecha, sede_id, servicio_id, estilistas]);

  function handleSlotClick(slot: Slot) {
    const params = new URLSearchParams({
      sede_id,
      servicio_id,
      estilista_id: slot.estilista_id,
      estilista_nombre,
      fecha_inicio: slot.inicio,
      fecha_fin: slot.fin,
    });
    router.push(`/reservar/confirmacion?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide" htmlFor="fecha">
          Fecha
        </label>
        <input
          id="fecha"
          type="date"
          value={fecha}
          min={todayString()}
          onChange={(e) => setFecha(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 px-4 py-3 text-sm focus:border-[#C9A84C] focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
        />
      </div>

      <div>
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-4">
          Horarios disponibles
        </p>

        {loading && (
          <p className="text-sm text-zinc-400">Buscando horarios disponibles...</p>
        )}

        {!loading && error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        {!loading && !error && slots.length === 0 && (
          <p className="text-sm text-zinc-400">
            No hay horarios disponibles para esta fecha. Prueba con otro día.
          </p>
        )}

        {!loading && slots.length > 0 && (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {slots.map((slot) => (
              <button
                key={slot.inicio}
                onClick={() => handleSlotClick(slot)}
                className="rounded-lg border border-zinc-200 px-3 py-3 text-sm font-medium text-zinc-700 transition-all hover:border-[#C9A84C] hover:text-[#C9A84C] hover:shadow-sm active:scale-95"
              >
                {formatSlotHora(slot.inicio)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
