# DS3DL - Tech Stack Summary

The DS3DL web application is engineered as a lightweight, performant single-page application (SPA) with zero backend runtime dependencies.

---

## 1. Core Frameworks & Bundlers

* **Vue 3**: Reactive state handling using `<script setup>` SFCs. Toggles modes and sub-games seamlessly.
* **Vite v5**: Fast asset bundler and compile utility.
* **Vanilla CSS**: Employs design tokens for custom scrollbars, ember particles, and split parchment interfaces.

---

## 2. Split JSON Database

Data is split into three modular JSON files under `src/data/`:
1. **`enemies.json`**: Standard mobs and environmental enemies.
2. **`bosses.json`**: Major game bosses.
3. **`npcs.json`**: NPCs containing quotes arrays used for Game 3:
   ```json
   {
     "name": "Siegward of Catarina",
     "type": "NPC",
     "hp": 3000,
     "locations": ["Undead Settlement"],
     "quotes": [
       "Long may the sun shine!",
       "Hmm... Mmm..."
     ]
   }
   ```

---

## 3. Storage & State Management

* **`daily.js` Utilities**: Deterministic PRNG using UTC seed generation.
* **LocalStorage Keys**:
  * Daily game progress: `ds3dl_daily_[gameType]_[dateStr]`
  * Infinite game progress: `ds3dl_infinite_[gameType]_state`
  * Personal statistics: `ds3dl_stats_[gameType]`
