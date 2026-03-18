import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const estilista_id = searchParams.get('estilista_id')
  const servicio_id = searchParams.get('servicio_id')
  const sede_id = searchParams.get('sede_id')
  const fecha = searchParams.get('fecha')

  if (!estilista_id || !servicio_id || !sede_id || !fecha) {
    return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })
  }

  const [servicioRes, sedeRes, reservasRes] = await Promise.all([
    supabase.from('servicios').select('duracion_minutos').eq('id', servicio_id).single(),
    supabase.from('sedes').select('horario_apertura, horario_cierre').eq('id', sede_id).single(),
    supabase
      .from('reservas')
      .select('fecha_inicio, fecha_fin')
      .eq('estilista_id', estilista_id)
      .gte('fecha_inicio', `${fecha}T00:00:00`)
      .lte('fecha_inicio', `${fecha}T23:59:59`)
      .neq('estado', 'cancelada'),
  ])

  if (servicioRes.error || !servicioRes.data) {
    return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })
  }
  if (sedeRes.error || !sedeRes.data) {
    return NextResponse.json({ error: 'Sede no encontrada' }, { status: 404 })
  }

  const duracion = servicioRes.data.duracion_minutos
  const { horario_apertura, horario_cierre } = sedeRes.data
  const reservas = reservasRes.data ?? []

  const [aperturaH, aperturaM] = horario_apertura.split(':').map(Number)
  const [cierreH, cierreM] = horario_cierre.split(':').map(Number)

  const baseDate = new Date(`${fecha}T00:00:00`)
  const apertura = new Date(baseDate)
  apertura.setHours(aperturaH, aperturaM, 0, 0)
  const cierre = new Date(baseDate)
  cierre.setHours(cierreH, cierreM, 0, 0)

  const slots: { inicio: string; fin: string }[] = []
  let cursor = new Date(apertura)

  while (true) {
    const slotFin = new Date(cursor.getTime() + duracion * 60000)
    if (slotFin > cierre) break

    const solapado = reservas.some((r) => {
      const rInicio = new Date(r.fecha_inicio).getTime()
      const rFin = new Date(r.fecha_fin).getTime()
      const sInicio = cursor.getTime()
      const sFin = slotFin.getTime()
      return rInicio < sFin && rFin > sInicio
    })

    if (!solapado) {
      slots.push({
        inicio: cursor.toISOString(),
        fin: slotFin.toISOString(),
      })
    }

    cursor = new Date(cursor.getTime() + 30 * 60000)
  }

  return NextResponse.json({ slots })
}
