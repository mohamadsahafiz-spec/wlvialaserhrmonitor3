# FSOS CHANGELOG

## v0.9.0 Phase 2.1 — Laser Lifecycle Engine Migration (2026-08-06)

### Added & Migrated
- **Native TypeScript Laser Lifecycle Engine (`src/utils/laserEngine.ts`)**:
  - Full deterministic lifecycle calculation formulas: continuous 24h dynamic runtime estimation, remaining operating hours, remaining days, and percentage calculations.
  - Multi-laser domain architecture: `MachineDomain` -> `LaserHeadDomain` -> lifecycle state, calibration history, and worst-state status aggregation (`ALARM` > `BASELINE_REQUIRED` > `WARNING` > `SAFE`).
  - Baseline management: `BASELINE_REQUIRED` status fallback when physical meter reading is missing.
  - Recalibration transaction logic: comparison between calculated estimated hour vs physical meter reading, deviation calculation, accuracy rating scale, and 10-entry calibration history auditing.
  - Evaluation time semantics (`getCurrentEvalTime`).
- **Persistence Adaptation (`src/utils/persistence.ts`)**:
  - Integrated `LaserEngine.normalizeMachines` into `StorageService.getMachines` to ensure multi-laser data schemas are seamlessly restored and normalized.
- **Type Definitions (`src/types/index.ts`)**:
  - Extended `LaserHead` and `Machine` interfaces with multi-laser engine domain properties and exported domain types.
- **Parity Validation Test Suite (`src/utils/laserEngine.test.ts`)**:
  - Verified 100% mathematical and behavioral parity against the source-of-truth Laser Hour Monitor.
