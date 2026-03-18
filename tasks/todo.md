# SohoPiura MVP — Plan de Ejecución

## Estado actual: ✅ MVP completado

---

## Fase 1: Base de datos
- [ ] Crear proyecto en Supabase
- [ ] Crear tabla `sedes`
- [ ] Crear tabla `estilistas`
- [ ] Crear tabla `servicios`
- [ ] Crear tabla `reservas`
- [ ] Agregar constraint: no reservas solapadas por estilista
- [ ] Insertar seed data (1 sede, 3 estilistas, 4 servicios)
- [ ] Documentar schema en `.claude/memory/schema.md`

## Fase 2: Next.js init
- [ ] `npx create-next-app@latest` con App Router
- [ ] Instalar Supabase client
- [ ] Configurar variables de entorno
- [ ] Conectar Supabase

## Fase 3: API — Lógica de disponibilidad (core crítico)
- [ ] `GET /api/disponibilidad` — retorna slots libres
- [ ] Lógica de solapamiento implementada y probada
- [ ] `POST /api/reservas` — crea reserva y bloquea slot
- [x] `GET /api/agenda` — vista interna por sede y fecha

## Fase 4: UI cliente
- [x] Pantalla: selección de sede
- [x] Pantalla: selección de servicio
- [x] Pantalla: selección de estilista (implementada en /reservar/horario antes del grid de slots)
- [x] Pantalla: grid de horarios disponibles
- [x] Pantalla: confirmación (nombre + WhatsApp)

## Fase 5: UI interna (promotora)
- [x] Vista de agenda por sede
- [x] Estado estilista: ocupado / libre
- [x] Detalle de reserva

## Fase 6: Verificación
- [x] Flujo completo end-to-end sin errores
- [x] Probar doble reserva — debe bloquearse
- [x] Demo lista

---

## Review
> Se completa al final