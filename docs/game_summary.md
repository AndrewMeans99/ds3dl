# DS3DL - Game Modes Summary

DS3DL is a client-side Wordle-like guessing game for Dark Souls III characters, bosses, and enemies. The game features two distinct modes.

---

## 1. Daily Challenge

In the Daily Challenge, all players worldwide receive the exact same target character for the day.

### How it Works
* **Zero-Server Selection**: Rather than calling an API database, the game determines the character of the day using a deterministic pseudo-random number generator (PRNG) implemented in Javascript.
* **UTC Sourced Seed**: The system hashes the current UTC date string (`YYYY-MM-DD`) into a 32-bit integer seed. This seed is passed to a Linear Congruential Generator (LCG) to select the character index from the dataset.
* **Midnight Reset**: The challenge resets automatically at midnight UTC when the date string changes.
* **Daily Persistence**: Guesses, game progress, and win states are saved in `localStorage` keyed by the date string. Refreshing the browser preserves the active daily progress without resetting.
* **Streaks and Strengths**: Wins are integrated into the player's personal statistics card, calculating total plays, win percentage, guess distributions, and active streaks.

---

## 2. Infinite Play

Infinite Play allows players to practice or play through random characters without limit.

### How it Works
* **Random Picking**: The system uses `Math.random()` to pick any character from the dataset.
* **Isolated Progress**: State is saved under a separate namespace in local storage so that practicing in Infinite Play doesn't overwrite or conflict with the active Daily Challenge state.
* **Next Round**: When players guess correctly or exhaust their attempt, they can hit **Next Character** to trigger a new random round.
