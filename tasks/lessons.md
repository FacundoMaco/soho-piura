# Lessons Learned — SohoPiura

## Formato
Cada lección sigue este patrón:
- **Qué pasó**: descripción del error o corrección
- **Por qué**: causa raíz
- **Regla**: lo que Claude debe hacer diferente

---

## Lecciones

-Lección 001
- **Qué pasó**: Column reference ambiguous en SQL con subquery + cross join
- **Por qué**: Dos tablas tenían columna `nombre`, PostgreSQL no sabe cuál usar
- **Regla**: Siempre prefixar columnas con alias de tabla en queries con joins o subqueriestualiza automáticamente después de cada corrección.