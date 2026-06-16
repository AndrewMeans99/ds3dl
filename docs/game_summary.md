# DS3DL - Game Modes Summary

DS3DL is a client-side Wordle-like guessing game for Dark Souls III. The game is split into three separate daily challenges that reset automatically every 24 hours (UTC).

---

## 1. Game 1: Enemy Guesser
* **Target Pool**: Handpicked standard Dark Souls III enemies (e.g., Lothric Knight, Silver Knight, Darkwraith).
* **Game Mechanics**: Players guess characters using autocomplete and receive dynamic color-coded feedback on six key attributes: Type, HP, Locations, Souls dropped, Resistances, and Weaknesses.
* **Clues**: High/low arrows guide guesses for HP and Souls. Overlap statuses (Green = Exact, Yellow = Partial, Red = None) guide guesses for lists.

---

## 2. Game 2: Boss Guesser
* **Target Pool**: All major Dark Souls III bosses (e.g., Soul of Cinder, Slave Knight Gael, Sister Friede).
* **Game Mechanics**: Identical comparative attribute grid checks as the Enemy Guesser, scaled for boss stats.

---

## 3. Game 3: NPC Dialogue Guesser
* **Target Pool**: Key questline and vendor NPCs in Firelink Shrine and beyond.
* **Game Mechanics**: Players read a deterministic, daily-seeded voice quote from the target NPC.
* **Hints**: Guess history displays names and correctness. **If a player guesses incorrectly 5 times, a Hint card is revealed showing the target NPC's Location(s).**

---

## Shared Features
* **Infinite Play**: Switch any game into Infinite Mode to practice random characters from that category.
* **Stats Tracking**: Streaks and attempt distributions are saved and tracked independently for each of the three challenges in the browser's `localStorage`.
