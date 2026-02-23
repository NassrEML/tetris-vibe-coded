Perfecto. Con tus respuestas ya podemos cerrar descubrimiento.
No necesito más preguntas. Vamos a formalizar esto correctamente.

---

# 📄 PRODUCT REQUIREMENTS DOCUMENT (PRD)

## Tetris NES 1989 – Reimplementación limpia con físicas originales

---

# 1️⃣ VISIÓN DEL PRODUCTO

Reimplementación fiel del **Tetris NES (1989)**:

* Reglas exactas
* Física exacta
* Randomizer exacto
* Frame timing exacto (60 FPS modelado)
* Sin bugs históricos
* Sin mejoras modernas
* Sin hard drop
* Sin wall kicks
* Sin SRS
* Sin multiplayer
* Solo A-Type
* Solo teclado
* UI pixel perfect fija

Arquitectura: MVC
Stack: Vite + JS Vanilla + CSS Custom Properties + HTML + Vitest
Testing: 100% cobertura dominio

---

# 2️⃣ ALCANCE FUNCIONAL

Incluye:

* Title Screen
* Level Select
* Gameplay Screen
* Game Over Screen
* Next piece
* Score
* Level
* Lines
* High score persistente (localStorage)
* Animación subida stack al perder

No incluye:

* Música
* Sonido
* Multiplayer
* Responsive
* Hard drop
* T-Spins

---

# 3️⃣ DOMINIO DEL JUEGO (ESPECIFICACIÓN FORMAL)

---

## 3.1 Board

* 10 columnas × 20 filas visibles
* 2 filas ocultas superiores para spawn

### Criterios de aceptación

* Board siempre mantiene dimensiones constantes
* No permite escritura fuera de límites
* Estado es inmutable en cada transición
* Clear de líneas elimina filas completas y desplaza hacia abajo

Tests:

* Clear de 1,2,3,4 líneas
* Clear en fila superior
* Clear múltiple con huecos arriba
* Board nunca muta estado anterior

---

## 3.2 Tetrominos

7 piezas:

* I
* O
* T
* S
* Z
* J
* L

Spawn position exacta NES.

### Criterios

* Spawn centrado correcto
* Orientación inicial correcta
* Colisión al spawn → Game Over
* Coordenadas exactas verificadas por test

---

## 3.3 Sistema de rotación (NES original)

* Rotación simple
* Sin wall kicks
* Si colisiona → rotación cancelada
* Sin floor kick
* Sin T-spin logic

### Criterios

* Rotación válida actualiza estado
* Rotación inválida no cambia estado
* Rotación en borde falla si sale
* Rotación contra bloque falla

Tests exhaustivos por pieza y orientación.

---

## 3.4 Randomizer NES exacto

Se implementará el algoritmo original (LCG similar al usado en NES).

Requisitos:

* Seed configurable
* Determinista en tests
* Permite repeticiones
* No usa 7-bag

### Criterios

* Dada seed X → secuencia siempre igual
* Distribución permite repeticiones
* No hay garantía de las 7 piezas en ciclo

---

## 3.5 Gravedad y Frames

Modelo:

* 60 FPS lógico
* Frame counter interno
* Tabla original NES de caída por nivel
* No delta time
* Sistema basado en ticks

Tick-based significa:
Cada frame se ejecuta una transición discreta del estado.

### Criterios

* Nivel 0: caída según tabla original
* Cambio de velocidad al subir nivel
* No depende de rendimiento del navegador
* Frame counter testeable

---

## 3.6 Movimiento lateral

Controles:

* A → izquierda
* D → derecha

Implementación DAS NES:

* Delay inicial
* Auto repeat

### Criterios

* Tap mueve 1 celda
* Mantener activa DAS
* Respeta colisiones
* No atraviesa bloques

---

## 3.7 Rotación

* Flecha arriba y flecha abajo (confirmar: ambas rotan mismo sentido?)
  ⚠️ NES tenía un botón solo

Asumo:

* Flecha izquierda = rotate CCW
* Flecha derecha = rotate CW

Confírmame esto si quieres más precisión.

---

## 3.8 Soft Drop

* Solo soft drop
* Sin hard drop
* Suma puntos según NES

### Criterios

* Soft drop acelera
* Puntúa correctamente
* No altera lógica de gravedad base

---

## 3.9 Locking

* Lock inmediato al tocar suelo
* Sin lock delay moderno

### Criterios

* Colisión abajo → lock instantáneo
* No permite micro-movimiento post colisión

---

## 3.10 Line Clear

* Detecta filas completas
* Animación visual
* Board colapsa

Tests:

* 1–4 líneas
* Clear simultáneo
* Score correcto

---

## 3.11 Score

Tabla original:

