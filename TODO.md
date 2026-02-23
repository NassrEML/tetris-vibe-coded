# Tetris NES 1989 Reimplementation - Todo List

## COMPLETED FASES

### FASE 1-2: Foundation ✓
- [x] Project setup
- [x] Domain structure
- [x] Board module (10x22 grid)
- [x] Piece definitions (7 tetrominoes)

### FASE 3: Rotation System ✓
- [x] NES rotation logic
- [x] No wall kicks
- [x] 4 rotation states per piece
- [x] 100% test coverage

### FASE 4: Collision Detection ✓
- [x] NES collision (no wall kicks)
- [x] Simple collision checking
- [x] Spawn area validation
- [x] 100% test coverage

### FASE 5: Gravity System ✓
- [x] NES gravity table (levels 0-20)
- [x] Frame-based timing (60 FPS)
- [x] Level-based speed scaling
- [x] 100% test coverage

### FASE 6: Movimiento Lateral + DAS ✓
- [x] DAS module (das.js)
- [x] NES DAS timing (16 frame delay, 6 frame ARR)
- [x] Controls: A=left, D=right
- [x] Lateral movement with collision
- [x] Auto-repeat logic
- [x] 97.87% test coverage (one defensive line uncovered)

### FASE 7: Locking ✓
- [x] Lock module (lock.js)
- [x] Immediate lock (NES style)
- [x] No modern lock delay
- [x] Lock + clear lines
- [x] 96.96% test coverage (one defensive line uncovered)

### FASE 8: Line Clear + Score + Level Progression ✓
- [x] Scoring module (scoring.js)
  - [x] NES scoring table (40/100/300/1200 × level)
  - [x] Soft drop scoring (1 point per cell)
  - [x] High score tracking
  - [x] 100% test coverage
- [x] Level module (level.js)
  - [x] Level progression (every 10 lines)
  - [x] Level affects gravity speed
  - [x] Level select support
  - [x] 100% test coverage

## SUMMARY

**Total Tests:** 386 tests passing
**Overall Coverage:** 99.3% lines, 99.34% statements, 98.62% branches, 100% functions
**New Domain Modules:** 4 (das.js, lock.js, scoring.js, level.js)
**New Test Files:** 4 (das.test.js, lock.test.js, scoring.test.js, level.test.js)

**Files with 100% coverage:**
- board.js
- collision.js
- gravity.js
- level.js
- piece.js
- randomizer.js
- rotation.js
- scoring.js

**Files with near-100% coverage:**
- das.js (97.87%) - one defensive line (234)
- lock.js (96.96%) - one defensive line (67)

**Key Features Implemented:**
1. NES DAS (Delayed Auto Shift) with 16-frame delay and 6-frame auto-repeat
2. Immediate piece locking (no lock delay)
3. NES scoring system with level multipliers
4. Level progression every 10 lines
5. Soft drop scoring (1 point per cell)
6. High score tracking
7. Pure domain logic (immutable, functional)
