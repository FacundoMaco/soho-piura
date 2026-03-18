import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const sede_id = searchParams.get('sede_id')
  const fecha = searchParams.get('fecha')

  if (!sede_id || !fecha) {
    return NextResponse.json(
      { error: 'Parámetros requeridos: sede_id, fecha' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('reservas')
    .select('*, estilistas(nombre), servicios(nombre, duracion_minutos)')
    .eq('sede_id', sede_id)
    .neq('estado', 'cancelada')
    .gte('fecha_inicio', `${fecha}T00:00:00`)
    .lte('fecha_inicio', `${fecha}T23:59:59`)
    .order('fecha_inicio', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ reservas: data })
}
