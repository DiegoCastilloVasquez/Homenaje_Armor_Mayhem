// ============================================================
// CLASE PROYECTIL
// ============================================================

export class Proyectil {
    constructor({ x, y, velX, velY, radio = 5, color, propietario, daño }) {
        this.posicion = { x, y };
        this.velocidad = { x: velX, y: velY };
        this.radio = radio;
        this.color = color;
        this.propietario = propietario;
        this.daño = daño !== undefined ? daño : 10;
    }

    dibujar(ctx) {
        ctx.beginPath();
        ctx.arc(this.posicion.x, this.posicion.y, this.radio, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    actualizar(dt, ctx) {
        this.dibujar(ctx);
        this.posicion.x += this.velocidad.x * dt;
        this.posicion.y += this.velocidad.y * dt;
    }
}