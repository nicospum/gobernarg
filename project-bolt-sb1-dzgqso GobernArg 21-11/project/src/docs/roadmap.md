# Roadmap de mejoras - GobernArg

Plan ordenado de mejoras para llevar el juego de "funcional pero austero" a "pulido y divertido".

## Fase 1 — Identidad visual y primera impresión
**Objetivo:** que el juego se sienta argentino y profesional nada más entrar.

- [ ] Definir paleta oficial (celeste, blanco, dorado, bordo, gris pizarra).
- [ ] Definir tipografías (serif institucional + sans legible).
- [ ] Integrar `hero-welcome.webp` y logo en `WelcomeScreen`.
- [ ] Integrar avatares de arquetipos en `CharacterCreation`.
- [ ] Crear y aplicar fondos por cargo (`cargo-intendente`, `cargo-gobernador`, `cargo-presidente`).
- [ ] Reemplazar iconos genéricos de Lucide por iconos propios de categorías y grupos.
- [ ] Revisar espaciados, sombras y bordes para que no se vea "en cajas grises".

## Fase 2 — Dashboard y feedback claro
**Objetivo:** que el jugador entienda su situación de un vistazo.

- [ ] Rediseñar `GameHeader` con foto/avatar del gobernante, cargo, año/trimestre y acciones restantes.
- [ ] Mejorar `IndicatorsPanel`: barras grandes con color de alerta, tooltips y tendencia (↑/↓).
- [ ] Agregar un "feed de noticias" o diario de turno visible durante la partida.
- [ ] Mejorar `ActionCard`: mostrar costo/beneficio con iconos, color por categoría y estado bloqueado.
- [ ] Agregar animaciones micro: números flotantes al aplicar acciones, transiciones entre turnos.
- [ ] Mejorar `TurnSummaryModal` con formato de diario y gráfico mini de indicadores.

## Fase 3 — Mecánicas que dan profundidad
**Objetivo:** que las decisiones tengan más peso y estrategia.

- [ ] Integrar habilidades especiales de arquetipos (ver `future-engine-features.md`).
- [ ] Implementar sistema de notificaciones en `gameEngine.ts` y mostrarlas en UI.
- [ ] Agregar advertencias de indicadores (popularidad baja, déficit, inestabilidad).
- [ ] Implementar calendario político con eventos programados.
- [ ] Mejorar eventos aleatorios: probabilidades condicionales y consecuencias diferidas.
- [ ] Revisar y ajustar balance: costos, ingresos, popularidad, dificultad por cargo.

## Fase 4 — Contenido
**Objetivo:** más variedad y rejugabilidad.

- [ ] Ampliar banco de eventos (económicos, sociales, políticos, diplomáticos).
- [ ] Ampliar banco de acciones con requisitos más interesantes.
- [ ] Dar personalidad a grupos de interés: estados de humor, líderes, agendas propias.
- [ ] Retratos e historias para asesores.
- [ ] Objetivos más variados por cargo y arquetipo.

## Fase 5 — Elecciones y progresión
**Objetivo:** que la partida tenga un arco claro y ganas de volver a jugar.

- [ ] Pantalla de elecciones con mapa de Argentina y conteo de votos.
- [ ] Modo campaña: ascender Intendente → Gobernador → Presidente.
- [ ] Dificultades (Fácil, Normal, Difícil) que afecten presupuesto inicial y frecuencia de crisis.
- [ ] Epílogo de partida con resumen de legado.
- [ ] Logros desbloqueables.

## Fase 6 — Pulido final
**Objetivo:** experiencia completa.

- [ ] Sonidos y música de fondo opcional.
- [ ] Tutorial interactivo para los primeros turnos.
- [ ] Responsive design para pantallas medianas/chicas.
- [ ] Pantallas de victoria/derrota más emotivas.
- [ ] Testing manual y ajustes finales de balance.

---

## Prioridad recomendada

1. **Fase 1** es la más urgente porque cambia la primera impresión y ya estás generando imágenes.
2. **Fase 2** hace que el juego sea legible mientras se juega.
3. **Fase 3** le da peso estratégico a las decisiones.
4. **Fases 4-6** amplían contenido y rejugabilidad.
