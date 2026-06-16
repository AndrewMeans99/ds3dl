# DS3DL - Tech Stack Summary

The DS3DL web application is engineered as a lightweight, performant single-page application (SPA) with zero backend runtime dependencies. This architectural choice makes hosting completely free and simple.

---

## 1. Core Frameworks & Bundlers

* **Vue 3**: Implemented using Vue 3 Single File Components (SFC) with the modern `<script setup>` syntax for reactive state management, autocomplete lists, and modal overlays.
* **Vite v5**: Utilized for asset compiling, Hot Module Replacement (HMR) during development, and building optimized static production bundles.
* **Vanilla CSS**: Global styling sheets with CSS variables to handle the Dark Souls theme tokens (charcoal background, gold text, amber glows, and responsive grids).

---

## 2. Icons & Typography

* **Lucide Vue**: Vector icon library (`@lucide/vue`) for clean iconography (stats, instructions, share, refresh, close).
* **Google Fonts**:
  * **Cinzel**: Used for headings and title states to capture the gothic/fantasy aesthetic of the Dark Souls series.
  * **Inter**: Used for high-readability body text, tables, and statistics.

---

## 3. Data & Storage Model

* **Offline JSON Dataset** (`src/data/characters.json`): Stores the name, HP pool, type classification (Boss, NPC, Enemy), location lists, soul drops, resistances, and weaknesses for all characters.
* **Seeded PRNG** (`src/utils/daily.js`): Uses a Linear Congruential Generator (LCG) algorithm to ensure deterministic date-based selections.
* **Browser localStorage**: Saves game state and lifetime statistics directly on the client's browser, eliminating the need for accounts or dynamic databases.
