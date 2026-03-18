'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

type Sede = {
  id: string
  nombre: string
  horario_apertura: string
  horario_cierre: string
}

type Estilista = {
  id: string
  nombre: string
}

type Reserva = {
  id: string
  cliente_nombre: string
  fecha_inicio: string
  fecha_fin: string
  estado: 'pendiente' | 'confirmada' | 'cancelada'
  estilista_id: string
  estilistas: { nombre: string }
  servicios: { nombre: string; duracion_minutos: number }
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function generateSlots(apertura: string, cierre: string): string[] {
  const start = timeToMinutes(apertura)
  const end = timeToMinutes(cierre)
  const slots: string[] = []
  for (let m = start; m < end; m += 30) {
    const h = Math.floor(m / 60).toString().padStart(2, '0')
    const min = (m % 60).toString().padStart(2, '0')
    slots.push(`${h}:${min}`)
  }
  return slots
}

function reservaCoversSlot(reserva: Reserva, slot: string, fecha: string): boolean {
  const slotDt = new Date(`${fecha}T${slot}:00`)
  const rInicio = new Date(reserva.fecha_inicio)
  const rFin = new Date(reserva.fecha_fin)
  return rInicio <= slotDt && slotDt < rFin
}

function isSlotStart(reserva: Reserva, slot: string, fecha: string): boolean {
  const slotDt = new Date(`${fecha}T${slot}:00`)
  const rInicio = new Date(reserva.fecha_inicio)
  const diff = Math.abs(slotDt.getTime() - rInicio.getTime())
  return diff < 60 * 1000
}

function reservaSpanSlots(reserva: Reserva): number {
  const rInicio = new Date(reserva.fecha_inicio)
  const rFin = new Date(reserva.fecha_fin)
  const diffMs = rFin.getTime() - rInicio.getTime()
  return Math.ceil(diffMs / (30 * 60 * 1000))
}

function cellStyle(estado: Reserva['estado']): React.CSSProperties {
  if (estado === 'pendiente') return { background: '#fff8e1', border: '1px solid #ffe082', color: '#7c5e00' }
  if (estado === 'confirmada') return { background: '#e8f5e9', border: '1px solid #a5d6a7', color: '#1b5e20' }
  return { background: '#f5f5f5', border: '1px solid #e0e0e0', color: '#666666' }
}

const SLOT_HEIGHT_PX = 48

export default function AgendaPage() {
  const router = useRouter()
  const today = new Date().toISOString().slice(0, 10)

  const [fecha, setFecha] = useState(today)
  const [sedes, setSedes] = useState<Sede[]>([])
  const [sedeId, setSedeId] = useState<string>('')
  const [sede, setSede] = useState<Sede | null>(null)
  const [estilistas, setEstilistas] = useState<Estilista[]>([])
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [loading, setLoading] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  async function handleSignOut() {
    const browserClient = createSupabaseBrowserClient()
    await browserClient.auth.signOut()
    router.push('/staff')
  }

  useEffect(() => {
    supabase
      .from('sedes')
      .select('id, nombre, horario_apertura, horario_cierre')
      .order('nombre')
      .then(({ data }) => {
        if (data && data.length > 0) {
          setSedes(data)
          setSedeId(data[0].id)
          setSede(data[0])
        }
      })
  }, [])

  useEffect(() => {
    if (!sedeId) return
    const found = sedes.find((s) => s.id === sedeId) ?? null
    setSede(found)
  }, [sedeId, sedes])

  async function fetchData() {
    if (!sedeId || !fecha) return
    setLoading(true)

    const [estilistasRes, agendaRes] = await Promise.all([
      supabase
        .from('estilistas')
        .select('id, nombre')
        .eq('sede_id', sedeId)
        .order('nombre'),
      fetch(`/api/agenda?sede_id=${sedeId}&fecha=${fecha}`).then((r) => r.json()),
    ])

    if (estilistasRes.data) setEstilistas(estilistasRes.data)
    if (agendaRes.reservas) setReservas(agendaRes.reservas)

    setLoading(false)
  }

  useEffect(() => {
    fetchData()

    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(fetchData, 30_000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [sedeId, fecha])

  const slots = sede ? generateSlots(sede.horario_apertura, sede.horario_cierre) : []

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <header className="px-6 py-4" style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xl font-black tracking-tight uppercase" style={{ color: 'var(--text)' }}>
              SOHO<span style={{ color: 'var(--primary)' }}>●</span>.color
            </span>
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>/ Agenda</span>
          </div>
          <div className="flex flex-wrap gap-3 sm:ml-auto items-center">
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="rounded px-3 py-1.5 text-sm focus:outline-none"
              style={{
                border: '1px solid var(--border)',
                background: 'var(--bg-card)',
                color: 'var(--text)',
              }}
            />
            <select
              value={sedeId}
              onChange={(e) => setSedeId(e.target.value)}
              className="rounded px-3 py-1.5 text-sm focus:outline-none"
              style={{
                border: '1px solid var(--border)',
                background: 'var(--bg-card)',
                color: 'var(--text)',
              }}
            >
              {sedes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
            {loading && (
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Cargando...
              </span>
            )}
            <button
              onClick={handleSignOut}
              className="rounded-lg border border-[#e0e0e0] bg-white px-3 py-1.5 text-sm text-[#666666] hover:border-[#E8192C] hover:text-[#E8192C] transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 py-6 overflow-x-auto">
        {slots.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Selecciona una sede para ver la agenda.
          </p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th
                  className="w-16 text-left text-xs font-medium uppercase px-2 py-2 sticky left-0 z-10"
                  style={{
                    color: 'var(--text-secondary)',
                    borderBottom: '1px solid var(--border)',
                    background: 'var(--bg)',
                  }}
                >
                  Hora
                </th>
                {estilistas.map((est) => (
                  <th
                    key={est.id}
                    className="text-center text-xs font-semibold uppercase px-3 py-2 min-w-[140px]"
                    style={{
                      color: 'var(--text)',
                      borderBottom: '2px solid var(--primary)',
                      background: 'var(--bg)',
                    }}
                  >
                    {est.nombre}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slots.map((slot) => (
                <tr key={slot} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td
                    className="text-xs font-mono px-2 py-0 align-top sticky left-0 z-10"
                    style={{ height: SLOT_HEIGHT_PX, color: 'var(--text-secondary)', background: 'var(--bg)' }}
                  >
                    <span className="leading-none pt-1 block">{slot}</span>
                  </td>
                  {estilistas.map((est) => {
                    const reserva = reservas.find(
                      (r) => r.estilista_id === est.id && reservaCoversSlot(r, slot, fecha)
                    )
                    const isStart = reserva ? isSlotStart(reserva, slot, fecha) : false
                    const span = reserva ? reservaSpanSlots(reserva) : 1

                    if (reserva && !isStart) {
                      return <td key={est.id} className="p-0" style={{ height: SLOT_HEIGHT_PX }} />
                    }

                    if (reserva && isStart) {
                      return (
                        <td
                          key={est.id}
                          rowSpan={span}
                          className="px-2 py-1 align-top rounded"
                          style={{ ...cellStyle(reserva.estado), height: SLOT_HEIGHT_PX * span, verticalAlign: 'top' }}
                        >
                          <p className="font-medium text-xs leading-tight truncate">
                            {reserva.cliente_nombre}
                          </p>
                          <p className="text-xs leading-tight truncate opacity-80">
                            {reserva.servicios?.nombre}
                          </p>
                          {reserva.estado === 'pendiente' && (
                            <span className="text-xs font-semibold uppercase tracking-wide opacity-60">
                              Pendiente
                            </span>
                          )}
                        </td>
                      )
                    }

                    return (
                      <td
                        key={est.id}
                        style={{ height: SLOT_HEIGHT_PX, background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                      />
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  )
}
