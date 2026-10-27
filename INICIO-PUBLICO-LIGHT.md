# Inicio público de Light

Las partidas nuevas ofrecen sólo Normal y Argentina, con Normal elegido de entrada. `lib/editionAccess.ts` define esa lista y valida el id original tanto en NewGameScreen como en el callback de App. Fácil, los históricos y los ids desconocidos no pueden iniciar una partida por un estado oculto o un fallback.

El catálogo interno conserva País en calma para guardados anteriores, herramientas y pruebas; no se convierte en escenario histórico. La continuación y la importación de partidas anteriores conservan su escenario y calendario. Los históricos siguen bloqueados en esta edición. No se modificaron motor, balance, regla de actividad ni benchmarks.

Los 15 retratos ya usaban etiquetas neutrales “Avatar N” sin leyenda visible, profesión o tooltip. Se mantienen esas imágenes, la selección de foto, la carga de foto propia y los cuatro perfiles con ventajas reales. La carga de foto conserva indicador de foco visible al navegar con teclado.

Mientras se convierte la foto elegida, Empezar y los controles de foto quedan bloqueados. Al terminar se utiliza la imagen nueva; no se inicia silenciosamente con la anterior.
