const lienzo = document.getElementById('lienzoJuego');
const ctx = lienzo.getContext('2d');

const MAPA_ANCHO = 1920;
const MAPA_ALTO = 800;

function ajustarTamañoLienzo() {
    lienzo.width = window.innerWidth;
    lienzo.height = window.innerHeight;
}

ajustarTamañoLienzo();
window.addEventListener('resize', ajustarTamañoLienzo);

const pantallaInicio = document.getElementById('pantallaInicio');
const botonJugar = document.getElementById('botonJugar');
const pantallaGameOver = document.getElementById('pantallaGameOver');
const textoResultado = document.getElementById('textoResultado');
const botonReiniciar = document.getElementById('botonReiniciar');

const GRAVEDAD = 0.6;
const FRICCION_SUELO = 0.85;
const FRICCION_AIRE = 0.95;
const LIMITE_FRAGS = 5;

const camara = { x: 0, y: 0 };

let estadoJuego = {
    pantalla: 'inicio',
    frags: { jugador: 0, enemigo: 0 }
};

const teclas = {
    a: { presionada: false },
    d: { presionada: false },
    w: { presionada: false }
};

const raton = {
    x: 0,
    y: 0,
    presionado: false
};

let proyectiles = [];
let particulas = [];
let jugador;
let enemigo;

class Entidad {
    constructor({ x, y, ancho, alto, color, velocidadMax = 5, salud = 100 }) {
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
        this.arma = {
            cadencia: 15,
            ultimoDisparo: 0,
            listaProyectiles: proyectiles,
            longitudCanon: 45
        };
    }

