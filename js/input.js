// ============================================================
// CLASE INPUT (manejo del teclado y ratón)
// ============================================================
export class Input {
    constructor() {
        this.teclas = {};

        // Teclas P1 (WASD + disparo S)
        this.teclasP1 = {
            izquierda: { presionada: false, codigo: 'KeyA' },
            derecha: { presionada: false, codigo: 'KeyD' },
            saltar: { presionada: false, codigo: 'KeyW' },
            disparar: { presionada: false, codigo: 'KeyS' }
        };

        // Teclas P2 (IJKL + disparo K)
        this.teclasP2 = {
            izquierda: { presionada: false, codigo: 'KeyJ' },
            derecha: { presionada: false, codigo: 'KeyL' },
            saltar: { presionada: false, codigo: 'KeyI' },
            disparar: { presionada: false, codigo: 'KeyK' }
        };

        // Rotación de apuntado P1 (Q antihorario, E horario)
        this.teclasRotacionP1 = {
            antihorario: { presionada: false, codigo: 'KeyQ' },
            horario: { presionada: false, codigo: 'KeyE' }
        };

        // Rotación de apuntado P2 (U antihorario, O horario)
        this.teclasRotacionP2 = {
            antihorario: { presionada: false, codigo: 'KeyU' },
            horario: { presionada: false, codigo: 'KeyO' }
        };

        // Estado del ratón
        this.raton = { x: 0, y: 0, presionado: false };
    }

    configurarEventos(estadoJuego, camara, lienzo, refs) {
        const self = this;

        document.addEventListener('keydown', (e) => {
            const tecla = e.code;
            self.teclas[tecla] = true;

            // P1
            if (tecla === self.teclasP1.izquierda.codigo) self.teclasP1.izquierda.presionada = true;
            if (tecla === self.teclasP1.derecha.codigo) self.teclasP1.derecha.presionada = true;
            if (tecla === self.teclasP1.saltar.codigo) self.teclasP1.saltar.presionada = true;
            if (tecla === self.teclasP1.disparar.codigo) self.teclasP1.disparar.presionada = true;

            // P2
            if (tecla === self.teclasP2.izquierda.codigo) self.teclasP2.izquierda.presionada = true;
            if (tecla === self.teclasP2.derecha.codigo) self.teclasP2.derecha.presionada = true;
            if (tecla === self.teclasP2.saltar.codigo) self.teclasP2.saltar.presionada = true;
            if (tecla === self.teclasP2.disparar.codigo) self.teclasP2.disparar.presionada = true;

            // Rotación apuntado P1
            if (tecla === self.teclasRotacionP1.antihorario.codigo) self.teclasRotacionP1.antihorario.presionada = true;
            if (tecla === self.teclasRotacionP1.horario.codigo) self.teclasRotacionP1.horario.presionada = true;

            // Rotación apuntado P2
            if (tecla === self.teclasRotacionP2.antihorario.codigo) self.teclasRotacionP2.antihorario.presionada = true;
            if (tecla === self.teclasRotacionP2.horario.codigo) self.teclasRotacionP2.horario.presionada = true;

            // Saltos
            if (tecla === self.teclasP1.saltar.codigo && refs.jugador && estadoJuego.pantalla === 'jugando') {
                e.preventDefault();
                refs.jugador.saltar();
            }
            if (tecla === self.teclasP2.saltar.codigo && refs.jugador2 && estadoJuego.pantalla === 'jugando') {
                e.preventDefault();
                refs.jugador2.saltar();
            }
            if (tecla === 'KeyW' || tecla === 'KeyI') {
                e.preventDefault();
            }
        });

        document.addEventListener('keyup', (e) => {
            const tecla = e.code;
            self.teclas[tecla] = false;

            // P1
            if (tecla === self.teclasP1.izquierda.codigo) self.teclasP1.izquierda.presionada = false;
            if (tecla === self.teclasP1.derecha.codigo) self.teclasP1.derecha.presionada = false;
            if (tecla === self.teclasP1.saltar.codigo) self.teclasP1.saltar.presionada = false;
            if (tecla === self.teclasP1.disparar.codigo) self.teclasP1.disparar.presionada = false;

            // P2
            if (tecla === self.teclasP2.izquierda.codigo) self.teclasP2.izquierda.presionada = false;
            if (tecla === self.teclasP2.derecha.codigo) self.teclasP2.derecha.presionada = false;
            if (tecla === self.teclasP2.saltar.codigo) self.teclasP2.saltar.presionada = false;
            if (tecla === self.teclasP2.disparar.codigo) self.teclasP2.disparar.presionada = false;

            // Rotación apuntado P1
            if (tecla === self.teclasRotacionP1.antihorario.codigo) self.teclasRotacionP1.antihorario.presionada = false;
            if (tecla === self.teclasRotacionP1.horario.codigo) self.teclasRotacionP1.horario.presionada = false;

            // Rotación apuntado P2
            if (tecla === self.teclasRotacionP2.antihorario.codigo) self.teclasRotacionP2.antihorario.presionada = false;
            if (tecla === self.teclasRotacionP2.horario.codigo) self.teclasRotacionP2.horario.presionada = false;
        });

        document.addEventListener('mousemove', (e) => {
            const rect = lienzo.getBoundingClientRect();
            self.raton.x = (e.clientX - rect.left) + (camara?.x || 0);
            self.raton.y = (e.clientY - rect.top) + (camara?.y || 0);
        });

        document.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                self.raton.presionado = true;
            }
        });

        document.addEventListener('mouseup', (e) => {
            if (e.button === 0) {
                self.raton.presionado = false;
            }
        });

        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
}