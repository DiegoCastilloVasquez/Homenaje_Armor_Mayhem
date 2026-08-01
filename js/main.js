// ============================================================
// PUNTO DE ENTRADA PRINCIPAL - INICIALIZACIÓN Y BUCLE
// ============================================================
import { MAPA_ANCHO, MAPA_ALTO, LIMITE_FRAGS } from './constants.js';
import { estadoJuego } from './state.js';
import { Jugador } from './entities/Player.js';
import { Jugador2 } from './entities/Player2.js';
import { Enemigo } from './entities/Enemy.js';
import { Particula } from './objects/Particle.js';
import { Camara } from './camera.js';
import { Input } from './input.js';
import { crearPlataformas, puntosDeReaparicion } from './mapData.js';
import { dibujarHUD } from './hud.js';

(function () {
    const lienzo = document.getElementById('gameCanvas');
    const ctx = lienzo.getContext('2d');

    // Tamaño del canvas = ventana completa
    lienzo.width = window.innerWidth;
    lienzo.height = window.innerHeight;
    window.addEventListener('resize', () => {
        lienzo.width = window.innerWidth;
        lienzo.height = window.innerHeight;
    });

    const camara = new Camara();
    const input = new Input();
    const plataformas = crearPlataformas();

    let jugador = null;
    let jugador2 = null;
    let enemigo = null;
    const proyectiles = [];
    const particulas = [];

    let modoJuego = '1j';
    let dificultadActual = 'medio';
    let tiempoAnterior = performance.now();

    const pantallaInicio = document.getElementById('pantallaInicio');
    const pantallaGameOver = document.getElementById('pantallaGameOver');
    const textoResultado = document.getElementById('textoResultado');
    const textoPuntos = document.getElementById('textoPuntos');
    const botonJugar = document.getElementById('botonJugar');
    const botonReiniciar = document.getElementById('botonReiniciar');

    function comprobarGameOver() {
        if (modoJuego === '2j') {
            const f1 = estadoJuego.frags.jugador;
            const f2 = estadoJuego.frags.jugador2;
            if (f1 >= LIMITE_FRAGS || f2 >= LIMITE_FRAGS) {
                estadoJuego.pantalla = 'gameover';
                textoResultado.innerText = f1 >= LIMITE_FRAGS ? '¡P1 GANA!' : '¡P2 GANA!';
                textoPuntos.innerText = `P1: ${f1}  |  P2: ${f2}`;
                pantallaGameOver.style.display = 'flex';
            }
        } else {
            const fj = estadoJuego.frags.jugador;
            const fe = estadoJuego.frags.enemigo;
            if (fj >= LIMITE_FRAGS || fe >= LIMITE_FRAGS) {
                estadoJuego.pantalla = 'gameover';
                textoResultado.innerText = fj >= LIMITE_FRAGS ? '¡VICTORIA!' : 'DERROTA';
                textoPuntos.innerText = `P1: ${fj}  |  BOT: ${fe}`;
                pantallaGameOver.style.display = 'flex';
            }
        }
    }

    function crearCallbackMuerte(propietario) {
        return (asesino) => {
            if (modoJuego === '2j') {
                if (asesino === jugador) estadoJuego.frags.jugador++;
                else if (asesino === jugador2) estadoJuego.frags.jugador2++;
            } else {
                if (asesino === jugador) estadoJuego.frags.jugador++;
                else if (asesino === enemigo) estadoJuego.frags.enemigo++;
            }
            comprobarGameOver();
        };
    }

    input.configurarEventos(estadoJuego, camara, lienzo, {
        get jugador() { return jugador; },
        get jugador2() { return jugador2; },
        get modoJuego() { return modoJuego; }
    });

    function reiniciarJuego(partidaTerminada = true) {
        estadoJuego.frags.jugador = 0;
        estadoJuego.frags.enemigo = 0;
        estadoJuego.frags.jugador2 = 0;

        if (modoJuego === '2j') {
            jugador = new Jugador({
                x: 200, y: 400, ancho: 40, alto: 60, color: '#3498db', salud: 100,
                listaProyectiles: proyectiles, listaParticulas: particulas
            }, false, {
                teclasP1: input.teclasP1,
                teclasRotacionP1: input.teclasRotacionP1,
                raton: input.raton
            });

            jugador2 = new Jugador2({
                x: MAPA_ANCHO - 300, y: 400, ancho: 40, alto: 60, color: '#e74c3c', salud: 100,
                listaProyectiles: proyectiles, listaParticulas: particulas
            }, {
                teclasP2: input.teclasP2,
                teclasRotacionP2: input.teclasRotacionP2
            });

            jugador.puntosDeReaparicion = puntosDeReaparicion;
            jugador2.puntosDeReaparicion = puntosDeReaparicion;
            jugador.callbackMuerte = crearCallbackMuerte(jugador);
            jugador2.callbackMuerte = crearCallbackMuerte(jugador2);
        } else {
            jugador = new Jugador({
                x: 200, y: 400, ancho: 40, alto: 60, color: '#3498db', salud: 100,
                listaProyectiles: proyectiles, listaParticulas: particulas
            }, true, {
                teclasP1: input.teclasP1,
                teclasRotacionP1: input.teclasRotacionP1,
                raton: input.raton
            });

            enemigo = new Enemigo({
                x: MAPA_ANCHO - 150, y: 400, ancho: 40, alto: 60, color: '#e74c3c', salud: 100,
                listaProyectiles: proyectiles, listaParticulas: particulas
            }, {
                get jugador() { return jugador; },
                proyectiles: proyectiles,
                get dificultadActual() { return dificultadActual; }
            });

            jugador.puntosDeReaparicion = puntosDeReaparicion;
            enemigo.puntosDeReaparicion = puntosDeReaparicion;
            jugador.callbackMuerte = crearCallbackMuerte(jugador);
            enemigo.callbackMuerte = crearCallbackMuerte(enemigo);
        }

        proyectiles.length = 0;
        particulas.length = 0;
        tiempoAnterior = performance.now();
        input.raton.presionado = false;

        if (partidaTerminada) {
            estadoJuego.pantalla = 'jugando';
            pantallaGameOver.style.display = 'none';
            textoPuntos.innerText = '';
        }
    }

    function buclePrincipal() {
        requestAnimationFrame(buclePrincipal);

        const tiempoAhora = performance.now();
        const dt = Math.min((tiempoAhora - tiempoAnterior) / (1000 / 60), 3);
        tiempoAnterior = tiempoAhora;

        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(0, 0, lienzo.width, lienzo.height);

        if (estadoJuego.pantalla === 'jugando') {
            camara.actualizar(jugador, jugador2, lienzo, modoJuego);

            ctx.save();
            ctx.translate(-camara.x, -camara.y);

            plataformas.forEach(p => p.dibujar(ctx));

            jugador.actualizar(dt, ctx, plataformas);
            if (modoJuego === '2j') {
                jugador2.actualizar(dt, ctx, plataformas);
                jugador.dibujarNombre(ctx, 'P1', '#3498db');
                jugador2.dibujarNombre(ctx, 'P2', '#e74c3c');
            } else {
                enemigo.actualizar(dt, ctx, plataformas);
                enemigo.dibujarNombre(ctx, 'BOT', '#e74c3c');
                jugador.dibujarNombre(ctx, 'P1', '#3498db');
            }

            for (let i = proyectiles.length - 1; i >= 0; i--) {
                const p = proyectiles[i];
                p.actualizar(dt, ctx);

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
                    continue;
                }

                if (modoJuego === '2j') {
                    if (p.propietario !== jugador2 && !jugador2.muerto &&
                        p.posicion.x > jugador2.posicion.x && p.posicion.x < jugador2.posicion.x + jugador2.ancho &&
                        p.posicion.y > jugador2.posicion.y && p.posicion.y < jugador2.posicion.y + jugador2.alto) {
                        jugador2.recibirDaño(p.daño, p.propietario);
                        proyectiles.splice(i, 1);
                        continue;
                    }
                } else {
                    if (p.propietario !== enemigo && !enemigo.muerto &&
                        p.posicion.x > enemigo.posicion.x && p.posicion.x < enemigo.posicion.x + enemigo.ancho &&
                        p.posicion.y > enemigo.posicion.y && p.posicion.y < enemigo.posicion.y + enemigo.alto) {
                        enemigo.recibirDaño(p.daño, p.propietario);
                        proyectiles.splice(i, 1);
                        continue;
                    }
                }
            }

            for (let i = particulas.length - 1; i >= 0; i--) {
                const p = particulas[i];
                p.actualizar(dt, ctx);
                if (p.vida <= 0) {
                    particulas.splice(i, 1);
                }
            }

            ctx.restore();

            dibujarHUD(ctx, lienzo, jugador, jugador2, enemigo, estadoJuego, modoJuego);
        }
    }

    // Event listeners
    botonJugar.addEventListener('click', () => {
        estadoJuego.pantalla = 'jugando';
        pantallaInicio.style.display = 'none';
        reiniciarJuego(false);
    });

    botonReiniciar.addEventListener('click', () => {
        estadoJuego.pantalla = 'inicio';
        pantallaGameOver.style.display = 'none';
        pantallaInicio.style.display = 'flex';
    });

    document.querySelectorAll('.boton-dificultad').forEach(boton => {
        boton.addEventListener('click', () => {
            document.querySelectorAll('.boton-dificultad').forEach(b => b.classList.remove('seleccionado'));
            boton.classList.add('seleccionado');
            dificultadActual = boton.dataset.dificultad;
        });
    });

    document.querySelectorAll('.boton-modo').forEach(boton => {
        boton.addEventListener('click', () => {
            document.querySelectorAll('.boton-modo').forEach(b => b.classList.remove('seleccionado'));
            boton.classList.add('seleccionado');
            modoJuego = boton.dataset.modo;

            document.getElementById('p1ApuntarInfo').innerText = modoJuego === '2j' ? '[Q] antihorario / [E] horario' : 'Ratón';
            document.getElementById('p1DispararInfo').innerText = modoJuego === '2j' ? '[S]' : 'Clic izquierdo';

            if (modoJuego === '2j') {
                document.getElementById('controlesJ2').classList.add('visible');
                document.getElementById('selectorDificultad').style.display = 'none';
            } else {
                document.getElementById('controlesJ2').classList.remove('visible');
                document.getElementById('selectorDificultad').style.display = 'flex';
            }
        });
    });

    buclePrincipal();
})();