# 🎮 Tetris NES 1989

Reimplementación fiel del Tetris NES (1989) con físicas, reglas y comportamiento exactos al original.

[![Tests](https://img.shields.io/badge/tests-632%20passing-brightgreen)](https://github.com/NassrEML/tetris-vibe-coded)
[![Coverage](https://img.shields.io/badge/coverage-99.46%25-brightgreen)](https://github.com/NassrEML/tetris-vibe-coded)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

> **A-Type Only** | **No Wall Kicks** | **No Hard Drop** | **NES Physics Exact**

---

## 🚀 Inicio Rápido

```bash
# Clonar e instalar
git clone https://github.com/NassrEML/tetris-vibe-coded.git
cd tetris-vibe-coded
npm install

# Iniciar juego
npm run dev
```

Abrir [http://localhost:5173](http://localhost:5173)

---

## 🎮 Controles

| Tecla | Acción |
|-------|--------|
| **A** | Mover izquierda |
| **D** | Mover derecha |
| **←** | Rotar (anti-horario) |
| **→** | Rotar (horario) |
| **↓** | Soft Drop |
| **Enter** | Iniciar / Confirmar |
| **P** | Pausar |
| **R** | Volver |

---

## 📖 Documentación Completa

📄 **[Ver Guía de Uso Completa (USAGE.md)](USAGE.md)**

Incluye:
- Instalación detallada
- Todas las mecánicas del juego
- Sistema de puntuación
- Tabla de velocidad por nivel
- Arquitectura MVC
- Desarrollo y testing

---

## ✨ Características

- ✅ **632 tests** pasando (100% éxito)
- ✅ **99.46% cobertura** de código
- ✅ **60 FPS** lógico exacto
- ✅ **RNG NES** con seed (determinista)
- ✅ **DAS** (16 frames delay, 6 frames ARR)
- ✅ **Sin wall kicks** (comportamiento NES puro)
- ✅ **High Score** persistente (localStorage)
- ✅ **Animación** Game Over (stack llenándose)

---

## 🏗️ Arquitectura

```
src/
├── domain/      ← Lógica pura (100% testeada)
├── controller/  ← GameLoop + Input
└── view/        ← DOM + CSS NES-style
```

**Stack:** Vite + JavaScript Vanilla + Vitest

---

## 📦 Scripts

```bash
npm run dev       # Servidor desarrollo
npm test          # Ejecutar tests
npm run coverage  # Ver cobertura
npm run build     # Build producción
```

---

## 📋 Requisitos Cumplidos (PRD)

- [x] 100% cobertura dominio
- [x] Reglas NES verificadas por test
- [x] Juego completo jugable
- [x] Determinismo verificado
- [x] Sin glitches detectables
- [x] Físicas exactas NES 1989

---

## 📝 Licencia

MIT License - Ver [LICENSE](LICENSE)

---

**¡Presiona Enter y juega!** 🎮
