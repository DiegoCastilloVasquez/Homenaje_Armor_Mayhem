// ============================================================
// CLASE ENEMIGO (BOT)
// ============================================================
import { VEL_PROYECTIL, VEL_SALTO } from '../constants.js';
import { CONFIG_DIFICULTAD } from '../constants.js';
import { Entidad } from './Entity.js';
import { Proyectil } from '../objects/Projectile.js';

export class Enemigo extends Entidad {
    constructor(props, refs = {}) {
        super(props);
        this.refs = refs;
        this.apuntado = { x: 0, y: 0 };
        this.rangoDeVision = 500;
        this.rangoDeAtaque = 400;
        this.contadorDecision = 0;
        this.contadorStrafe = 0;
        this.direccionStrafe = 1;
        this.tiempoSinProyectil = 0;
        this.ultimoProyectilCercano = null;

        this._actualizarConfig();
        this.arma.cadencia = this.config.cadencia;
    }

    _actualizarConfig() {
        this.config = CONFIG_DIFICULTAD[this.refs.dificultadActual || 'medio'];
        this.velocidadMax = this.config.velocidad;
    }

    actualizar(dt, ctx, plataformas) {
        this._actualizarConfig();
        super.actualizar(dt, ctx, plataformas);
        if (this.muerto) return;

        const jugador = this.refs.jugador;
        if (!jugador) return;

        this.apuntado.x = jugador.posicion.x + jugador.ancho / 2;
        this.apuntado.y = jugador.posicion.y + jugador.alto / 2;
        this.tiempoSinProyectil += dt;
        this.tomarDecisiones(dt);
    }

    disparar() {
        const config = this.config;
        if (this.arma.ultimoDisparo > this.arma.cadencia) {
            if (Math.random() > config.precision) {
                this.arma.ultimoDisparo = 0;
                const centroX = this.posicion.x + this.ancho / 2;
                const centroY = this.posicion.y + this.alto / 2;
                const desviacion = (Math.random() - 0.5) * 0.4;
                const angulo = Math.atan2(this.apuntado.y - centroY, this.apuntado.x - centroX) + desviacion;
                const velX = Math.cos(angulo) * VEL_PROYECTIL;
                const velY = Math.sin(angulo) * VEL_PROYECTIL;
                if (this.arma.listaProyectiles) {
                    this.arma.listaProyectiles.push(new Proyectil({
                        x: centroX + Math.cos(angulo) * this.arma.longitudCanon,
                        y: centroY + Math.sin(angulo) * this.arma.longitudCanon,
                        velX, velY,
                        color: 'yellow',
                        propietario: this,
                        daño: config.daño
                    }));
                }
                return;
            }
            super.disparar();
            const lista = this.arma.listaProyectiles;
            if (lista && lista.length > 0) {
                const ultimo = lista[lista.length - 1];
                if (ultimo) ultimo.daño = config.daño;
            }
        }
    }

    tomarDecisiones(dt) {
        const config = this.config;
        const jugador = this.refs.jugador;
        if (!jugador) return;

        const distanciaX = jugador.posicion.x - this.posicion.x;
        const distanciaY = jugador.posicion.y - this.posicion.y;
        const distanciaTotal = Math.sqrt(distanciaX * distanciaX + distanciaY * distanciaY);

        if (jugador.muerto) {
            this.comportamientoInactivo(dt);
            return;
        }

        if (distanciaTotal > this.rangoDeVision) {
            this.velocidad.x *= Math.pow(0.8, dt);
            return;
        }

        this.intentarEsquivar(dt, config);

        if (this.salud < this.saludMaxima * (config.retiradaUmbral / 100) && distanciaTotal < 300) {
            this.comportamientoRetirada(distanciaX, dt);
            return;
        }

        if (jugador.salud < jugador.saludMaxima * 0.3 && distanciaTotal < 400) {
            this.comportamientoAgresivo(distanciaX, distanciaY, distanciaTotal, dt, config);
            return;
        }

        this.comportamientoCombate(distanciaX, distanciaY, distanciaTotal, dt, config);
    }

    comportamientoInactivo(dt) {
        if (this.enElSuelo && Math.random() < 0.005 * dt) {
            this.velocidad.y = VEL_SALTO;
        }
        this.contadorDecision += dt;
        if (this.contadorDecision >= 120) {
            this.contadorDecision = 0;
            this.velocidad.x = Math.random() > 0.5 ? this.config.velocidad * 0.5 : -this.config.velocidad * 0.5;
        }
    }

