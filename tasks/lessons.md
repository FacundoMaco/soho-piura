# Lessons Learned — SohoPiura

## Formato
Cada lección sigue este patrón:
- **Qué pasó**: descripción del error o corrección
- **Por qué**: causa raíz
- **Regla**: lo que Claude debe hacer diferente

---

## Lecciones

### Lección 001
- **Qué pasó**: Column reference ambiguous en SQL con subquery + cross join
- **Por qué**: Dos tablas tenían columna `nombre`, PostgreSQL no sabe cuál usar
- **Regla**: Siempre prefixar columnas con alias de tabla en queries con joins o subqueries

### Lección 003
- **Qué pasó**: Login en `/staff` se quedaba colgado en "Ingresando..." — el `router.push('/agenda')` ejecutaba el middleware que redirigía de vuelta a `/staff`, loop infinito
- **Por qué**: `createClient` de `@supabase/supabase-js` guarda la sesión en **localStorage**. El middleware con `@supabase/ssr` lee **cookies**. Después del login exitoso, el middleware no encontraba sesión en cookies y redirigía de vuelta
- **Regla**: En client components que hagan operaciones de auth (`signIn`, `signOut`), usar siempre `createBrowserClient` de `@supabase/ssr` (guardado en `lib/supabase-browser.ts`). Reservar `createClient` de `@supabase/supabase-js` solo para fetching de datos no-auth en server components

### Lección 002
- **Qué pasó**: Se usaron `onMouseEnter`/`onMouseLeave` en server components (app/page.tsx, servicio/page.tsx, horario/page.tsx)
- **Por qué**: App Router no permite event handlers en server components — solo los client components (`"use client"`) pueden registrar eventos del DOM
- **Regla**: Usar siempre clases Tailwind `hover:` para efectos visuales en server components. Agregar `"use client"` solo cuando hay estado real (`useState`, `useEffect`) o eventos de lógica de negocio, no para CSS hover