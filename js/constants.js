// ============================================================
// CONSTANTES DEL JUEGO
// ============================================================

export const MAPA_ANCHO = 1920;
export const MAPA_ALTO = 800;

export const GRAVEDAD = 0.6;
export const VEL_SALTO = -14;
export const ACELERACION = 1;
export const FRICCION_SUELO = 0.85;
export const FRICCION_AIRE = 0.95;
export const VEL_PROYECTIL = 15;
export const VEL_ROTACION = 0.05;
export const RADIO_APUNTADO = 60;
export const LIMITE_FRAGS = 5;
export const VELOCIDAD_MAX = 5;

export const CONFIG_DIFICULTAD = {
    facil: {
        velocidad: 1.5,
        cadencia: 25,
        precision: 0.6,
        daño: 8,
        reaccion: 20,
        strafeIntervalo: 180,
        saltoProbabilidad: 0.03,
        esquiveProbabilidad: 0.4,
        retiradaUmbral: 20
    },
    medio: {
        velocidad: 2,
        cadencia: 15,
        precision: 0.8,
        daño: 10,
        reaccion: 15,
        strafeIntervalo: 120,
        saltoProbabilidad: 0.05,
        esquiveProbabilidad: 0.6,
        retiradaUmbral: 30
    },
    dificil: {
        velocidad: 3.5,
        cadencia: 8,
        precision: 0.95,
        daño: 12,
        reaccion: 5,
        strafeIntervalo: 70,
        saltoProbabilidad: 0.1,
        esquiveProbabilidad: 0.85,
        retiradaUmbral: 40
    }
};