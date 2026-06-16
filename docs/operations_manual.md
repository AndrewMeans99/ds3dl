# DS3DL - Operations Manual

This guide describes how to run, build, update, and publish the DS3DL application.

---

## 1. Prerequisites

Ensure you have **Node.js** (v20.16.0 or newer) and **npm** installed on your system.

---

## 2. Running Locally

To run the development server with Hot Module Replacement (HMR):

1. Open a terminal and navigate to the project directory:
   ```bash
   cd ds3dl
   ```
2. Install dependencies (if you haven't already):
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the URL printed in the terminal (typically `http://localhost:5173/`).

---

## 3. Building for Production

To compile the application into optimized, static HTML, CSS, and JS:

```bash
npm run build
```

This generates a `dist/` directory at the project root containing all static assets. You can serve this directory with any basic web server.

---

## 4. Updating the Character Database

To add, edit, or remove characters from the game:

1. Open [characters.json](file:///c:/Users/miste/GitHub/ds3dl/ds3dl/src/data/characters.json).
2. Maintain the following schema structure for each item:
   ```json
   {
     "name": "Character Name",
     "type": "Boss" | "NPC" | "Enemy",
     "hp": 1234,
     "locations": ["Location One", "Location Two"],
     "souls": 5000,
     "resistances": ["Slash", "Fire"],
     "weaknesses": ["Strike", "Frost"]
   }
   ```
3. Save the file. The autocomplete list and game selection pool will automatically update on the next build.

---

## 5. Publishing and Hosting

Since the app has no backend, hosting is **100% free** using static hosting services.

### Option A: GitHub Pages (Recommended)
1. Install the `gh-pages` package:
   ```bash
   npm install -D gh-pages
   ```
2. Add deploy scripts to your `package.json`:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```
3. Run the deployment script to compile and push to your `gh-pages` branch:
   ```bash
   npm run deploy
   ```

### Option B: Vercel or Cloudflare Pages
1. Connect your GitHub repository to **Vercel** or **Cloudflare Pages**.
2. Configure the build settings:
   * **Framework Preset**: Vite / Vue
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
3. Click deploy. It will rebuild automatically every time you push code updates to your main branch.
