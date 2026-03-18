# Schema — SohoPiura

## Estado: 🔴 Pendiente de implementación

---

## Tablas

### sedes
| campo | tipo | notas |
|---|---|---|
| id | uuid | PK |
| nombre | text | |
| horario_apertura | time | |
| horario_cierre | time | |

### estilistas
| campo | tipo | notas |
|---|---|---|
| id | uuid | PK |
| nombre | text | |
| sede_id | uuid | FK → sedes |

### servicios
| campo | tipo | notas |
|---|---|---|
| id | uuid | PK |
| nombre | text | |
| duracion_minutos | int | |
| precio | numeric | |

### reservas
| campo | tipo | notas |
|---|---|---|
| id | uuid | PK |
| cliente_nombre | text | |
| cliente_whatsapp | text | |
| sede_id | uuid | FK → sedes |
| estilista_id | uuid | FK → estilistas |
| servicio_id | uuid | FK → servicios |
| fecha_inicio | timestamptz | |
| fecha_fin | timestamptz | |
| estado | text | pendiente/confirmada/cancelada |

## Constraint crítico
Un estilista no puede tener reservas solapadas.
Validado a nivel de API antes de insertar.

## Seed data
> Pendiente — se documenta después de insertar en Supabase
## Estado: ✅ Implementado en Supabase
## Seed data insertado
- 1 sede: Soho Piura Centro (9:00 - 20:00)
- 3 estilistas: María González, Lucía Ramírez, Carmen Torres
- 4 servicios: Corte (30min), Tinte (120min), Mechas (90min), Peinado (45min)
- Todos los estilistas habilitados para todos los servicios