| Líneas | Puntos       |
| ------ | ------------ |
| 1      | 40 × level   |
| 2      | 100 × level  |
| 3      | 300 × level  |
| 4      | 1200 × level |

Nivel incrementa cada 10 líneas.

### Criterios

* Score correcto por combinación
* Nivel incrementa correctamente
* Overflow no replicado (limpio)

---

## 3.12 Game Over

Se activa si:

* Spawn colisiona

Incluye:

* Animación subida stack
* Pantalla Game Over
* Posibilidad de introducir nombre

---

# 4️⃣ ARQUITECTURA MVC

---

## MODEL (Dominio puro)

Inmutable.

Estructura:

```
/domain
  board.ts
  piece.ts
  rotation.ts
  collision.ts
  gravity.ts
  randomizer.ts
  scoring.ts
  gameState.ts
```

GameState:

```
{
  board,
  currentPiece,
  nextPiece,
  score,
  level,
  lines,
  frameCounter,
  status (title | playing | gameover)
}
```

Sin dependencia DOM.

---

## CONTROLLER

```
/controller
  gameLoop.ts
  inputController.ts
  gameController.ts
```

* GameLoop controla frames
* InputController traduce eventos
* GameController aplica acciones al modelo

---

## VIEW

DOM grid:

* 10×20 celdas
* Render basado en diff
* CSS custom properties para colores NES

```
/view
  renderer.ts
  screens.ts
```

---

# 5️⃣ TESTING STRATEGY

Vitest

---

## Unit Tests (100% dominio)

* Board
* Line clear
* Colisiones
* Rotaciones
* Randomizer con seed
* Scoring
* Level progression
* Gravity timing
* Locking

Cobertura requerida: 100% dominio.

---

## Integration Tests

Simulación:

* Seed fija
* Secuencia inputs
* Estado final esperado

Ejemplo:

```
Given seed 123
When sequence A,A,Rotate,SoftDrop...
Then board equals snapshot esperado
```

---

# 6️⃣ ESTRUCTURA DE PROYECTO

```
src/
  domain/
  controller/
  view/
  main.ts

tests/
  unit/
  integration/
```

---

# 7️⃣ DEFINICIÓN DE DONE

✔ 100% cobertura dominio
✔ Todas reglas NES verificadas por test
✔ Juego completo jugable
✔ Determinismo verificado
✔ Sin glitches detectables
✔ PRD criterios aceptación cumplidos

---

# 8️⃣ BACKLOG COMPLETO ORDENADO

FASE 1 – Setup

1. Crear proyecto Vite
2. Configurar Vitest
3. Configurar estructura MVC
4. Configurar coverage 100%

---

FASE 2 – Dominio Base

5. Implementar modelo Board inmutable
6. Tests board boundaries
7. Implementar Tetrominos
8. Tests spawn y coordenadas
9. Implementar colisiones
10. Tests colisión exhaustivos

---

FASE 3 – Rotaciones NES

11. Implementar sistema rotación simple
12. Tests rotación válida/inválida
13. Tests borde y colisión

---

FASE 4 – Randomizer NES

14. Implementar RNG exacto con seed
15. Tests determinismo
16. Tests distribución básica

---

FASE 5 – Gravedad

17. Implementar frame counter
18. Implementar tabla velocidad NES
19. Tests velocidad por nivel
20. Tests independencia rendimiento

---

FASE 6 – Movimiento + DAS

21. Implementar movimiento lateral
22. Implementar DAS
23. Tests tap vs hold
24. Tests bloqueo lateral

---

FASE 7 – Locking

25. Implementar lock inmediato
26. Tests colisión inferior
27. Tests sin lock delay

---

FASE 8 – Line Clear + Score

28. Implementar clear
29. Tests 1–4 líneas
30. Implementar scoring
31. Tests puntuación
32. Implementar level up
33. Tests level progression

---

FASE 9 – Game Over

34. Detectar spawn colisión
35. Tests game over
36. Implementar animación stack
37. Tests transición estado

---

FASE 10 – Controller

38. Implementar GameLoop 60fps
39. Implementar InputController
40. Tests integración básicos

---

FASE 11 – View

41. Crear grid DOM
42. Render piezas
43. Render next piece
44. Render score/level/lines
45. Pantalla título
46. Pantalla level select
47. Pantalla game over

---

FASE 12 – Integración final

48. Test integración completo partida
49. Verificar determinismo total
50. Refactor final
51. Validar 100% coverage
52. QA manual completa

---

Si quieres, siguiente paso:

* Te genero la ESPECIFICACIÓN TÉCNICA DEL RANDOMIZER NES exacto
* O empezamos con el diseño formal del dominio (modelado matemático del GameState)

Tu decides cómo quieres avanzar.
