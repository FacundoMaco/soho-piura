import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    cliente_nombre,
    cliente_whatsapp,
    sede_id,
    estilista_id,
    servicio_id,
    fecha_inicio,
    fecha_fin,
  } = body

  if (
    !cliente_nombre ||
    !cliente_whatsapp ||
    !sede_id ||
    !estilista_id ||
    !servicio_id ||
    !fecha_inicio ||
    !fecha_fin
  ) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const { data: solapadas, error: solapError } = await supabase
    .from('reservas')
    .select('id')
    .eq('estilista_id', estilista_id)
    .neq('estado', 'cancelada')
    .lt('fecha_inicio', fecha_fin)
    .gt('fecha_fin', fecha_inicio)

  if (solapError) {
    return NextResponse.json({ error: 'Error al verificar disponibilidad' }, { status: 500 })
  }

  if (solapadas && solapadas.length > 0) {
    return NextResponse.json({ error: 'El estilista ya tiene una reserva en ese horario' }, { status: 409 })
  }

  const { data: reserva, error: insertError } = await supabase
    .from('reservas')
    .insert({
      cliente_nombre,
      cliente_whatsapp,
      sede_id,
      estilista_id,
      servicio_id,
      fecha_inicio,
      fecha_fin,
      estado: 'pendiente',
    })
    .select()
    .single()

  if (insertError) {
    return NextResponse.json({ error: 'Error al crear la reserva' }, { status: 500 })
  }

  return NextResponse.json(reserva, { status: 201 })
}
