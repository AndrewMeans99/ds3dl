# DS3DL - Operations Manual

This guide describes how to run, build, update, and publish the DS3DL application.

---

## 1. Prerequisites

Ensure you have **Node.js** (v20.16.0 or newer) and **npm** installed on your system.

---

## 2. Running Locally

To run the development server:

1. Navigate to the project directory:
   ```bash
   cd ds3dl
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173/` in your browser.

---

## 3. Building for Production

Compile the application into optimized, static HTML, CSS, and JS assets inside `/dist`:

```bash
npm run build
```

---

## 4. Updating the Databases

Data is separated into three JSON files under `src/data/`:

* **Enemies** (`enemies.json`) & **Bosses** (`bosses.json`):
  Follow this schema:
  ```json
  {
    "name": "Character Name",
    "type": "Enemy" | "Boss",
    "hp": 550,
    "locations": ["High Wall of Lothric"],
    "souls": 300,
    "resistances": ["Magic"],
    "weaknesses": ["Strike"]
  }
  ```

* **NPCs** (`npcs.json`):
  Must include a list of iconic vocal quotes:
  ```json
  {
    "name": "NPC Name",
    "type": "NPC",
    "hp": 100,
    "locations": ["Firelink Shrine"],
    "souls": 0,
    "resistances": ["None"],
    "weaknesses": ["Physical"],
    "quotes": [
      "Quote line one.",
      "Quote line two."
    ]
  }
  ```

---

## 5. Publishing

The static bundle in `dist/` can be hosted on free services (e.g., GitHub Pages, Cloudflare Pages, Vercel) as explained in Option A/B of this manual.
