# DS3DL - Release Process Guide

This document outlines the step-by-step process for validating, building, and deploying new releases of the DS3DL application to public hosting via **GitHub Pages**.

---

## Step 1: Pre-Release Verification

Before deploying any changes, verify the application behavior locally:

1. Navigate to the project directory:
   ```bash
   cd ds3dl
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open the local link (typically `http://localhost:5173/`) and test:
   - **Enemies Game**: Enter a guess and verify the attribute grid colors, HP/Souls arrows, and result sharing.
   - **Bosses Game**: Switch tabs and check auto-complete suggestions.
   - **NPC Dialogue Game**: Ensure a random dialogue quote appears, that location hints display after 5 failed attempts, and that the single-column list aligns.
   - **Streak Stats**: Open the Stats Modal and verify data tracks independently for each game mode.

---

## Step 2: Update the Datasets (Optional)

If you are modifying the characters, edit the split JSON files under `src/data/`:

- [enemies.json](file:///c:/Users/miste/GitHub/ds3dl/ds3dl/src/data/enemies.json)
- [bosses.json](file:///c:/Users/miste/GitHub/ds3dl/ds3dl/src/data/bosses.json)
- [npcs.json](file:///c:/Users/miste/GitHub/ds3dl/ds3dl/src/data/npcs.json) (Ensure quotes lists are populated for any new NPCs).

---

## Step 3: Run the Production Build

Always run a local production build to catch syntax errors, missing assets, or compiler warnings:

```bash
npm run build
```

Verify that the build completes successfully and generates assets inside the `/dist` directory.

---

## Step 4: Deploying to GitHub Pages

To deploy the application to GitHub Pages, we use the pre-configured `gh-pages` deployment utility:

1. Deploy using the custom npm script:

   ```bash
   npm run deploy
   ```

   _Note: This script automatically triggers the production build (`npm run build`) before pushing the compiled assets from `dist/` directly to your `gh-pages` branch on GitHub._

2. Push all code changes (source files, configuration, documentation) to your main branch:
   ```bash
   git add .
   git commit -m "Deploying updates"
   git push origin main
   ```

---

## Step 5: Post-Release Validation

1. Open your live GitHub Pages URL (e.g., `https://AndrewMeans99.github.io/ds3dl/`).
2. Hard-refresh the browser (`Ctrl + F5` or `Cmd + Shift + R`) to bypass cached service workers and load the newest JS bundles.
3. Verify that all three game modes load and function properly in the live environment.
