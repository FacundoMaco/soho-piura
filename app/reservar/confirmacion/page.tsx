"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Link from "next/link";

type FormState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success" }
  | { status: "conflict" }
  | { status: "error"; message: string };

function formatFechaHora(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function ConfirmacionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sede_id = searchParams.get("sede_id") ?? "";
  const servicio_id = searchParams.get("servicio_id") ?? "";
  const estilista_id = searchParams.get("estilista_id") ?? "";
  const estilista_nombre = searchParams.get("estilista_nombre") ?? "";
  const fecha_inicio = searchParams.get("fecha_inicio") ?? "";
  const fecha_fin = searchParams.get("fecha_fin") ?? "";

  const [nombre, setNombre] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [state, setState] = useState<FormState>({ status: "idle" });

  if (!sede_id || !servicio_id || !estilista_id || !fecha_inicio || !fecha_fin) {
    return (
      <p className="text-sm text-red-500">
        Faltan datos para confirmar la reserva.{" "}
        <Link href="/" className="underline">
          Volver al inicio
        </Link>
      </p>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState({ status: "loading" });

    try {
      const res = await fetch("/api/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente_nombre: nombre.trim(),
          cliente_whatsapp: whatsapp.trim(),
          sede_id,
          estilista_id,
          servicio_id,
          fecha_inicio,
          fecha_fin,
        }),
      });

      if (res.status === 409) {
        setState({ status: "conflict" });
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setState({ status: "error", message: data.error ?? "Error al confirmar la reserva." });
        return;
      }

      setState({ status: "success" });
    } catch {
      setState({ status: "error", message: "No se pudo conectar. Intenta de nuevo." });
    }
  }

  if (state.status === "success") {
    return (
      <div className="flex flex-col gap-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#C9A84C]">
          <svg
            className="h-7 w-7 text-[#C9A84C]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Reserva confirmada</h2>
          <p className="mt-2 text-sm text-zinc-500">
            Te esperamos el{" "}
            <span className="font-medium text-black">{formatFechaHora(fecha_inicio)}</span>.
          </p>
        </div>
        <p className="text-sm text-zinc-500">
          ¿Necesitas cambiar tu cita? Llámanos o escríbenos al WhatsApp del salón.
        </p>
        <Link
          href="/"
          className="mx-auto text-xs text-zinc-400 hover:text-[#C9A84C] transition-colors underline underline-offset-4"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  const horarioVolver = `/reservar/horario?sede_id=${sede_id}&servicio_id=${servicio_id}`;

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-xl border border-zinc-100 bg-zinc-50 px-6 py-5 flex flex-col gap-2">
        <p className="text-xs uppercase tracking-widest text-zinc-400 mb-1">Resumen</p>
        {estilista_nombre && (
          <p className="text-sm text-zinc-700">
            <span className="font-medium">Estilista:</span> {estilista_nombre}
          </p>
        )}
        <p className="text-sm text-zinc-700">
          <span className="font-medium">Fecha y hora:</span>{" "}
          {formatFechaHora(fecha_inicio)}
        </p>
      </div>

      {state.status === "conflict" && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-600">
            Este horario ya no está disponible.{" "}
            <Link href={horarioVolver} className="font-medium underline">
              Vuelve a elegir
            </Link>
            .
          </p>
        </div>
      )}

      {state.status === "error" && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-600">{state.message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide" htmlFor="nombre">
            Nombre completo
          </label>
          <input
            id="nombre"
            type="text"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu nombre"
            className="w-full rounded-lg border border-zinc-200 px-4 py-3 text-sm focus:border-[#C9A84C] focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide" htmlFor="whatsapp">
            Numero WhatsApp
          </label>
          <input
            id="whatsapp"
            type="tel"
            required
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="987 654 321"
            className="w-full rounded-lg border border-zinc-200 px-4 py-3 text-sm focus:border-[#C9A84C] focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
          />
        </div>

        <button
          type="submit"
          disabled={state.status === "loading"}
          className="mt-2 w-full rounded-full bg-black py-4 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {state.status === "loading" ? "Confirmando..." : "Confirmar reserva"}
        </button>
      </form>
    </div>
  );
}

export default function ConfirmacionPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-16 sm:px-8">
      <div className="mx-auto max-w-lg">
        <header className="mb-12">
          <p className="text-xs tracking-widest uppercase text-[#C9A84C] mb-3">Soho Color</p>
          <h1 className="text-3xl font-semibold tracking-tight">Confirma tu reserva</h1>
          <p className="mt-2 text-sm text-zinc-500">Ingresa tus datos para finalizar</p>
        </header>

        <Suspense fallback={<p className="text-sm text-zinc-400">Cargando...</p>}>
          <ConfirmacionForm />
        </Suspense>
      </div>
    </main>
  );
}
