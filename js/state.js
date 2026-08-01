// ============================================================
// ESTADO COMPARTIDO DEL JUEGO
// ============================================================

/**
 * Estado global del juego, compartido entre todos los módulos.
 * @type {Object}
 */
export const estadoJuego = {
    pantalla: 'inicio',
    frags: { jugador: 0, enemigo: 0, jugador2: 0 }
};