    intentarEsquivar(dt, config) {
        const proyectilMasCercano = this.encontrarProyectilCercano();
        if (!proyectilMasCercano) return;

        const distAlProyectil = Math.sqrt(
            (proyectilMasCercano.posicion.x - this.posicion.x) ** 2 +
            (proyectilMasCercano.posicion.y - this.posicion.y) ** 2
        );

        if (distAlProyectil < 150) {
            if (proyectilMasCercano.velocidad.x > 0 && this.posicion.x < proyectilMasCercano.posicion.x) {
                this.velocidad.x = -this.config.velocidad * 1.5;
            } else if (proyectilMasCercano.velocidad.x < 0 && this.posicion.x > proyectilMasCercano.posicion.x) {
                this.velocidad.x = this.config.velocidad * 1.5;
            }

            const difY = Math.abs(proyectilMasCercano.posicion.y - (this.posicion.y + this.alto / 2));
            if (difY < 40 && this.enElSuelo && Math.random() < 0.3) {
                this.velocidad.y = VEL_SALTO;
            }

            this.tiempoSinProyectil = 0;
        }
    }

    encontrarProyectilCercano() {
        const proyectiles = this.refs.proyectiles;
        if (!proyectiles) return null;

        let masCercano = null;
        let menorDistancia = 200;

        for (const p of proyectiles) {
            if (p.propietario === this) continue;
            const dx = p.posicion.x - this.posicion.x;
            const dy = p.posicion.y - this.posicion.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            const seAcerca = (dx * p.velocidad.x < 0) || (dy * p.velocidad.y < 0);
            if (dist < menorDistancia && seAcerca) {
                menorDistancia = dist;
                masCercano = p;
            }
        }
        return masCercano;
    }

    comportamientoRetirada(distanciaX, dt) {
        if (distanciaX > 0) {
            this.velocidad.x = -this.config.velocidad * 0.8;
        } else {
            this.velocidad.x = this.config.velocidad * 0.8;
        }

        if (Math.abs(this.velocidad.x) < 0.5 && this.enElSuelo) {
            this.velocidad.y = VEL_SALTO;
        }

        this.disparar();
    }

    comportamientoAgresivo(distanciaX, distanciaY, distanciaTotal, dt, config) {
        const direccion = distanciaX > 0 ? 1 : -1;
        this.velocidad.x = direccion * config.velocidad * 1.3;

        if (this.enElSuelo && (distanciaY < -60 || Math.abs(distanciaX) > 200) && Math.random() < config.saltoProbabilidad * dt) {
            this.velocidad.y = VEL_SALTO;
        }

        this.disparar();
    }

    comportamientoCombate(distanciaX, distanciaY, distanciaTotal, dt, config) {
        this.contadorStrafe += dt;
        if (this.contadorStrafe >= config.strafeIntervalo) {
            this.contadorStrafe = 0;
            if (Math.random() < 0.4) {
                this.direccionStrafe *= -1;
            }
        }

        const rangoDisparoOptimo = 250;
        const cercaDelJugador = distanciaTotal < rangoDisparoOptimo;
        const lejosDelJugador = distanciaTotal > rangoDisparoOptimo + 100;

        if (lejosDelJugador) {
            const direccion = distanciaX > 0 ? 1 : -1;
            this.velocidad.x = direccion * config.velocidad;
        } else if (cercaDelJugador) {
            this.velocidad.x = this.direccionStrafe * config.velocidad * 0.7;
        } else {
            const direccionJugador = distanciaX > 0 ? 1 : -1;
            this.velocidad.x = (this.direccionStrafe * config.velocidad * 0.5) + (direccionJugador * config.velocidad * 0.3);
        }

        const estaBloqueado = Math.abs(this.velocidad.x) < 0.5 && Math.abs(distanciaX) > 30;
        if (this.enElSuelo && (distanciaY < -50 || estaBloqueado) && Math.random() < config.saltoProbabilidad * dt) {
            this.velocidad.y = VEL_SALTO;
        }

        if (distanciaTotal < this.rangoDeAtaque) {
            this.disparar();
        }
    }
}