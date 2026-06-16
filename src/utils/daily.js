// Simple seedable pseudo-random number generator (LCG)
export function getSeededRandom(seed) {
  const m = 0x80000000; // 2**31
  const a = 1103515245;
  const c = 12345;
  
  let state = seed ? seed : Math.floor(Math.random() * m);
  
  return function() {
    state = (a * state + c) % m;
    return state / (m - 1);
  };
}

// Generate a seed integer from a YYYY-MM-DD date string
export function getSeedFromDate(dateStr) {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Get the date string in YYYY-MM-DD UTC format
export function getTodayDateString() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get the daily character based on UTC date
export function getDailyCharacter(characters, dateStr) {
  const seed = getSeedFromDate(dateStr);
  const random = getSeededRandom(seed);
  // Pick an index deterministically
  const index = Math.floor(random() * characters.length);
  return characters[index];
}

// LocalStorage helpers for Daily Mode
export function loadDailyState(dateStr) {
  const data = localStorage.getItem(`ds3dl_daily_${dateStr}`);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error("Error parsing daily state", e);
    }
  }
  return {
    date: dateStr,
    guesses: [],
    won: false,
    finished: false
  };
}

export function saveDailyState(dateStr, state) {
  localStorage.setItem(`ds3dl_daily_${dateStr}`, JSON.stringify(state));
}

// LocalStorage helpers for Infinite Mode
export function loadInfiniteState() {
  const data = localStorage.getItem('ds3dl_infinite_state');
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error("Error parsing infinite state", e);
    }
  }
  return {
    targetCharacter: null,
    guesses: [],
    won: false,
    finished: false
  };
}

export function saveInfiniteState(state) {
  localStorage.setItem('ds3dl_infinite_state', JSON.stringify(state));
}

// Statistics helpers
export function loadStats() {
  const data = localStorage.getItem('ds3dl_stats');
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error("Error parsing stats", e);
    }
  }
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessesDist: [0, 0, 0, 0, 0, 0, 0] // 1 guess, 2 guesses ... up to 6, and 7+
  };
}

export function saveStats(stats) {
  localStorage.setItem('ds3dl_stats', JSON.stringify(stats));
}

export function updateStats(isWon, guessCount) {
  const stats = loadStats();
  stats.gamesPlayed += 1;
  
  if (isWon) {
    stats.gamesWon += 1;
    stats.currentStreak += 1;
    if (stats.currentStreak > stats.maxStreak) {
      stats.maxStreak = stats.currentStreak;
    }
    
    const distIndex = Math.min(guessCount - 1, 6);
    stats.guessesDist[distIndex] = (stats.guessesDist[distIndex] || 0) + 1;
  } else {
    stats.currentStreak = 0;
  }
  
  saveStats(stats);
  return stats;
}
