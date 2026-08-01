// ============================================================
// CLASE PLATAFORMA
// ============================================================

export class Plataforma {
    constructor({ x, y, ancho, alto }) {
        this.posicion = { x, y };
        this.ancho = ancho;
        this.alto = alto;
    }

    dibujar(ctx) {
        const { x, y } = this.posicion;

        // Relleno con degradado vertical: más claro arriba, más oscuro abajo
        const degradado = ctx.createLinearGradient(x, y, x, y + this.alto);
        degradado.addColorStop(0, '#8fa3a5');
        degradado.addColorStop(1, '#5f6c6d');
        ctx.fillStyle = degradado;
        ctx.fillRect(x, y, this.ancho, this.alto);

        // Borde oscuro exterior
        ctx.strokeStyle = '#394445';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, this.ancho, this.alto);

        // Borde superior claro: resalta el tope (superficie pisable)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.fillRect(x + 2, y, this.ancho - 4, 4);
    }
}