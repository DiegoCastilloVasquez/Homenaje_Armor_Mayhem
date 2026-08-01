// ============================================================
// HUD (Interfaz de usuario en el juego)
// ============================================================
export function dibujarHUD(ctx, lienzo, jugador, jugador2, enemigo, estadoJuego, modoJuego) {
    const anchoBarra = 200;
    const altoBarra = 20;
    const margen = 20;
    const espaciado = 30;

    ctx.save();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.font = 'bold 14px Consolas';

    // Barra de salud del jugador
    const proporcionSalud = jugador.salud / jugador.saludMaxima;
    ctx.fillStyle = '#333';
    ctx.fillRect(margen, margen, anchoBarra, altoBarra);
    ctx.fillStyle = proporcionSalud > 0.5 ? '#2ecc71' : proporcionSalud > 0.25 ? '#f39c12' : '#e74c3c';
    ctx.fillRect(margen + 2, margen + 2, (anchoBarra - 4) * proporcionSalud, altoBarra - 4);
    ctx.strokeRect(margen, margen, anchoBarra, altoBarra);
    ctx.fillStyle = '#fff';
    ctx.fillText(`P1: ${jugador.salud}/${jugador.saludMaxima}`, margen + 5, margen + 15);

    // Frags del jugador
    ctx.fillStyle = '#f1c40f';
    ctx.fillText(`Frags: ${estadoJuego.frags.jugador}`, margen, margen + altoBarra + 20);

    if (modoJuego === '2j' && jugador2) {
        const proporcionSalud2 = jugador2.salud / jugador2.saludMaxima;
        ctx.fillStyle = '#333';
        ctx.fillRect(lienzo.width - margen - anchoBarra, margen, anchoBarra, altoBarra);
        ctx.fillStyle = proporcionSalud2 > 0.5 ? '#2ecc71' : proporcionSalud2 > 0.25 ? '#f39c12' : '#e74c3c';
        ctx.fillRect(lienzo.width - margen - anchoBarra + 2, margen + 2, (anchoBarra - 4) * proporcionSalud2, altoBarra - 4);
        ctx.strokeRect(lienzo.width - margen - anchoBarra, margen, anchoBarra, altoBarra);
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'right';
        ctx.fillText(`P2: ${jugador2.salud}/${jugador2.saludMaxima}`, lienzo.width - margen - 5, margen + 15);

        ctx.fillStyle = '#f1c40f';
        ctx.fillText(`Frags: ${estadoJuego.frags.jugador2}`, lienzo.width - margen, margen + altoBarra + 20);
        ctx.textAlign = 'left';
    } else if (enemigo) {
        const proporcionSaludEnemigo = enemigo.salud / enemigo.saludMaxima;
        ctx.fillStyle = '#333';
        ctx.fillRect(lienzo.width - margen - anchoBarra, margen, anchoBarra, altoBarra);
        ctx.fillStyle = proporcionSaludEnemigo > 0.5 ? '#2ecc71' : proporcionSaludEnemigo > 0.25 ? '#f39c12' : '#e74c3c';
        ctx.fillRect(lienzo.width - margen - anchoBarra + 2, margen + 2, (anchoBarra - 4) * proporcionSaludEnemigo, altoBarra - 4);
        ctx.strokeRect(lienzo.width - margen - anchoBarra, margen, anchoBarra, altoBarra);
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'right';
        ctx.fillText(`BOT: ${enemigo.salud}/${enemigo.saludMaxima}`, lienzo.width - margen - 5, margen + 15);

        ctx.fillStyle = '#f1c40f';
        ctx.fillText(`Frags: ${estadoJuego.frags.enemigo}`, lienzo.width - margen, margen + altoBarra + 20);
        ctx.textAlign = 'left';
    }

    ctx.restore();
}