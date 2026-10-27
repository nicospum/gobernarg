# Inicio y retratos Full

Las nuevas partidas ofrecen sólo **Normal** y **Argentina**, con Normal seleccionado por defecto. La lista pública `NEW_GAME_DIFFICULTY_LEVELS` y el guard `isNewScenarioAvailable` viven en `lib/editionAccess.ts`; la creación desde App utiliza ese mismo guard. `pais_en_calma` se rechaza expresamente para nuevas partidas.

El catálogo interno `DIFFICULTY_LEVELS`, el escenario País en calma y sus reglas se conservan. `HISTORIC_SCENARIOS` sigue excluyéndolo y contiene únicamente Corralito y País en llamas, ambos bloqueados. Los guardados anteriores de Fácil pueden importarse, continuar y guardarse de nuevo; el progreso previo no modifica la lista pública. No se aplican los pesos candidatos del análisis de proporcionalidad ni se cambian balances.

Los quince retratos conservan sus imágenes y orden. Sus botones tienen nombres accesibles neutrales `Retrato 1…15` y estado `aria-pressed`; no muestran leyendas ni títulos profesionales. Los cuatro perfiles y sus atributos permanecen disponibles.

Full incorpora **Subir mi foto** con el mismo helper `avatarPhoto.ts` de Light: valida tipo y límite de 10 MB, recorta al centro y genera JPEG 256×256 como dataURL local. No utiliza backend ni dependencias nuevas. La foto queda seleccionada y puede volver a elegirse después de tocar un retrato. La carga muestra procesamiento y errores legibles, conserva la imagen anterior ante un fallo y bloquea Continuar mientras procesa. El control de archivo tiene foco visible de teclado. El dataURL se conserva en el estado y en el respaldo Full.

Regresiones: lista pública y Normal predeterminado; progreso antiguo sin reexponer Fácil; catálogo histórico intacto; guardado v1 de Fácil que continúa; retratos neutrales y perfiles independientes; selección y cambio de foto; procesamiento bloqueante; error de formato/lectura sin perder la imagen anterior; validación del límite y recorte. Checklist React revisado: estado derivado simple, sin efectos adicionales, botones accesibles, cambios mediante handlers y sin dependencias nuevas.

Verificación y resultados finales en el workspace administrativo: `_cierre2026/checks/inicio-retratos/Full`.

Resultado final: 37 archivos y 405 pruebas PASS; typecheck y build PASS; lint sin errores y con siete avisos de Fast Refresh previos. QA del responsable en navegador desktop y móvil: quince retratos sin texto, teclado, WebP real convertido a JPEG, dos niveles con Normal predeterminado, inicio y recarga de foto, guardado anterior de Fácil y primeros dos turnos de Normal PASS.
