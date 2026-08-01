// ============================================================
// CLASE ENTIDAD (base para jugadores y enemigos)
// ============================================================
import { GRAVEDAD, FRICCION_SUELO, FRICCION_AIRE, VEL_PROYECTIL, MAPA_ANCHO, MAPA_ALTO } from '../constants.js';
import { Proyectil } from '../objects/Projectile.js';
import { Particula } from '../objects/Particle.js';

export class Entidad {
    constructor({ x, y, ancho, alto, color, velocidadMax = 5, salud = 100, listaProyectiles = null, listaParticulas = null }) {
        this.posicion = { x, y };
        this.velocidad = { x: 0, y: 0 };
        this.ancho = ancho;
        this.alto = alto;
        this.colorBase = color;
        this.velocidadMax = velocidadMax;
        this.salud = salud;
        this.saludMaxima = salud;
        this.enElSuelo = false;
        this.muerto = false;
        this.tiempoReaparicion = 0;
        this.orientacion = 1;
        this._listaParticulas = listaParticulas;
        this.arma = {
            cadencia: 10,
            ultimoDisparo: 0,
            listaProyectiles: listaProyectiles,
            longitudCanon: 45
        };
        this.callbackMuerte = null;
    }

    dibujar(ctx) {
        const px = this.posicion.x;
        const py = this.posicion.y;
        const anchoJugador = this.ancho;
        const altoJugador = this.alto;

        if (this.velocidad.x > 0.5) this.orientacion = 1;
        else if (this.velocidad.x < -0.5) this.orientacion = -1;

        const centroX = px + anchoJugador / 2;
        const centroY = py + altoJugador / 2;
        const angulo = Math.atan2(this.apuntado.y - centroY, this.apuntado.x - centroX);

        ctx.save();
        ctx.translate(px, py);

        const r = parseInt(this.colorBase.substring(1, 3), 16);
        const g = parseInt(this.colorBase.substring(3, 5), 16);
        const b = parseInt(this.colorBase.substring(5, 7), 16);
        const colorBorde = `rgb(${Math.max(0, r - 30)}, ${Math.max(0, g - 30)}, ${Math.max(0, b - 30)})`;
        const colorDetalle = `rgb(${Math.min(255, r + 30)}, ${Math.min(255, g + 30)}, ${Math.min(255, b + 30)})`;

        ctx.fillStyle = this.colorBase;
        ctx.strokeStyle = colorBorde;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(anchoJugador / 2, altoJugador * 0.15, anchoJugador * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#0a0a0a';
        ctx.beginPath();
        ctx.ellipse(anchoJugador / 2, altoJugador * 0.15, anchoJugador * 0.2, anchoJugador * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = this.colorBase;
        ctx.fillRect(anchoJugador * 0.1, altoJugador * 0.25, anchoJugador * 0.8, altoJugador * 0.4);
        ctx.strokeRect(anchoJugador * 0.1, altoJugador * 0.25, anchoJugador * 0.8, altoJugador * 0.4);

        ctx.fillStyle = colorDetalle;
        ctx.fillRect(anchoJugador * 0.2, altoJugador * 0.35, anchoJugador * 0.6, altoJugador * 0.1);

        ctx.fillStyle = this.colorBase;
        ctx.fillRect(anchoJugador * 0.15, altoJugador * 0.65, anchoJugador * 0.3, altoJugador * 0.35);
        ctx.fillRect(anchoJugador * 0.55, altoJugador * 0.65, anchoJugador * 0.3, altoJugador * 0.35);
        ctx.strokeRect(anchoJugador * 0.15, altoJugador * 0.65, anchoJugador * 0.3, altoJugador * 0.35);
        ctx.strokeRect(anchoJugador * 0.55, altoJugador * 0.65, anchoJugador * 0.3, altoJugador * 0.35);

        ctx.translate(anchoJugador / 2, altoJugador / 2);
        ctx.rotate(angulo);

        ctx.fillStyle = this.colorBase;
        ctx.fillRect(5, -6, 15, 12);
        ctx.strokeRect(5, -6, 15, 12);

        this.dibujarArma(ctx);

        ctx.rotate(-angulo);
        ctx.translate(-(anchoJugador / 2), -(altoJugador / 2));

        ctx.fillStyle = this.colorBase;
        ctx.save();
        ctx.translate(anchoJugador / 2, altoJugador / 2);
        ctx.rotate(Math.PI / 4 * this.orientacion);
        ctx.fillRect(-15, -6, 15, 12);
        ctx.strokeRect(-15, -6, 15, 12);
        ctx.restore();

        ctx.restore();
    }

    dibujarNombre(ctx, nombre, color) {
        ctx.save();
        ctx.fillStyle = color || 'white';
        ctx.font = 'bold 14px Consolas';
        ctx.textAlign = 'center';
        ctx.fillText(nombre, this.posicion.x + this.ancho / 2, this.posicion.y - 10);
        ctx.restore();
    }

    dibujarArma(ctx) {
        const inicioX = 15;
        const inicioY = -3;

        ctx.fillStyle = '#444';
        ctx.fillRect(inicioX, inicioY, 30, 6);
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 1;
        ctx.strokeRect(inicioX, inicioY, 30, 6);
        ctx.fillStyle = '#333';
        ctx.fillRect(inicioX + 8, inicioY + 6, 6, 8);
        ctx.fillStyle = '#666';
        ctx.fillRect(inicioX + 20, inicioY - 4, 8, 4);
        ctx.fillStyle = '#555';
        ctx.fillRect(inicioX + 30, inicioY + 1, 10, 4);
    }

    actualizar(dt, ctx, plataformas) {
        if (this.muerto) {
            this.tiempoReaparicion -= dt;
            if (this.tiempoReaparicion <= 0) {
                this.reaparecer(this.puntosDeReaparicion);
            }
            return;
        }

        const friccionBase = this.enElSuelo ? FRICCION_SUELO : FRICCION_AIRE;
        this.velocidad.x *= Math.pow(friccionBase, dt);

        if (Math.abs(this.velocidad.x) < 0.1) this.velocidad.x = 0;

        this.posicion.x += this.velocidad.x * dt;
        this.chequearColisionesHorizontales(plataformas);

        this.velocidad.y += GRAVEDAD * dt;
        this.posicion.y += this.velocidad.y * dt;
        this.chequearColisionesVerticales(plataformas);

        this.aplicarLimitesDelMundo();

        this.arma.ultimoDisparo += dt;

        this.dibujar(ctx);
    }

    aplicarLimitesDelMundo() {
        // Muros laterales invisibles: el jugador no puede salir del mapa
        if (this.posicion.x < 0) {
            this.posicion.x = 0;
            this.velocidad.x = 0;
        } else if (this.posicion.x + this.ancho > MAPA_ANCHO) {
            this.posicion.x = MAPA_ANCHO - this.ancho;
            this.velocidad.x = 0;
        }

        // Límite superior del mapa
        if (this.posicion.y < 0) {
            this.posicion.y = 0;
            this.velocidad.y = 0;
        }

        // Sin muerte por caída: si una entidad cae al vacío por debajo del mapa,
        // se la reposiciona sobre el suelo principal (cuyo tope está en MAPA_ALTO - 50).
        if (this.posicion.y > MAPA_ALTO + 100) {
            this.posicion.y = MAPA_ALTO - 50 - this.alto;
            this.velocidad.y = 0;
            this.enElSuelo = true;
        }
    }

    chequearColisionesHorizontales(plataformas) {
        for (const plataforma of plataformas) {
            if (this.posicion.y + this.alto > plataforma.posicion.y &&
                this.posicion.y < plataforma.posicion.y + plataforma.alto &&
                this.posicion.x + this.ancho > plataforma.posicion.x &&
                this.posicion.x < plataforma.posicion.x + plataforma.ancho) {
                if (this.velocidad.x > 0) {
                    this.posicion.x = plataforma.posicion.x - this.ancho;
                } else if (this.velocidad.x < 0) {
                    this.posicion.x = plataforma.posicion.x + plataforma.ancho;
                }
                this.velocidad.x = 0;
            }
        }
    }

    chequearColisionesVerticales(plataformas) {
        this.enElSuelo = false;
        for (const plataforma of plataformas) {
            if (this.posicion.y + this.alto > plataforma.posicion.y &&
                this.posicion.y < plataforma.posicion.y + plataforma.alto &&
                this.posicion.x + this.ancho > plataforma.posicion.x &&
                this.posicion.x < plataforma.posicion.x + plataforma.ancho) {
                if (this.velocidad.y > 0) {
                    this.posicion.y = plataforma.posicion.y - this.alto;
                    this.velocidad.y = 0;
                    this.enElSuelo = true;
                } else if (this.velocidad.y < 0) {
                    this.posicion.y = plataforma.posicion.y + plataforma.alto;
                    this.velocidad.y = 0;
                }
            }
        }
    }

    disparar() {
        if (this.arma.ultimoDisparo > this.arma.cadencia) {
            this.arma.ultimoDisparo = 0;
            const centroX = this.posicion.x + this.ancho / 2;
            const centroY = this.posicion.y + this.alto / 2;

            const angulo = Math.atan2(this.apuntado.y - centroY, this.apuntado.x - centroX);

            const velX = Math.cos(angulo) * VEL_PROYECTIL;
            const velY = Math.sin(angulo) * VEL_PROYECTIL;

            if (this.arma.listaProyectiles) {
                this.arma.listaProyectiles.push(new Proyectil({
                    x: centroX + Math.cos(angulo) * this.arma.longitudCanon,
                    y: centroY + Math.sin(angulo) * this.arma.longitudCanon,
                    velX,
                    velY,
                    color: 'yellow',
                    propietario: this
                }));
            }
        }
    }

    recibirDaño(daño, autor) {
        if (this.muerto) return;
        this.salud -= daño;
        if (this.salud <= 0) {
            this.salud = 0;
            this.morir(autor);
        }
    }

    morir(asesino) {
        this.muerto = true;
        this.tiempoReaparicion = 180;

        for (let i = 0; i < 30; i++) {
            this._crearParticulaMuerte();
        }

        if (this.callbackMuerte) {
            this.callbackMuerte(asesino);
        }
    }

    _crearParticulaMuerte() {
        if (!this._listaParticulas) return;
        this._listaParticulas.push(new Particula({
            x: this.posicion.x + this.ancho / 2,
            y: this.posicion.y + this.alto / 2,
            radio: Math.random() * 3 + 1,
            color: this.colorBase
        }));
    }

    reaparecer(puntosDeReaparicion) {
        this.muerto = false;
        this.salud = this.saludMaxima;
        const punto = puntosDeReaparicion[Math.floor(Math.random() * puntosDeReaparicion.length)];
        this.posicion.x = punto.x;
        this.posicion.y = punto.y;
        this.velocidad.x = 0;
        this.velocidad.y = 0;
        this.arma.ultimoDisparo = 0;
    }
}