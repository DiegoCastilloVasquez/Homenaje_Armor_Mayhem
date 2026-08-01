// ============================================================
// CLASE PARTICULA
// ============================================================
import { GRAVEDAD } from '../constants.js';

export class Particula {
    constructor({ x, y, radio, color }) {
        this.posicion = { x, y };
        this.velocidad = {
            x: (Math.random() - 0.5) * 8,
            y: (Math.random() - 0.5) * 8
        };
        this.radio = radio;
        this.color = color;
        this.vida = 100;
        this.opacidad = 1;
    }

    dibujar(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacidad;
        ctx.beginPath();
        ctx.arc(this.posicion.x, this.posicion.y, this.radio, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }

    actualizar(dt, ctx) {
        this.dibujar(ctx);
        this.velocidad.y += GRAVEDAD * 0.1 * dt;
        this.posicion.x += this.velocidad.x * dt;
        this.posicion.y += this.velocidad.y * dt;
        this.vida -= 2 * dt;
        this.opacidad = this.vida / 100;
    }
}