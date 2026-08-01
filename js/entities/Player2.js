// ============================================================
// CLASE JUGADOR 2
// ============================================================
import { ACELERACION, VEL_SALTO, VEL_ROTACION, RADIO_APUNTADO } from '../constants.js';
import { Entidad } from './Entity.js';

export class Jugador2 extends Entidad {
    constructor(props, refs = {}) {
        super(props);
        this.refs = refs;
        this.anguloApuntado = Math.PI; // P2 inicia apuntando a la izquierda (hacia P1)
        this.apuntado = {
            x: props.x + props.ancho / 2 + Math.cos(this.anguloApuntado) * RADIO_APUNTADO,
            y: props.y + props.alto / 2 + Math.sin(this.anguloApuntado) * RADIO_APUNTADO
        };
    }

    actualizar(dt, ctx, plataformas) {
        super.actualizar(dt, ctx, plataformas);
        if (this.muerto) return;

        const { teclasP2, teclasRotacionP2 } = this.refs;

        if (teclasP2.izquierda.presionada && this.velocidad.x > -this.velocidadMax) {
            this.velocidad.x -= ACELERACION * dt;
        }
        if (teclasP2.derecha.presionada && this.velocidad.x < this.velocidadMax) {
            this.velocidad.x += ACELERACION * dt;
        }

        if (teclasRotacionP2.antihorario.presionada) this.anguloApuntado -= VEL_ROTACION * dt;
        if (teclasRotacionP2.horario.presionada) this.anguloApuntado += VEL_ROTACION * dt;

        const centroX = this.posicion.x + this.ancho / 2;
        const centroY = this.posicion.y + this.alto / 2;

        this.apuntado.x = centroX + Math.cos(this.anguloApuntado) * RADIO_APUNTADO;
        this.apuntado.y = centroY + Math.sin(this.anguloApuntado) * RADIO_APUNTADO;

        if (teclasP2.disparar.presionada) {
            this.disparar();
        }
    }

    saltar() {
        if (this.enElSuelo) {
            this.velocidad.y = VEL_SALTO;
        }
    }
}