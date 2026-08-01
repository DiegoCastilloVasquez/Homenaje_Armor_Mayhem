// ============================================================
// DATOS DEL MAPA (plataformas y puntos de reaparición)
//
// Arena abierta con 3 niveles + techo. Las plataformas tienen un
// tamaño mediano (200-380px) y están repartidas uniformemente por
// todo el ancho del mapa (x=30 a x=1890). Cada plataforma superior
// está desplazada lateralmente respecto a su soporte, dejando un
// voladizo (zona franca de salto) de 90-220px para subir en
// diagonal sin chocar jamás con la parte inferior de la plataforma
// superior. Saltos de 100-110px (máx. del juego ~163px) y espacio
// libre de 80px bajo cada plataforma (> altura del jugador, 60px).
// ============================================================
import { MAPA_ANCHO, MAPA_ALTO } from './constants.js';
import { Plataforma } from './objects/Platform.js';

export function crearPlataformas() {
    return [
        // Suelo principal
        new Plataforma({ x: 0, y: MAPA_ALTO - 50, ancho: MAPA_ANCHO, alto: 50 }),

        // ===== Nivel 1 (tope 640) — accesible desde el suelo (Δy 110) =====
        new Plataforma({ x: 30, y: 640, ancho: 370, alto: 20 }),   // P1 izquierda [30-400]
        new Plataforma({ x: 760, y: 640, ancho: 380, alto: 20 }),  // P1 central [760-1140]
        new Plataforma({ x: 1520, y: 640, ancho: 370, alto: 20 }), // P1 derecha [1520-1890]

        // ===== Nivel 2 (tope 540) — accesible desde el nivel 1 (Δy 100) =====
        new Plataforma({ x: 180, y: 540, ancho: 340, alto: 20 }),  // P2 izquierda [180-520]
        new Plataforma({ x: 850, y: 540, ancho: 220, alto: 20 }),  // P2 central [850-1070]
        new Plataforma({ x: 1400, y: 540, ancho: 340, alto: 20 }), // P2 derecha [1400-1740]

        // ===== Nivel 3 (tope 440) — accesible desde el nivel 2 (Δy 100) =====
        new Plataforma({ x: 60, y: 440, ancho: 240, alto: 20 }),   // P3 izquierda [60-300]
        new Plataforma({ x: 680, y: 440, ancho: 260, alto: 20 }),  // P3 central [680-940]
        new Plataforma({ x: 1620, y: 440, ancho: 240, alto: 20 }), // P3 derecha [1620-1860]

        // ===== Techo (tope 340) — accesible desde el nivel 3 (Δy 100) =====
        new Plataforma({ x: 830, y: 340, ancho: 260, alto: 20 }),  // TECHO [830-1090]
    ];
}

// Puntos de reaparición: sobre superficies válidas y en zonas sin
// plataforma encima (altura de entidad = 60px).
export const puntosDeReaparicion = [
    { x: 100, y: 580 },   // P1 izquierda (zona sin techo encima)
    { x: 790, y: 580 },   // P1 central (fuera del solape con P2)
    { x: 1800, y: 580 },  // P1 derecha (zona sin techo encima)
    { x: 420, y: 480 },   // P2 izquierda (zona sin techo encima)
    { x: 1000, y: 480 },  // P2 central (fuera del solape con P3)
    { x: 1500, y: 480 },  // P2 derecha (zona sin techo encima)
    { x: 750, y: 380 },   // P3 central (fuera del solape con TECHO)
    { x: 950, y: 280 },   // TECHO central
];