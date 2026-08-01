// ============================================================
// CLASE JUGADOR 1
// ============================================================
import { ACELERACION, VEL_SALTO, VEL_ROTACION, RADIO_APUNTADO } from '../constants.js';
import { Entidad } from './Entity.js';

export class Jugador extends Entidad {
    constructor(props, usarRaton = true, refs = {}) {
        super(props);
        this.usarRaton = usarRaton;
        this.refs = refs;
        this.anguloApuntado = 0; // P1 inicia apuntando a la derecha
        if (usarRaton) {
            this.apuntado = refs.raton;
        } else {
            this.apuntado = {
                x: props.x + props.ancho / 2 + Math.cos(this.anguloApuntado) * RADIO_APUNTADO,
                y: props.y + props.alto / 2 + Math.sin(this.anguloApuntado) * RADIO_APUNTADO
            };
        }
    }

    actualizar(dt, ctx, plataformas) {
        super.actualizar(dt, ctx, plataformas);
        if (this.muerto) return;

        const { teclasP1, teclasRotacionP1, raton } = this.refs;

        if (teclasP1.izquierda.presionada && this.velocidad.x > -this.velocidadMax) {
            this.velocidad.x -= ACELERACION * dt;
        }
        if (teclasP1.derecha.presionada && this.velocidad.x < this.velocidadMax) {
            this.velocidad.x += ACELERACION * dt;
        }

        if (this.usarRaton) {
            if (raton.presionado) {
                this.disparar();
            }
        } else {
            if (teclasRotacionP1.antihorario.presionada) this.anguloApuntado -= VEL_ROTACION * dt;
            if (teclasRotacionP1.horario.presionada) this.anguloApuntado += VEL_ROTACION * dt;

            const centroX = this.posicion.x + this.ancho / 2;
            const centroY = this.posicion.y + this.alto / 2;

            this.apuntado.x = centroX + Math.cos(this.anguloApuntado) * RADIO_APUNTADO;
            this.apuntado.y = centroY + Math.sin(this.anguloApuntado) * RADIO_APUNTADO;

            if (teclasP1.disparar.presionada) {
                this.disparar();
            }
        }
    }

    saltar() {
        if (this.enElSuelo) {
            this.velocidad.y = VEL_SALTO;
        }
    }
}