// ============================================================
// CLASE CÁMARA
// ============================================================
import { MAPA_ANCHO, MAPA_ALTO } from './constants.js';

export class Camara {
    constructor() {
        this.x = 0;
        this.y = 0;
    }

    actualizar(jugador, jugador2, lienzo, modoJuego) {
        let px, py;

        if (modoJuego === '2j' && jugador2 && !jugador2.muerto) {
            px = (jugador.posicion.x + jugador.ancho / 2 + jugador2.posicion.x + jugador2.ancho / 2) / 2;
            py = (jugador.posicion.y + jugador.alto / 2 + jugador2.posicion.y + jugador2.alto / 2) / 2;
        } else {
            px = jugador.posicion.x + jugador.ancho / 2;
            py = jugador.posicion.y + jugador.alto / 2;
        }

        this.x = px - lienzo.width / 2;
        this.y = py - lienzo.height / 2;

        this.x = Math.max(0, Math.min(this.x, MAPA_ANCHO - lienzo.width));
        this.y = Math.max(0, Math.min(this.y, MAPA_ALTO - lienzo.height));
    }
}