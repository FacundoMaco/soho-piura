# SohoPiura — Sistema de Reservas MVP

## Problema que resolvemos
Cruces de citas entre estilistas en múltiples sedes.
Un estilista no puede tener dos reservas solapadas. Esa es la regla de oro.

## Stack
- Frontend: Next.js (App Router)
- Backend: API Routes de Next.js
- Base de datos: Supabase (PostgreSQL)
- Hosting: Vercel

## Reglas de operación (Boris Cherny Workflow)

### Antes de cualquier acción
1. Leer `tasks/todo.md` — plan actual y estado
2. Leer `tasks/lessons.md` — errores previos y patrones
3. Leer `.claude/memory/schema.md` — estado actual de la DB

### Durante la ejecución
- Plan mode para cualquier tarea de 3+ pasos
- Si algo sale mal: STOP, re-planear, no seguir empujando
- Una tarea por subagente, contexto limpio
- Nunca marcar tarea completa sin probar que funciona

### Después de cualquier acción
- Actualizar `tasks/todo.md` con el progreso
- Si hubo corrección: documentar el patrón en `tasks/lessons.md`

## Entidades core
Sede → Estilista → Servicio → Reserva

## Lo que NO existe en este MVP
- Pagos online
- CRM, Inventario, Analytics
- Notificaciones automáticas WhatsApp
- Fidelización automática

## Definición de Done
1. Cliente reserva sin intervención humana
2. Horario se bloquea automáticamente
3. Promotora visualiza agenda en tiempo real