    dibujar() {
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

        const colorBorde = `rgb(${Math.max(0, parseInt(this.colorBase.substring(1, 3), 16) - 30)}, ${Math.max(0, parseInt(this.colorBase.substring(3, 5), 16) - 30)}, ${Math.max(0, parseInt(this.colorBase.substring(5, 7), 16) - 30)})`;
        const colorDetalle = `rgb(${Math.max(0, parseInt(this.colorBase.substring(1, 3), 16) + 30)}, ${Math.max(0, parseInt(this.colorBase.substring(3, 5), 16) + 30)}, ${Math.max(0, parseInt(this.colorBase.substring(5, 7), 16) + 30)})`;

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

        this.dibujarArma();

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

    dibujarArma() {
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

    actualizar() {
        if (this.muerto) {
            this.tiempoReaparicion--;
            if (this.tiempoReaparicion <= 0) {
                this.reaparecer();
            }
            return;
        }

        const friccion = this.enElSuelo ? FRICCION_SUELO : FRICCION_AIRE;
        this.velocidad.x *= friccion;

        if (Math.abs(this.velocidad.x) < 0.1) this.velocidad.x = 0;

        this.posicion.x += this.velocidad.x;
        this.chequearColisionesHorizontales();

        this.aplicarGravedad();
        this.chequearColisionesVerticales();

        this.arma.ultimoDisparo++;

        this.dibujar();
    }

    aplicarGravedad() {
        this.velocidad.y += GRAVEDAD;
        this.posicion.y += this.velocidad.y;
    }

    chequearColisionesHorizontales() {
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

    chequearColisionesVerticales() {
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
            const velocidadProyectil = 15;
            const centroX = this.posicion.x + this.ancho / 2;
            const centroY = this.posicion.y + this.alto / 2;

            const angulo = Math.atan2(this.apuntado.y - centroY, this.apuntado.x - centroX);

            const velX = Math.cos(angulo) * velocidadProyectil;
            const velY = Math.sin(angulo) * velocidadProyectil;

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
            particulas.push(new Particula({
                x: this.posicion.x + this.ancho / 2,
                y: this.posicion.y + this.alto / 2,
                radio: Math.random() * 3 + 1,
                color: this.colorBase
            }));
        }

        if (asesino instanceof Jugador) {
            estadoJuego.frags.jugador++;
        } else if (asesino instanceof Enemigo) {
            estadoJuego.frags.enemigo++;
        }

        if (estadoJuego.frags.jugador >= LIMITE_FRAGS) {
            estadoJuego.pantalla = 'gameOver';
            textoResultado.innerText = '¡VICTORIA!';
            pantallaGameOver.style.display = 'flex';
        } else if (estadoJuego.frags.enemigo >= LIMITE_FRAGS) {
            estadoJuego.pantalla = 'gameOver';
            textoResultado.innerText = 'DERROTA';
            pantallaGameOver.style.display = 'flex';
        }
    }

    reaparecer() {
        this.muerto = false;
        this.salud = this.saludMaxima;
        const puntoReaparicion = puntosDeReaparicion[Math.floor(Math.random() * puntosDeReaparicion.length)];
        this.posicion.x = puntoReaparicion.x;
        this.posicion.y = puntoReaparicion.y;
        this.velocidad.x = 0;
        this.velocidad.y = 0;
        this.arma.ultimoDisparo = 0;
    }
}

class Jugador extends Entidad {
    constructor(props) {
        super(props);
        this.apuntado = raton;
    }

    actualizar() {
        super.actualizar();
        if (this.muerto) return;

        if (teclas.a.presionada && this.velocidad.x > -this.velocidadMax) {
            this.velocidad.x -= 1;
        }
        if (teclas.d.presionada && this.velocidad.x < this.velocidadMax) {
            this.velocidad.x += 1;
        }

        if (raton.presionado) {
            this.disparar();
        }
    }

    saltar() {
        if (this.enElSuelo) {
            this.velocidad.y = -14;
        }
    }
}

class Enemigo extends Entidad {
    constructor(props) {
        super(props);
        this.apuntado = { x: 0, y: 0 };
        this.rangoDeVision = 500;
        this.rangoDeAtaque = 400;
        this.tiempoDecision = 0;
    }

    actualizar() {
        super.actualizar();
        if (this.muerto) return;

        this.apuntado.x = jugador.posicion.x + jugador.ancho / 2;
        this.apuntado.y = jugador.posicion.y + jugador.alto / 2;
        this.tomarDecisiones();
    }

    tomarDecisiones() {
        const distanciaX = jugador.posicion.x - this.posicion.x;
        const distanciaY = jugador.posicion.y - this.posicion.y;
        const distanciaTotal = Math.sqrt(distanciaX * distanciaX + distanciaY * distanciaY);

        if (jugador.muerto) {
            if (this.enElSuelo && Math.random() < 0.005) {
                this.velocidad.y = -10;
            }
            if (this.tiempoDecision % 120 === 0) {
                this.velocidad.x = Math.random() > 0.5 ? 2 : -2;
            }
            this.tiempoDecision++;
            return;
        }

        if (distanciaTotal < this.rangoDeVision) {
            if (distanciaX > this.ancho / 2) {
                this.velocidad.x = 2;
            } else if (distanciaX < -this.ancho / 2) {
                this.velocidad.x = -2;
            } else {
                this.velocidad.x = 0;
            }

            const estaBloqueado = this.velocidad.x === 0 && Math.abs(distanciaX) > 10;
            if (this.enElSuelo && (distanciaY < -50 || estaBloqueado)) {
                if (Math.random() < 0.05) this.velocidad.y = -14;
            }

            if (distanciaTotal < this.rangoDeAtaque) {
                this.disparar();
            }
        } else {
            this.velocidad.x *= 0.8;
        }
    }
}

class Plataforma {
    constructor({ x, y, ancho, alto }) {
        this.posicion = { x, y };
        this.ancho = ancho;
        this.alto = alto;
    }

    dibujar() {
        ctx.fillStyle = '#7f8c8d';
        ctx.fillRect(this.posicion.x, this.posicion.y, this.ancho, this.alto);
        ctx.strokeStyle = '#5f6c6d';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.posicion.x, this.posicion.y, this.ancho, this.alto);
    }
}

class Proyectil {
    constructor({ x, y, velX, velY, radio = 5, color, propietario }) {
        this.posicion = { x, y };
        this.velocidad = { x: velX, y: velY };
        this.radio = radio;
        this.color = color;
        this.propietario = propietario;
        this.daño = 10;
    }

