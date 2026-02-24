# 🎮 Tetris NES 1989 - Guía de Uso

Reimplementación fiel del Tetris NES (1989) con físicas, reglas y comportamiento exactos al original.

---

## 📋 Índice

1. [Inicio Rápido](#inicio-rápido)
2. [Controles](#controles)
3. [Pantallas del Juego](#pantallas-del-juego)
4. [Mecánicas del Juego](#mecánicas-del-juego)
5. [Sistema de Puntuación](#sistema-de-puntuación)
6. [Niveles y Velocidad](#niveles-y-velocidad)
7. [High Score](#high-score)
8. [Desarrollo](#desarrollo)
9. [Arquitectura](#arquitectura)

---

## 🚀 Inicio Rápido

### Requisitos
- Node.js 18+
- Navegador moderno (Chrome, Firefox, Safari, Edge)

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/NassrEML/tetris-vibe-coded.git
cd tetris-vibe-coded

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

Abrir navegador en `http://localhost:5173`

### Build para Producción

```bash
npm run build
```

Los archivos se generan en la carpeta `dist/`

---

## 🎮 Controles

### Teclas de Juego

| Tecla | Acción |
|-------|--------|
| **A** | Mover pieza a la izquierda |
| **D** | Mover pieza a la derecha |
| **← (Flecha Izquierda)** | Rotar pieza (sentido anti-horario) |
| **→ (Flecha Derecha)** | Rotar pieza (sentido horario) |
| **↓ (Flecha Abajo)** | Soft Drop (acelerar caída) |
| **Enter** | Iniciar juego / Confirmar |
| **P** | Pausar / Reanudar |
| **R** | Volver (Game Over → Title, etc.) |

### Comportamiento DAS (Delayed Auto Shift)

- **Tap**: Mueve la pieza 1 celda
- **Mantener**: Después de 16 frames (~267ms), comienza el auto-repeat
- **Auto-repeat**: Mueve la pieza cada 6 frames (~100ms)

Este comportamiento replica exactamente el DAS del NES original.

---

## 🖥️ Pantallas del Juego

### 1. Title Screen (Pantalla de Título)

![Title Screen](docs/screens/title.png)

- Muestra el logo "TETRIS NES 1989"
- Presiona **ENTER** para continuar

### 2. Level Select (Selección de Nivel)

![Level Select](docs/screens/level-select.png)

- Usa **A** / **D** para seleccionar nivel inicial (0-20)
- Presiona **ENTER** para comenzar
- Nivel más alto = piezas caen más rápido

### 3. Game Screen (Pantalla de Juego)

```
┌─────────────────────────────┐
│  TETRIS NES 1989           │
│                             │
│  ┌──────────┐  ┌────────┐  │
│  │          │  │ NEXT   │  │
│  │          │  │  [O]   │  │
│  │   [■]    │  │        │  │
│  │   [■]    │  └────────┘  │
│  │   [■][■] │              │
│  │          │  SCORE: 0000 │
│  │          │  LEVEL: 05  │
│  │          │  LINES: 012  │
│  └──────────┘              │
│                             │
│  HIGH: 5000    A:← D:→     │
│                ↓:SOFT       │
└─────────────────────────────┘
```

**Elementos visibles:**
- **Board**: Área de juego 10×20 celdas
- **Next**: Muestra la siguiente pieza
- **Score**: Puntuación actual
- **Level**: Nivel actual (afecta velocidad)
- **Lines**: Líneas completadas
- **High Score**: Mejor puntuación (persistente)

### 4. Game Over Screen (Pantalla de Game Over)

- Muestra animación del stack llenándose desde abajo
- Muestra puntuación final
- Presiona **R** para volver al título
- High score se guarda automáticamente

### 5. Pause Screen (Pantalla de Pausa)

- Presiona **P** para pausar en cualquier momento
- Muestra "PAUSED" superpuesto
- Presiona **P** nuevamente para continuar

---

## 🧩 Mecánicas del Juego

### Piezas (Tetrominos)

El juego incluye las 7 piezas clásicas:

| Pieza | Color | Forma |
|-------|-------|-------|
| **I** | Cyan | `████` (línea) |
| **O** | Amarillo | `██` `██` (cuadrado) |
| **T** | Púrpura | ` █ ` `███` |
| **S** | Verde | ` ██` `██ ` |
| **Z** | Rojo | `██ ` ` ██` |
| **J** | Azul | `█  ` `███` |
| **L** | Naranja | `  █` `███` |

### Sistema de Rotación (NES)

- **Sin wall kicks**: Si la rotación causaría colisión, se cancela
- **Sin T-spins**: Rotaciones simples sin lógica especial
- 4 estados de rotación por pieza (excepto O que no rota)

### Gravedad y Caída

- **Gravedad natural**: Velocidad según nivel (ver tabla abajo)
- **Soft Drop**: Presiona ↓ para caer más rápido (+1 punto por celda)
- **Sin Hard Drop**: No hay caída instantánea
- **Locking inmediato**: La pieza se bloquea al tocar el suelo

### Colisiones

- Paredes laterales: La pieza no atraviesa
- Suelo: Bloqueo inmediato
- Otras piezas: Colisión estándar
- **Sin comportamientos modernos** (no SRS, no wall kicks)

### Limpieza de Líneas

Cuando se completan líneas horizontales:
- 1 línea: 40 × nivel puntos
- 2 líneas: 100 × nivel puntos
- 3 líneas: 300 × nivel puntos
- 4 líneas (Tetris): 1200 × nivel puntos

Las líneas completas desaparecen y las superiores caen.

### Game Over

El juego termina cuando:
- Una nueva pieza no puede spawnear (colisión inmediata)
- Se muestra animación de stack llenándose

---

## 💯 Sistema de Puntuación

### Puntos por Líneas

| Líneas | Fórmula | Ejemplo (Nivel 5) |
|--------|---------|-------------------|
| 1 | 40 × level | 200 puntos |
| 2 | 100 × level | 500 puntos |
| 3 | 300 × level | 1500 puntos |
| 4 | 1200 × level | 6000 puntos |

### Puntos por Soft Drop

Cada celda que caes con soft drop: **+1 punto**

### Ejemplo de Partida

```
Inicio: Nivel 0, Score 0

1. Colocas pieza + Soft drop 5 celdas → Score: 5
2. Haces 1 línea → Score: 5 + (40 × 0) = 5
3. Llegas a 10 líneas → Nivel 1
4. Haces Tetris (4 líneas) → Score: 5 + (1200 × 1) = 1205
```

---

## ⚡ Niveles y Velocidad

### Progresión de Nivel

- **Subir de nivel**: Cada 10 líneas completadas
- **Máximo**: Nivel 20+

### Tabla de Velocidad (Frames por Celda)

| Nivel | Frames | ~ms por celda |
|-------|--------|---------------|
| 0 | 48 | 800ms |
| 1 | 43 | 717ms |
| 2 | 38 | 633ms |
| 3 | 33 | 550ms |
| 4 | 28 | 467ms |
| 5 | 23 | 383ms |
| 6 | 18 | 300ms |
| 7 | 13 | 217ms |
| 8 | 8 | 133ms |
| 9 | 6 | 100ms |
| 10 | 5 | 83ms |
| 11 | 5 | 83ms |
| 12 | 5 | 83ms |
| 13+ | 1-5 | Variable |

**Nota**: A nivel 20+, el juego es extremadamente rápido (~50ms por celda).

---

## 🏆 High Score

### Persistencia

- El high score se guarda automáticamente en `localStorage`
- Se muestra en todas las pantallas de juego
- Se actualiza al terminar cada partida

### Formato Almacenado

```javascript
localStorage.setItem('tetris-nes-highscore', '5000');
```

### Visualización

```
┌──────────────┐
│ HIGH: 5000   │  ← Mejor puntuación histórica
│ SCORE: 1200  │  ← Puntuación actual
└──────────────┘
```

---

## 💻 Desarrollo

### Scripts Disponibles

```bash
# Servidor de desarrollo con hot reload
npm run dev

# Ejecutar tests unitarios e integración
npm test

# Ver cobertura de código
npm run coverage

# Build para producción
npm run build

# Preview del build
npm run preview
```

### Tests

- **632 tests** implementados
- **99.46% cobertura** en dominio
- Tests unitarios: Lógica pura del juego
- Tests de integración: Flujos completos
- Tests de determinismo: Verificación de reproducibilidad

### Ejecutar Tests Específicos

```bash
# Tests de board
npm test -- board.test.js

# Tests de piezas
npm test -- piece.test.js

# Tests de integración
npm test -- integration/
```

---

## 🏗️ Arquitectura

### Estructura MVC

```
src/
├── domain/           ← Lógica pura (inmutable)
│   ├── board.js      ← Tablero 10×22
│   ├── piece.js      ← Tetrominos y rotaciones
│   ├── collision.js  ← Detección de colisiones
│   ├── rotation.js   ← Sistema de rotación NES
│   ├── randomizer.js ← RNG con seed
│   ├── gravity.js    ← Velocidad de caída
│   ├── das.js        ← Delayed Auto Shift
│   ├── lock.js       ← Bloqueo de piezas
│   ├── scoring.js    ← Sistema de puntuación
│   ├── level.js      ← Progresión de nivel
│   ├── gameState.js  ← Estado del juego
│   └── gameOver.js   ← Detección de fin
│
├── controller/       ← Controladores
│   ├── inputController.js  ← Teclado
│   ├── gameLoop.js         ← Loop 60 FPS
│   └── gameController.js   ← Orquestación
│
├── view/             ← Vista (DOM)
│   ├── renderer.js   ← Renderizado
│   ├── screens.js    ← Pantallas
│   └── style.css     ← Estilos NES
│
└── main.js           ← Entry point

tests/
├── unit/             ← Tests unitarios (116)
└── integration/      ← Tests integración (74)
```

### Principios

1. **Dominio puro**: Todo el estado es inmutable
2. **Determinista**: Mismo seed = misma secuencia de piezas
3. **Testeable**: 100% cobertura en dominio
4. **Fiel al NES**: Sin mejoras modernas

### Características Implementadas

- ✅ 60 FPS lógico
- ✅ Randomizer NES exacto (LCG)
- ✅ DAS (16 frames delay, 6 frames ARR)
- ✅ Tabla de gravedad NES
- ✅ Scoring NES (40/100/300/1200)
- ✅ Spawn positions exactos
- ✅ Colisiones simples (no wall kicks)
- ✅ Locking inmediato

### Características NO Implementadas (por diseño)

- ❌ Wall kicks
- ❌ Hard drop
- ❌ Hold piece
- ❌ Ghost piece
- ❌ T-spins
- ❌ SRS (Super Rotation System)
- ❌ Multiplayer
- ❌ Sonido/Música
- ❌ Responsive (UI fija)

---

## 🐛 Troubleshooting

### El juego no carga

1. Verificar Node.js 18+: `node --version`
2. Reinstalar dependencias: `rm -rf node_modules && npm install`
3. Verificar puerto 5173 disponible

### Tests fallan

```bash
# Limpiar caché de Vitest
npm test -- --clearCache

# Ejecutar con más detalle
npm test -- --reporter=verbose
```

### Cobertura baja

```bash
# Ver reporte detallado
npm run coverage

# Abrir coverage/index.html en navegador
```

---

## 📚 Recursos

### Referencias Técnicas NES

- [Tetris Wiki - NES](https://tetris.wiki/Tetris_(NES,_Nintendo))
- [Tetris Concept - DAS](https://tetrisconcept.net/wiki/DAS)
- [NES Tetris RNG Analysis](https://tetris.wiki/Tetris_(NES,_Nintendo)#Randomizer)

### Especificaciones Implementadas

- Board: 10×20 visible + 2 hidden rows
- Frame timing: 60 FPS (16.67ms por frame)
- DAS Delay: 16 frames (~267ms)
- DAS ARR: 6 frames (~100ms)
- Velocidad máxima: Nivel 20+ (~1 frame por celda)

---

## 📝 Licencia

MIT License - Ver archivo LICENSE

---

## 🎮 ¡Diviértete Jugando!

Este proyecto busca preservar la experiencia exacta del Tetris NES de 1989. Cada detalle, desde el timing de los frames hasta el comportamiento del RNG, ha sido cuidadosamente implementado para ofrecer la experiencia más auténtica posible en un navegador moderno.

**¡Buena suerte consiguiendo ese Tetris en nivel 20!** 🏆

---

*Última actualización: Febrero 2024*