    dibujar() {
        ctx.beginPath();
        ctx.arc(this.posicion.x, this.posicion.y, this.radio, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    actualizar() {
        this.dibujar();
        this.posicion.x += this.velocidad.x;
        this.posicion.y += this.velocidad.y;
    }
}

class Particula {
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

    dibujar() {
        ctx.save();
        ctx.globalAlpha = this.opacidad;
        ctx.beginPath();
        ctx.arc(this.posicion.x, this.posicion.y, this.radio, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }

    actualizar() {
        this.dibujar();
        this.velocidad.y += GRAVEDAD * 0.1;
        this.posicion.x += this.velocidad.x;
        this.posicion.y += this.velocidad.y;
        this.vida -= 2;
        this.opacidad -= 1 / 50;
    }
}

const plataformas = [
    new Plataforma({ x: 0, y: MAPA_ALTO - 40, ancho: MAPA_ANCHO, alto: 40 }),
    new Plataforma({ x: -20, y: 0, ancho: 20, alto: MAPA_ALTO }),
    new Plataforma({ x: MAPA_ANCHO, y: 0, ancho: 20, alto: MAPA_ALTO }),
    new Plataforma({ x: 150, y: 650, ancho: 300, alto: 20 }),
    new Plataforma({ x: 300, y: 500, ancho: 250, alto: 20 }),
    new Plataforma({ x: 100, y: 350, ancho: 200, alto: 20 }),
    new Plataforma({ x: 0, y: 200, ancho: 150, alto: 20 }),
    new Plataforma({ x: 810, y: 600, ancho: 300, alto: 20 }),
    new Plataforma({ x: 650, y: 450, ancho: 150, alto: 20 }),
    new Plataforma({ x: 1120, y: 450, ancho: 150, alto: 20 }),
    new Plataforma({ x: 860, y: 300, ancho: 200, alto: 20 }),
    new Plataforma({ x: 910, y: 150, ancho: 100, alto: 20 }),
    new Plataforma({ x: MAPA_ANCHO - 450, y: 650, ancho: 300, alto: 20 }),
    new Plataforma({ x: MAPA_ANCHO - 550, y: 500, ancho: 250, alto: 20 }),
    new Plataforma({ x: MAPA_ANCHO - 300, y: 350, ancho: 200, alto: 20 }),
    new Plataforma({ x: MAPA_ANCHO - 150, y: 200, ancho: 150, alto: 20 }),
];

const puntosDeReaparicion = [
    { x: 200, y: 100 },
    { x: 960, y: 100 },
    { x: MAPA_ANCHO - 200, y: 100 },
    { x: 350, y: 450 },
    { x: MAPA_ANCHO - 450, y: 450 },
    { x: 150, y: 600 },
    { x: MAPA_ANCHO - 250, y: 600 },
];

function buclePrincipal() {
    requestAnimationFrame(buclePrincipal);

    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, lienzo.width, lienzo.height);

    if (estadoJuego.pantalla === 'jugando') {
        camara.x += (jugador.posicion.x - camara.x - lienzo.width / 2) * 0.1;
        camara.y += (jugador.posicion.y - camara.y - lienzo.height / 2) * 0.1;

        if (camara.x < 0) camara.x = 0;
        if (camara.y < 0) camara.y = 0;
        if (camara.x > MAPA_ANCHO - lienzo.width) camara.x = MAPA_ANCHO - lienzo.width;
        if (camara.y > MAPA_ALTO - lienzo.height) camara.y = MAPA_ALTO - lienzo.height;

        ctx.save();
        ctx.translate(-camara.x, -camara.y);

        plataformas.forEach(p => p.dibujar());

        jugador.actualizar();
        enemigo.actualizar();

        for (let i = proyectiles.length - 1; i >= 0; i--) {
            const p = proyectiles[i];
            p.actualizar();

            if (p.posicion.x < 0 || p.posicion.x > MAPA_ANCHO || p.posicion.y < 0 || p.posicion.y > MAPA_ALTO) {
                proyectiles.splice(i, 1);
                continue;
            }

            let colisionPlataforma = false;
            for (const plat of plataformas) {
                if (p.posicion.x + p.radio > plat.posicion.x && p.posicion.x - p.radio < plat.posicion.x + plat.ancho &&
                    p.posicion.y + p.radio > plat.posicion.y && p.posicion.y - p.radio < plat.posicion.y + plat.alto) {
                    colisionPlataforma = true;
                    break;
                }
            }

            if (colisionPlataforma) {
                for (let j = 0; j < 5; j++) {
                    particulas.push(new Particula({ x: p.posicion.x, y: p.posicion.y, radio: Math.random() * 2, color: 'white' }));
                }
                proyectiles.splice(i, 1);
                continue;
            }

            if (p.propietario !== jugador && !jugador.muerto &&
                p.posicion.x > jugador.posicion.x && p.posicion.x < jugador.posicion.x + jugador.ancho &&
                p.posicion.y > jugador.posicion.y && p.posicion.y < jugador.posicion.y + jugador.alto) {
                jugador.recibirDaño(p.daño, p.propietario);
                proyectiles.splice(i, 1);
            }

            if (p.propietario !== enemigo && !enemigo.muerto &&
                p.posicion.x > enemigo.posicion.x && p.posicion.x < enemigo.posicion.x + enemigo.ancho &&
                p.posicion.y > enemigo.posicion.y && p.posicion.y < enemigo.posicion.y + enemigo.alto) {
                enemigo.recibirDaño(p.daño, p.propietario);
                proyectiles.splice(i, 1);
            }
        }

        for (let i = particulas.length - 1; i >= 0; i--) {
            const p = particulas[i];
            p.actualizar();
            if (p.vida <= 0) {
                particulas.splice(i, 1);
            }
        }

    } else if (jugador && enemigo) {
        jugador.dibujar();
        enemigo.dibujar();
    }

    ctx.restore();

    if (estadoJuego.pantalla === 'jugando') {
        dibujarHUD();
    }
}

function dibujarHUD() {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(10, 10, 200, 20);
    ctx.fillStyle = '#2ecc71';
    const anchoBarraJugador = (jugador.salud / jugador.saludMaxima) * 200;
    ctx.fillRect(10, 10, anchoBarraJugador, 20);
    ctx.strokeStyle = 'white';
    ctx.strokeRect(10, 10, 200, 20);
    ctx.fillStyle = 'white';
    ctx.font = '16px Consolas';
    ctx.fillText('VIDA', 30, 26);

    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(lienzo.width - 210, 10, 200, 20);
    ctx.fillStyle = '#e74c3c';
    const anchoBarraEnemigo = (enemigo.salud / enemigo.saludMaxima) * 200;
    ctx.fillRect(lienzo.width - 210 + (200 - anchoBarraEnemigo), 10, anchoBarraEnemigo, 20);
    ctx.strokeStyle = 'white';
    ctx.strokeRect(lienzo.width - 210, 10, 200, 20);

    ctx.fillStyle = 'white';
    ctx.font = '32px Consolas';
    ctx.textAlign = 'center';
    ctx.fillText(`${estadoJuego.frags.jugador} - ${estadoJuego.frags.enemigo}`, lienzo.width / 2, 40);
}

function iniciarJuego() {
    estadoJuego.pantalla = 'jugando';
    pantallaInicio.style.display = 'none';
    reiniciarJuego(false);
}

function reiniciarJuego(partidaTerminada = true) {
    estadoJuego.frags.jugador = 0;
    estadoJuego.frags.enemigo = 0;
    jugador = new Jugador({
        x: 100, y: 400, ancho: 40, alto: 60, color: '#3498db', salud: 100
    });

    enemigo = new Enemigo({
        x: MAPA_ANCHO - 150, y: 400, ancho: 40, alto: 60, color: '#e74c3c', salud: 100
    });

    proyectiles.length = 0;
    particulas.length = 0;

    raton.presionado = false;

    if (partidaTerminada) {
        estadoJuego.pantalla = 'jugando';
        pantallaGameOver.style.display = 'none';
    }
}

botonJugar.addEventListener('click', iniciarJuego);

botonReiniciar.addEventListener('click', () => {
    reiniciarJuego(true);
});

window.addEventListener('keydown', (evento) => {
    if (estadoJuego.pantalla !== 'jugando') return;
    switch (evento.key.toLowerCase()) {
        case 'a': teclas.a.presionada = true; break;
        case 'd': teclas.d.presionada = true; break;
        case 'w': jugador.saltar(); break;
    }
});

window.addEventListener('keyup', (evento) => {
    if (estadoJuego.pantalla !== 'jugando') return;
    switch (evento.key.toLowerCase()) {
        case 'a': teclas.a.presionada = false; break;
        case 'd': teclas.d.presionada = false; break;
    }
});

lienzo.addEventListener('mousemove', (evento) => {
    const rect = lienzo.getBoundingClientRect();
    raton.x = evento.clientX - rect.left + camara.x;
    raton.y = evento.clientY - rect.top + camara.y;
});

lienzo.addEventListener('mousedown', () => {
    if (estadoJuego.pantalla !== 'jugando') return;
    raton.presionado = true;
});

window.addEventListener('mouseup', () => {
    raton.presionado = false;
});

buclePrincipal();